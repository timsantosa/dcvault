import React from 'react'
import AccountCard from './account-card.jsx'

// Two half-width donut charts on the admin page, sharing one quarter filter:
// registrations by facility (where the filter lives) and by membership.
// Styles in account-redesign.css (.acct-pie*).

// Same validated categorical slots as registration-chart.jsx. Each value has
// a fixed slot (color follows the value, never its rank), and slices are
// drawn in slot order so neighbors are the validated adjacent pairs.
const SLOTS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6']
const OTHER_COLOR = '#c4c8cf'

const FACILITY_SERIES = [
  {key: 'dcv', label: 'DC Vault', color: SLOTS[0]},
  {key: 'prep', label: 'Georgetown Prep', color: SLOTS[1]},
  {key: 'dcvprep', label: 'Flexible (DCV + Prep)', color: SLOTS[2]},
  {key: 'wtr', label: 'WTR', color: SLOTS[3]},
  {key: 'va', label: 'Virginia', color: SLOTS[4]},
  {key: 'balt', label: 'Baltimore', color: SLOTS[5]}
]

// Only class-count packages (+ Unlimited) are charted. Everything else is
// left out entirely: drop-in / private lessons ("none"), summer camp, and
// legacy "adult" (adult registrations saved before the membership fix, whose
// class count was never recorded).
const MEMBERSHIP_SERIES = [
  {key: '2classes', label: '2 Classes', color: SLOTS[0]},
  {key: '4classes', label: '4 Classes', color: SLOTS[1]},
  {key: '8classes', label: '8 Classes', color: SLOTS[2]},
  {key: '15classes', label: '15 Classes', color: SLOTS[3]},
  {key: '30classes', label: 'Unlimited', color: SLOTS[4]}
]

const OTHER_KEY = '__other__'
const SEASONS = ['spring', 'summer', 'fall', 'winter']

function seasonOf (quarter) {
  let q = String(quarter || '').toLowerCase()
  for (let i = 0; i < SEASONS.length; i++) {
    if (q.indexOf(SEASONS[i]) !== -1) {
      return SEASONS[i]
    }
  }
  return q
}

// Distinct athletes per value. An athlete registered in two of the selected
// quarters counts once per quarter. Values not in `series` fold into an
// "Other" slice, or are dropped when `dropOthers` is set.
function tally (rows, field, series, dropOthers) {
  let known = {}
  series.forEach((s) => { known[s.key] = true })
  let seen = {}
  let counts = {}
  let otherMembers = {}
  rows.forEach((row) => {
    let raw = row[field] || 'none'
    if (!known[raw] && dropOthers) {
      return
    }
    let key = known[raw] ? raw : OTHER_KEY
    let athlete = row.athleteId != null ? row.athleteId : ('row-' + row.id)
    let id = key + '|' + athlete + '|' + seasonOf(row.quarter) + '|' + row.year
    if (seen[id]) {
      return
    }
    seen[id] = true
    counts[key] = (counts[key] || 0) + 1
    if (key === OTHER_KEY) {
      otherMembers[raw] = true
    }
  })

  let slices = series.filter((s) => counts[s.key]).map((s) => ({key: s.key, label: s.label, color: s.color, value: counts[s.key]}))
  if (counts[OTHER_KEY]) {
    slices.push({key: OTHER_KEY, label: 'Other', color: OTHER_COLOR, value: counts[OTHER_KEY], title: Object.keys(otherMembers).join(', ')})
  }
  let total = slices.reduce((sum, s) => sum + s.value, 0)
  return {slices: slices, total: total}
}

const SIZE = 200
const R_OUT = 96
const R_IN = 60

function point (r, angle) {
  return [SIZE / 2 + r * Math.sin(angle), SIZE / 2 - r * Math.cos(angle)]
}

function arcPath (a0, a1) {
  // a full ring can't be drawn as one arc; split it in two halves
  if (a1 - a0 >= Math.PI * 2 - 1e-6) {
    return arcPath(0, Math.PI) + arcPath(Math.PI, Math.PI * 2)
  }
  let large = a1 - a0 > Math.PI ? 1 : 0
  let p0 = point(R_OUT, a0)
  let p1 = point(R_OUT, a1)
  let p2 = point(R_IN, a1)
  let p3 = point(R_IN, a0)
  return 'M' + p0[0] + ',' + p0[1] +
    'A' + R_OUT + ',' + R_OUT + ' 0 ' + large + ' 1 ' + p1[0] + ',' + p1[1] +
    'L' + p2[0] + ',' + p2[1] +
    'A' + R_IN + ',' + R_IN + ' 0 ' + large + ' 0 ' + p3[0] + ',' + p3[1] + 'Z'
}

function pct (value, total) {
  if (!total) {
    return '0%'
  }
  let p = (value / total) * 100
  return (p < 1 && p > 0 ? '<1' : Math.round(p)) + '%'
}

class DonutChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {hover: null}
  }

  render () {
    let slices = this.props.slices
    let total = this.props.total
    let hover = this.state.hover

    if (!total) {
      return (<div className='acct-empty'>{this.props.emptyText || 'No registrations for the selected quarter.'}</div>)
    }

    let angle = 0
    let arcs = slices.map((s) => {
      let a0 = angle
      angle += (s.value / total) * Math.PI * 2
      return {slice: s, a0: a0, a1: angle}
    })
    let hovered = hover != null ? slices.filter((s) => s.key === hover)[0] : null

    return (
      <div className='acct-pie'>
        <div className='acct-pie__figure'>
          <svg width={SIZE} height={SIZE} viewBox={'0 0 ' + SIZE + ' ' + SIZE} role='img' aria-label={this.props.ariaLabel}>
            {arcs.map((a) => (
              <path key={a.slice.key} d={arcPath(a.a0, a.a1)} fill={a.slice.color}
                className='acct-pie__slice'
                style={{opacity: hover && hover !== a.slice.key ? 0.3 : 1}}
                onMouseEnter={() => { this.setState({hover: a.slice.key}) }}
                onMouseLeave={() => { this.setState({hover: null}) }} />
            ))}
            <text x={SIZE / 2} y={SIZE / 2 - 4} textAnchor='middle' className='acct-pie__center-value'>
              {hovered ? hovered.value : total}
            </text>
            <text x={SIZE / 2} y={SIZE / 2 + 18} textAnchor='middle' className='acct-pie__center-label'>
              {hovered ? pct(hovered.value, total) : 'athletes'}
            </text>
          </svg>
        </div>
        <ul className='acct-pie__legend'>
          {slices.map((s) => (
            <li key={s.key} title={s.title || ''}
              className={hover && hover !== s.key ? 'acct-pie__legend-item--dim' : ''}
              onMouseEnter={() => { this.setState({hover: s.key}) }}
              onMouseLeave={() => { this.setState({hover: null}) }}>
              <span className='acct-chart__swatch' style={{backgroundColor: s.color}} />
              <span className='acct-pie__legend-label'>{s.label}</span>
              <span className='acct-pie__legend-value'>{s.value}</span>
              <span className='acct-pie__legend-pct'>{pct(s.value, total)}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

class RegistrationBreakdown extends React.Component {
  constructor (props) {
    super(props)
    // one quarter at a time: 'current' or 'upcoming'; the membership chart
    // can also be narrowed to one facility ('all' = every facility)
    this.state = {quarter: 'current', facility: 'all'}
  }

  render () {
    let upcoming = this.state.quarter === 'upcoming'
    let rows = (upcoming ? this.props.upcomingData : this.props.currentData) || []
    let showing = upcoming
      ? 'Upcoming Quarter (' + this.props.upcomingLabel + ')'
      : 'Current Quarter (' + this.props.currentLabel + ')'

    let facility = tally(rows, 'facility', FACILITY_SERIES)

    // Facility options = facilities with registrations in the selected
    // quarter, in the facility chart's order. If the chosen facility has none
    // after switching quarters, fall back to all facilities.
    let present = {}
    rows.forEach((row) => { if (row.facility) { present[row.facility] = true } })
    let facilityOptions = FACILITY_SERIES.filter((s) => present[s.key])
    Object.keys(present).forEach((key) => {
      if (!facilityOptions.some((s) => s.key === key)) {
        facilityOptions.push({key: key, label: key})
      }
    })
    let selectedFacility = present[this.state.facility] ? this.state.facility : 'all'
    let facilityRows = selectedFacility === 'all' ? rows : rows.filter((row) => row.facility === selectedFacility)
    let selectedLabel = selectedFacility === 'all'
      ? 'All facilities'
      : facilityOptions.filter((s) => s.key === selectedFacility)[0].label

    let membership = tally(facilityRows, 'membership', MEMBERSHIP_SERIES, true)

    return (
      <div className='acct-grid acct-grid--halves'>
        <AccountCard title='By Facility'>
          <div className='acct-filters'>
            <span className='acct-filters__label'>Show</span>
            <label className='acct-chip'>
              <input type='radio' name='breakdown-quarter' checked={!upcoming} onChange={() => { this.setState({quarter: 'current'}) }} />
              <span>Current Quarter</span>
            </label>
            <label className='acct-chip'>
              <input type='radio' name='breakdown-quarter' checked={upcoming} onChange={() => { this.setState({quarter: 'upcoming'}) }} />
              <span>Upcoming Quarter</span>
            </label>
          </div>
          <DonutChart slices={facility.slices} total={facility.total}
            ariaLabel={'Donut chart of registered athletes by facility, ' + showing} />
        </AccountCard>

        <AccountCard title='By Membership'>
          <p className='acct-pie__showing'>
            <span className='acct-filters__label'>Showing</span> {showing}
          </p>
          <div className='acct-filters'>
            <span className='acct-filters__label'>Facility</span>
            <label className='acct-chip'>
              <input type='radio' name='breakdown-facility' checked={selectedFacility === 'all'} onChange={() => { this.setState({facility: 'all'}) }} />
              <span>All</span>
            </label>
            {facilityOptions.map((s) => (
              <label key={s.key} className='acct-chip'>
                <input type='radio' name='breakdown-facility' checked={selectedFacility === s.key} onChange={() => { this.setState({facility: s.key}) }} />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
          <DonutChart slices={membership.slices} total={membership.total}
            emptyText={'No class-package registrations for ' + (selectedFacility === 'all' ? 'the selected quarter' : selectedLabel + ' in the selected quarter') + '.'}
            ariaLabel={'Donut chart of registered athletes by class package, ' + showing + ', ' + selectedLabel} />
        </AccountCard>
      </div>
    )
  }
}

export default RegistrationBreakdown
