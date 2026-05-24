'use strict'

var catalog = require('./catalog.json')
var MULT = catalog.processingFeeMultiplier

function poleTotalString(baseUsd) {
  var n = Number((Number(baseUsd) * MULT).toFixed(2))
  return n.toFixed(2)
}

function formatTwo(s) {
  var n = Number(s)
  if (!isFinite(n)) return '0.00'
  return n.toFixed(2)
}

function computeTrainingPackageBaseUsd(sp) {
  if (!sp || !sp.group) {
    throw new Error('Missing selectPackage.group')
  }
  var group = sp.group
  var membership = sp.membership
  var fkmembership = sp.fkmembership
  var fk = catalog.training.flyKidsUsd
  var t = catalog.training

  var price
  if (group === 'fly-kids') {
    if (fkmembership === '8classes') price = fk['8classes']
    else if (fkmembership === '2classes') price = fk['2classes']
    else if (fkmembership === '15classes') price = fk['15classes']
    else if (fkmembership === 'summercamp') price = fk.summercamp
    else price = fk.default
  } else if (group === 'dropin') price = t.dropinUsd
  else if (group === 'plesson') price = t.privateLessonUsd
  else if (group === 'adult') {
    price = membership === '2classes' ? t.adultUsd['2classes'] : t.adultUsd.default
  } else if (group === 'elite' || group === 'professional') {
    price = 0
  } else if (group === 'allages') {
    var aa = t.allAgesUsd
    if (membership === '4classes') price = aa['4classes']
    else if (membership === '8classes') price = aa['8classes']
    else if (membership === '15classes') price = aa['15classes']
    else if (membership === '30classes') price = aa['30classes']
    else price = aa.default
  } else {
    price = t.defaultGroupUsd
  }
  return price
}

/** Subtotal before the processing multiplier (does not multiply by MULT). */
function computeTrainingSubtotalUsd(purchaseInfo, serverNow) {
  if (!serverNow) serverNow = new Date()
  var sp = purchaseInfo && purchaseInfo.selectPackage
  if (!sp || !sp.group) {
    throw new Error('Missing selectPackage.group')
  }

  var price = computeTrainingPackageBaseUsd(sp)

  var quarter = sp.quarter
  var month = serverNow.getMonth() + 1
  var lateFee = 0
  if (quarter === 'winter' && (month === 12 || month === 1 || month === 2)) {
    lateFee = 0
  } else if (quarter === 'spring' && (month === 3 || month === 4 || month === 5)) {
    lateFee = 0
  } else if (quarter === 'summer' && (month === 6 || month === 7 || month === 8)) {
    lateFee = 0
  } else if (quarter === 'fall' && (month === 9 || month === 10 || month === 11)) {
    lateFee = 0
  }
  var discount =
    purchaseInfo._resolvedDiscountAmount != null ? purchaseInfo._resolvedDiscountAmount : 0

  var sub = price * (1 - discount)
  if (sub < 10) sub = 1
  sub += lateFee
  var apparelRes = sp.yesApparel
  var mem = sp.membership
  var apparelUsd = catalog.training.apparelAddonUsd
  if (apparelRes !== 'none' && mem !== 'summercamp') {
    sub += apparelUsd
  }
  return sub
}

function parseEventItems(dates1) {
  if (!dates1 || typeof dates1 !== 'string') return []
  return dates1.split(',').map(function (s) { return s.trim() }).filter(Boolean)
}

/** Event checkout subtotal before processing multiplier */
function computeEventCheckoutSubtotalUsd(athleteInfo) {
  var price = 0
  var items = parseEventItems(athleteInfo.dates1)
  var ei = catalog.events.items
  for (var i = 0; i < items.length; i++) {
    var item = items[i]
    if (item === 'pvchamps26') {
      if (athleteInfo.memberdisc === 'dcvault-member' || athleteInfo.elitedisc === 'elite') {
        price += ei.pvchamps26MemberOrEliteUsd
      } else {
        price += ei.pvchamps26StandardUsd
      }
    } else if (item === 'family-pv-experience') {
      price += ei.familyPvExperienceUsd
    } else if (item === 'spring-fling-urself') {
      price += ei.springFlingUrselfUsd
    } else if (item.indexOf('afterparty-') === 0) {
      var ticketStr = item.split('-')[1]
      var n = parseInt(ticketStr, 10)
      price += (isFinite(n) ? n : 0) * ei.afterpartyPerTicketUsd
    } else if (item === 'eventbag') {
      price += ei.eventbagUsd
    }
  }
  return price
}

/** Competition subtotal before processing multiplier */
function computeCompetitionCheckoutSubtotalUsd(athleteInfo) {
  var price = 0
  var numWeeks = 0
  var c = catalog.competition
  if (athleteInfo.dates1) {
    price += c.week1Usd
    numWeeks += 1
  }
  if (athleteInfo.dates2) {
    price += c.week2Usd
    numWeeks += 1
  }
  if (athleteInfo.dates3) {
    price += c.week2345Usd
    numWeeks += 1
  }
  if (athleteInfo.dates4) {
    price += c.week2345Usd
    numWeeks += 1
  }
  if (athleteInfo.dates5) {
    price += c.week2345Usd
    numWeeks += 1
  }
  if (athleteInfo.dates6) price += c.addonUsd
  if (athleteInfo.dates7) price += c.addonUsd
  if (athleteInfo.dates8) price += c.addonUsd
  if (athleteInfo.dates9) price += c.addonUsd
  if (athleteInfo.dates10) price += c.addonUsd
  if (numWeeks >= c.multiWeekMinimumWeeks) price = c.multiWeekBundleUsd
  return price
}

function amountsMatchCaptured(captureBody, expectedUsd) {
  var expected = Number(expectedUsd)
  if (!isFinite(expected)) return false
  var cap =
    captureBody && captureBody.amount && captureBody.amount.value
      ? Number(captureBody.amount.value)
      : NaN
  if (!isFinite(cap)) return false
  return Math.abs(cap - expected) < 0.02
}

var poleBase = catalog.pole
var POLE_QUARTERLY_TOTAL_USD = poleTotalString(poleBase.quarterlyBaseUsd)
var POLE_48H_TOTAL_USD = poleTotalString(poleBase.oneTime48hBaseUsd)

module.exports = {
  catalog: catalog,
  processingFeeMultiplier: MULT,
  trainingApparelAddonUsd: catalog.training.apparelAddonUsd,
  computeTrainingPackageBaseUsd: computeTrainingPackageBaseUsd,
  computeTrainingSubtotalUsd: computeTrainingSubtotalUsd,
  computeEventCheckoutSubtotalUsd: computeEventCheckoutSubtotalUsd,
  computeCompetitionCheckoutSubtotalUsd: computeCompetitionCheckoutSubtotalUsd,
  POLE_QUARTERLY_TOTAL_USD: POLE_QUARTERLY_TOTAL_USD,
  POLE_48H_TOTAL_USD: POLE_48H_TOTAL_USD,
  poleQuarterlyBaseUsd: poleBase.quarterlyBaseUsd,
  poleOneTime48hBaseUsd: poleBase.oneTime48hBaseUsd,
  amountsMatchCaptured: amountsMatchCaptured,
  formatTwo: formatTwo,

  poleTotalUsdChargedNumber: function (period) {
    var base =
      period === 'quarterly'
        ? poleBase.quarterlyBaseUsd
        : poleBase.oneTime48hBaseUsd
    return Number((Number(base) * MULT).toFixed(2))
  },
}
