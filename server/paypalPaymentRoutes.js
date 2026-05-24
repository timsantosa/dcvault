'use strict'

const config = require('./config/config')
const paypalClient = require('./lib/paypalClient')
const pricing = require('./lib/pricing')
const {
  assertCaptureMatchesFlow,
  firstCompletedCaptureBody,
} = require('./lib/paypalPaymentVerify')

function paypalCfg() {
  const p = config.paypal || {}
  return {
    clientId: process.env.PAYPAL_CLIENT_ID || p.clientId || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || p.clientSecret || '',
    apiBase:
      process.env.PAYPAL_API_BASE ||
      p.apiBase ||
      'https://api-m.sandbox.paypal.com',
  }
}

async function computeExpectedUsdForFlow(flow, db, reqBody) {
  switch (flow) {
    case 'registration':
      if (!reqBody.purchaseInfo) throw new Error('purchaseInfo required')
      return pricing.expectedRegistrationTotalUsd(db, reqBody.purchaseInfo)
    case 'event_registration':
      if (!reqBody.purchaseInfo || !reqBody.purchaseInfo.athleteInfo) {
        throw new Error('purchaseInfo.athleteInfo required')
      }
      return pricing.expectedEventRegistrationTotalUsd(reqBody.purchaseInfo.athleteInfo)
    case 'compete':
      if (!reqBody.purchaseInfo || !reqBody.purchaseInfo.athleteInfo) {
        throw new Error('purchaseInfo.athleteInfo required')
      }
      return pricing.expectedCompetitionTotalUsd(reqBody.purchaseInfo.athleteInfo)
    case 'pole_quarterly':
      return pricing.POLE_QUARTERLY_TOTAL_USD
    case 'pole_48h':
      return pricing.POLE_48H_TOTAL_USD
    default:
      throw new Error('Unknown flow')
  }
}

async function validateClientAmount(clientAmountStr, expectedUsd) {
  const client = paypalClient.formatMoney(clientAmountStr)
  if (!client) throw new Error('Bad amount format')
  if (Math.abs(Number(client) - Number(expectedUsd)) >= 0.02) {
    const err = new Error('Amount mismatch')
    err.code = 'AMOUNT_MISMATCH'
    err.expectedUsd = expectedUsd
    err.clientUsd = client
    throw err
  }
}

module.exports = function registerPayPalRoutes(app, db) {
  app.post('/payments/paypal/create-order', async (req, res) => {
    try {
      const ppConfig = paypalCfg()
      const { flow, amount, currency, description, purchaseInfo } = req.body || {}

      if (!flow)
        return res.status(400).send({ ok: false, message: 'flow required' })
      if (amount === undefined || amount === null) {
        return res.status(400).send({ ok: false, message: 'amount required' })
      }

      const merged = Object.assign({}, req.body || {})
      if (purchaseInfo && merged.purchaseInfo == null)
        merged.purchaseInfo = purchaseInfo

      let expectedUsd
      try {
        expectedUsd = await computeExpectedUsdForFlow(flow, db, merged)
      } catch (e) {
        return res.status(400).send({ ok: false, message: e.message })
      }

      await validateClientAmount(amount, expectedUsd)

      const orderID = await paypalClient.createOrder(ppConfig, {
        amount: expectedUsd,
        currency: currency || 'USD',
        description: (description || 'DC Vault ' + flow).slice(0, 127),
      })
      res.send({ ok: true, orderID })
    } catch (e) {
      if (e.code === 'PAYPAL_NOT_CONFIGURED' || e.code === 'AMOUNT_MISMATCH') {
        const body = {
          ok: false,
          message: e.message,
          expectedUsd: e.expectedUsd,
          clientUsd: e.clientUsd,
        }
        if (e.code === 'PAYPAL_NOT_CONFIGURED') {
          body.hint =
            'The browser only has a public client id; the server needs the REST client id + secret.'
        }
        return res.status(400).send(body)
      }
      console.error('[PayPal create-order]', e.message, e.body || '')
      res.status(500).send({ ok: false, message: 'PayPal error' })
    }
  })

  app.post('/payments/paypal/capture-order', async (req, res) => {
    try {
      const cfg = paypalCfg()
      const orderID = req.body.orderID || req.body.orderId
      const flow = req.body.flow

      if (!orderID || !flow) {
        return res.status(400).send({ ok: false, message: 'orderID and flow required' })
      }
      const needsPi =
        flow === 'registration' || flow === 'event_registration' || flow === 'compete'
      if (needsPi && !req.body.purchaseInfo) {
        return res.status(400).send({ ok: false, message: 'purchaseInfo required' })
      }

      const captureResponse = await paypalClient.captureOrder(cfg, orderID)
      const capBody = firstCompletedCaptureBody(captureResponse)
      await assertCaptureMatchesFlow(flow, capBody, db, req.body)

      const paypalCaptureId = capBody && capBody.id
      res.send({
        ok: true,
        orderID,
        paypalOrderId:
          (captureResponse && captureResponse.id) || orderID,
        paypalCaptureId,
      })
    } catch (e) {
      if (e.code === 'CAPTURE_AMOUNT_MISMATCH')
        console.error('[PayPal capture-order]', e.message)
      else console.error('[PayPal capture-order]', e.message, e.body || '')
      res.status(500).send({ ok: false, message: 'PayPal capture failed' })
    }
  })
}

module.exports.paypalCfg = paypalCfg
