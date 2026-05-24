'use strict'

var dcPricing = require('../../pricing/index.js')

function formatTwo(s) {
  return dcPricing.formatTwo(s)
}

async function resolveDiscountFraction(db, discountCode) {
  if (!discountCode) return 0
  var row = await db.tables.Discounts.findOne({ where: { code: discountCode } })
  if (!row || row.uses === 0) {
    var err = new Error('Invalid discount')
    err.code = 'BAD_DISCOUNT'
    throw err
  }
  var amt = Number(row.amount)
  if (!isFinite(amt) || amt < 0 || amt > 1) return 0
  return amt
}

async function expectedRegistrationTotalUsd(db, purchaseInfo) {
  var pi = Object.assign({}, purchaseInfo)
  var code = purchaseInfo.payment && purchaseInfo.payment.discount
  pi._resolvedDiscountAmount = await resolveDiscountFraction(db, code)
  var sub = dcPricing.computeTrainingSubtotalUsd(pi)
  return formatTwo((sub * dcPricing.processingFeeMultiplier).toFixed(2))
}

function expectedEventRegistrationTotalUsd(athleteInfo) {
  var sub = dcPricing.computeEventCheckoutSubtotalUsd(athleteInfo)
  return formatTwo((sub * dcPricing.processingFeeMultiplier).toFixed(2))
}

function expectedCompetitionTotalUsd(athleteInfo) {
  var sub = dcPricing.computeCompetitionCheckoutSubtotalUsd(athleteInfo)
  return formatTwo((sub * dcPricing.processingFeeMultiplier).toFixed(2))
}

module.exports = {
  POLE_QUARTERLY_TOTAL_USD: dcPricing.POLE_QUARTERLY_TOTAL_USD,
  POLE_48H_TOTAL_USD: dcPricing.POLE_48H_TOTAL_USD,
  expectedRegistrationTotalUsd: expectedRegistrationTotalUsd,
  expectedEventRegistrationTotalUsd: expectedEventRegistrationTotalUsd,
  expectedCompetitionTotalUsd: expectedCompetitionTotalUsd,
  amountsMatchCaptured: dcPricing.amountsMatchCaptured,
  formatTwo: formatTwo,
  computeTrainingSubtotalUsd: dcPricing.computeTrainingSubtotalUsd,
}
