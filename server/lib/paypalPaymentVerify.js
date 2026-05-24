'use strict'

const pricing = require('./pricing')

function firstCompletedCaptureBody(captureResponse) {
  try {
    return captureResponse.purchase_units[0].payments.captures[0]
  } catch (e) {
    return null
  }
}

async function assertCaptureMatchesFlow(flow, capBody, db, payload) {
  if (!capBody || capBody.status !== 'COMPLETED') {
    throw new Error('Capture not completed')
  }
  let expectedUsd
  const pi = payload.purchaseInfo || {}
  switch (flow) {
    case 'registration':
      expectedUsd = await pricing.expectedRegistrationTotalUsd(db, pi)
      break
    case 'event_registration':
      expectedUsd = pricing.expectedEventRegistrationTotalUsd(pi.athleteInfo || {})
      break
    case 'compete':
      expectedUsd = pricing.expectedCompetitionTotalUsd(pi.athleteInfo || {})
      break
    case 'pole_quarterly':
      expectedUsd = pricing.POLE_QUARTERLY_TOTAL_USD
      break
    case 'pole_48h':
      expectedUsd = pricing.POLE_48H_TOTAL_USD
      break
    default:
      throw new Error('Unknown paypal flow')
  }
  if (!pricing.amountsMatchCaptured(capBody, expectedUsd)) {
    const err = new Error('Captured amount mismatch')
    err.code = 'CAPTURE_AMOUNT_MISMATCH'
    throw err
  }
}

module.exports = {
  firstCompletedCaptureBody,
  assertCaptureMatchesFlow,
}
