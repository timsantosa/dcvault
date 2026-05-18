'use strict'

const https = require('https')
const qs = require('querystring')

let cachedToken = null
let tokenExpiresAt = 0

function paypalRequest(hostname, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      Object.assign({}, options, {
        hostname,
        rejectUnauthorized: true,
      }),
      (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          let parsed = null
          try {
            parsed = data ? JSON.parse(data) : null
          } catch (e) {
            parsed = data
          }
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, body: parsed })
          } else {
            const err = new Error('PayPal API error ' + res.statusCode)
            err.status = res.statusCode
            err.body = parsed
            reject(err)
          }
        })
      }
    )
    req.on('error', reject)
    if (options.body != null) {
      req.write(options.body)
    }
    req.end()
  })
}

function getHostFromBase(apiBase) {
  const u = apiBase.replace(/^https?:\/\//, '')
  return u.split('/')[0]
}

async function getAccessToken(paypalConfig) {
  if (!paypalConfig.clientId || !paypalConfig.clientSecret) {
    const err = new Error(
      'PayPal REST credentials missing. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in the Node process environment (sandbox app secret from developer.paypal.com). For Sandbox use PAYPAL_API_BASE=https://api-m.sandbox.paypal.com.'
    )
    err.code = 'PAYPAL_NOT_CONFIGURED'
    throw err
  }
  const now = Date.now()
  if (cachedToken && now < tokenExpiresAt - 60000) {
    return cachedToken
  }
  const host = getHostFromBase(paypalConfig.apiBase)
  const auth = Buffer.from(
    paypalConfig.clientId + ':' + paypalConfig.clientSecret,
    'utf8'
  ).toString('base64')
  const body = qs.stringify({ grant_type: 'client_credentials' })
  const res = await paypalRequest(host, {
    method: 'POST',
    path: '/v1/oauth2/token',
    headers: {
      Authorization: 'Basic ' + auth,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
    body,
  })
  cachedToken = res.body.access_token
  tokenExpiresAt = now + (res.body.expires_in || 300) * 1000
  return cachedToken
}

async function paypalJson(paypalConfig, method, path, bodyObj) {
  const token = await getAccessToken(paypalConfig)
  const host = getHostFromBase(paypalConfig.apiBase)
  const headers = {
    Authorization: 'Bearer ' + token,
  }
  let payload = null
  if (bodyObj != null) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(bodyObj)
    headers['Content-Length'] = Buffer.byteLength(payload)
  }
  return paypalRequest(host, {
    method,
    path,
    headers,
    body: payload != null ? payload : undefined,
  })
}

function formatMoney(value) {
  const n = Number(value)
  if (!isFinite(n)) return null
  return n.toFixed(2)
}

async function createOrder(paypalConfig, { amount, currency, description }) {
  const value = formatMoney(amount)
  if (!value || Number(value) < 0.01) {
    const err = new Error('Invalid amount')
    err.code = 'INVALID_AMOUNT'
    throw err
  }
  const desc = (description || 'DC Vault').slice(0, 127)
  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency || 'USD',
          value,
        },
        description: desc,
      },
    ],
  }
  const res = await paypalJson(paypalConfig, 'POST', '/v2/checkout/orders', payload)
  const id = res.body && res.body.id
  if (!id) {
    const err = new Error('PayPal returned no order id')
    err.body = res.body
    throw err
  }
  return id
}

async function captureOrder(paypalConfig, orderId) {
  const path = `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`
  const res = await paypalJson(paypalConfig, 'POST', path, {})
  return res.body
}

async function getCapture(paypalConfig, captureId) {
  const path = `/v2/payments/captures/${encodeURIComponent(captureId)}`
  const res = await paypalJson(paypalConfig, 'GET', path, null)
  return res.body
}

module.exports = {
  getAccessToken,
  createOrder,
  captureOrder,
  getCapture,
  formatMoney,
}
