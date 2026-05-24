'use strict'

const axios = window.axios

function payPalPublicClientId() {
  const v = window.configVariables || {}
  const mode = (v.PAYPAL_MODE || 'sandbox').toLowerCase()
  if (mode === 'production' || mode === 'live') {
    return v.PAYPAL_CLIENT_ID || ''
  }
  return v.PAYPAL_SANDBOX_ID || v.PAYPAL_CLIENT_ID || ''
}

let paypalSdkPromise = null

function ensurePayPalSdkLoaded () {
  if (window.paypal && window.paypal.Buttons) {
    return Promise.resolve(window.paypal)
  }
  if (paypalSdkPromise) return paypalSdkPromise
  const clientId = payPalPublicClientId()
  if (!clientId) {
    paypalSdkPromise = Promise.reject(new Error('PayPal client id missing (configVariables)'))
    return paypalSdkPromise
  }
  paypalSdkPromise = new Promise(function (resolve, reject) {
    const prev = document.getElementById('paypal-checkout-sdk')
    if (prev) prev.remove()
    const s = document.createElement('script')
    s.id = 'paypal-checkout-sdk'
    s.async = true
    var sdkParams = new URLSearchParams({
      'client-id': clientId,
      currency: 'USD',
      'enable-funding': 'venmo,applepay',
    })
    s.src = 'https://www.paypal.com/sdk/js?' + sdkParams.toString()
    s.onload = function () {
      if (window.paypal && window.paypal.Buttons) resolve(window.paypal)
      else reject(new Error('PayPal SDK did not expose Buttons'))
    }
    s.onerror = function () {
      reject(new Error('Failed loading PayPal SDK'))
    }
    document.head.appendChild(s)
  })
  return paypalSdkPromise
}

function clearContainer(selector) {
  var el = document.querySelector(selector)
  if (!el) return
  while (el.firstChild) el.removeChild(el.firstChild)
}

/** Mount Smart Buttons; clears container first. Calls onPaid({ paypalOrderId, paypalCaptureId }) after server capture */
function renderHostedButtons (selector, options) {
  var flow = options.flow
  var amountUsd = options.amountUsd
  var description = options.description || 'DC Vault'
  var purchaseInfoGetter = options.getPurchaseInfoPayload

  clearContainer(selector)
  var el = document.querySelector(selector)
  if (!el) {
    return Promise.reject(new Error('PayPal container not found: ' + selector))
  }

  var amountStr =
    typeof amountUsd === 'number'
      ? amountUsd.toFixed(2)
      : String(amountUsd)

  function purchasePayload () {
    return purchaseInfoGetter ? purchaseInfoGetter() : null
  }

  return ensurePayPalSdkLoaded()
    .then(function (paypalSdk) {
      return paypalSdk
        .Buttons({
          style: {
            layout: 'vertical',
            shape: 'rect',
            color: 'silver',
            label: 'pay',
          },

          createOrder: function () {
            var pi = purchasePayload()
            var body = {
              flow,
              amount: amountStr,
              currency: 'USD',
              description: description.slice(0, 120),
              purchaseInfo: pi,
            }
            return axios
              .post('/payments/paypal/create-order', body)
              .then(function (r) {
                if (!(r.data && r.data.ok && r.data.orderID)) {
                  throw new Error(
                    (r.data && r.data.message) ||
                      'Unable to create PayPal order'
                  )
                }
                return r.data.orderID
              })
          },

          onApprove: function (data) {
            var pi = purchasePayload()
            return axios
              .post('/payments/paypal/capture-order', {
                orderID: data.orderID,
                flow,
                purchaseInfo: pi,
              })
              .then(function (r) {
                if (!(r.data && r.data.ok)) {
                  throw new Error(
                    (r.data && r.data.message) || 'Capture failed'
                  )
                }
                if (typeof options.onPaid === 'function') {
                  options.onPaid({
                    paypalOrderId: r.data.paypalOrderId,
                    paypalCaptureId: r.data.paypalCaptureId,
                  })
                }
              })
          },

          onError: function (err) {
            if (typeof options.onError === 'function') options.onError(err)
          },
        })
        .render(el)
    })
    .catch(function (err) {
      clearContainer(selector)
      if (typeof options.onError === 'function') options.onError(err)
      throw err
    })
}

module.exports = {
  payPalPublicClientId,
  ensurePayPalSdkLoaded,
  clearContainer,
  renderHostedButtons,
}

