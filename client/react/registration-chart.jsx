import React from 'react'

// Stacked bar chart of registered athletes per training quarter, broken down
// by group, with a line for average classes per athlete on a right-hand axis.
// Plain SVG (no chart library); styles in account-redesign.css.
//
// Quarters run spring -> summer -> fall -> winter within a "quarter year":
// winter YYYY is Dec YYYY - Feb YYYY+1 (same convention as getFullQuarter /
// apiHelpers.getNextFullQuarter), so it sorts after fall YYYY.

const SEASONS = ['spring', 'summer', 'fall', 'winter']
const SEASON_LABELS = {spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter'}

// Categorical slots in fixed order (validated: adjacent-pair CVD/normal-vision
// separation on a white surface). Three slots sit under 3:1 contrast, which is
// why the chart ships a table view. Groups past slot 7 fold into "Other".
const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6']
const OTHER_COLOR = '#9ca3af'
const OTHER_KEY = '__other__'

const GROUP_LABELS = {
  'fly-kids': 'Fly-Kids',
  'dropin': 'Drop-In',
  'adult': 'Adult',
  'plesson': 'Private Lesson',
  'allages': 'All Ages',
  'emerging-elite': 'Emerging Elite',
  'elite': 'Elite',
  'professional': 'Professional',
  'beginner-intermediate': 'Beginner/Intermediate',
  'beginner': 'Beginner',
  'intermediate': 'Intermediate',
  'youth': 'Youth'
}

const DEFAULT_RANGE = 8 // quarters shown before the user picks a range

const MARGIN = {top: 28, right: 44, bottom: 44, left: 44}
const PLOT_HEIGHT = 260
const GAP = 2 // surface gap between stacked segments

// --- Class density overlay (avg classes per athlete, right-hand axis) ---
// A quarter where fewer than this share of registrations have a usable class
// count is left as a gap rather than plotted from a small, skewed sample.
const MIN_COVERAGE = 0.5
const EXCLUDED_GROUPS = {'elite': true, 'emerging-elite': true, 'professional': true}

// Classes a registration represents, or null when it's left out:
// drop-in and private lessons = 1, "<n>classes" = n (unlimited is
// "30classes" = 30). Summer camp, the elite groups, legacy "adult" (class
// count never recorded) and the 2020-22 tier names are left out.
function classesFor (row) {
  if (EXCLUDED_GROUPS[row.group]) {
    return null
  }
  if (row.group === 'dropin' || row.group === 'plesson') {
    return 1
  }
  let match = /^(\d+)classes$/.exec(row.membership || '')
  return match ? parseInt(match[1], 10) : null
}

function fmtAvg (v) {
  return (Math.round(v * 10) / 10).toFixed(1)
}

// Right-axis ticks: same number of intervals as the left axis so both land
// on the same gridlines.
function alignedTicks (max, intervals) {
  let raw = Math.max(1, max / intervals)
  let exp = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10))
  let step = exp
  ;[1, 2, 5, 10].some((m) => {
    step = m * exp
    return step >= raw
  })
  let ticks = []
  for (let i = 0; i <= intervals; i++) {
    ticks.push(Math.round(step * i * 100) / 100)
  }
  return ticks
}

function seasonOf (quarter) {
  let q = String(quarter || '').toLowerCase()
  for (let i = 0; i < SEASONS.length; i++) {
    if (q.indexOf(SEASONS[i]) !== -1) {
      return SEASONS[i]
    }
  }
  return null
}

function quarterIndex (season, year) {
  return year * 4 + SEASONS.indexOf(season)
}

function indexToQuarter (index) {
  let year = Math.floor(index / 4)
  let season = SEASONS[index - year * 4]
  return {season: season, year: year}
}

function quarterLabel (index) {
  let q = indexToQuarter(index)
  return SEASON_LABELS[q.season] + ' ' + q.year
}

function shortQuarterLabel (index) {
  let q = indexToQuarter(index)
  return SEASON_LABELS[q.season].slice(0, 3) + " '" + String(q.year).slice(-2)
}

function groupLabel (group) {
  if (group === OTHER_KEY) {
    return 'Other'
  }
  return GROUP_LABELS[group] || group
}

// Whole-number axis: ~4 intervals with a 1/2/5 x 10^k step
function niceTicks (value) {
  let raw = Math.max(1, value / 4)
  let exp = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10))
  let step = exp
  ;[1, 2, 5, 10].some((m) => {
    step = m * exp
    return step >= raw
  })
  step = Math.max(1, Math.round(step))
  let max = Math.max(step, Math.ceil(value / step) * step)
  let ticks = []
  for (let t = 0; t <= max; t += step) {
    ticks.push(t)
  }
  return ticks
}

// Rect with only the top corners rounded (the data end of a stacked bar)
function topRoundedRect (x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h))
  return 'M' + x + ',' + (y + h) +
    'V' + (y + r) +
    'Q' + x + ',' + y + ' ' + (x + r) + ',' + y +
    'H' + (x + w - r) +
    'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) +
    'V' + (y + h) + 'Z'
}

class RegistrationChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      width: 800,
      start: null,
      end: null,
      hover: null,
      showTable: false
    }
    this.onResize = this.onResize.bind(this)
    this.prepare(props.data)
  }

  componentDidMount () {
    window.addEventListener('resize', this.onResize)
    this.onResize()
  }

  componentDidUpdate () {
    // The plot container doesn't exist until data arrives (and is re-created
    // when switching back from the table), so measure after every update.
    // onResize only sets state when the width actually changed, so this
    // settles after one extra render.
    this.onResize()
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize)
  }

  componentWillReceiveProps (newProps) {
    if (newProps.data !== this.props.data) {
      this.prepare(newProps.data)
      this.setState({start: null, end: null, hover: null})
    }
  }

  onResize () {
    if (this.container) {
      let width = Math.floor(this.container.clientWidth)
      if (width && Math.abs(width - this.state.width) > 1) {
        this.setState({width: width})
      }
    }
  }

  // Aggregate once per data set: distinct athletes per (quarter, group), the
  // quarters available for the selectors, and a fixed group -> color mapping
  // (ranked by all-time size, so filtering never repaints a group).
  prepare (data) {
    let counts = {} // quarterIndex -> group -> {athleteId: true}
    let groupTotals = {}
    let available = {}
    let density = {} // quarterIndex -> {registrations, counted, classes, athletes}

    ;(data || []).forEach((row) => {
      let season = seasonOf(row.quarter)
      let year = parseInt(row.year, 10)
      if (!season || !year) {
        return
      }
      let qi = quarterIndex(season, year)
      let group = row.group || 'unknown'
      let athlete = row.athleteId != null ? row.athleteId : ('row-' + row.id)

      available[qi] = true
      counts[qi] = counts[qi] || {}
      counts[qi][group] = counts[qi][group] || {}
      if (!counts[qi][group][athlete]) {
        counts[qi][group][athlete] = true
        groupTotals[group] = (groupTotals[group] || 0) + 1
      }

      let d = density[qi] = density[qi] || {registrations: 0, counted: 0, classes: 0, athletes: {}}
      d.registrations++
      let classes = classesFor(row)
      if (classes != null) {
        d.counted++
        d.classes += classes
        d.athletes[athlete] = true
      }
    })

    let ranked = Object.keys(groupTotals).sort((a, b) => groupTotals[b] - groupTotals[a])
    let colorFor = {}
    let order = []
    ranked.forEach((group, i) => {
      if (i < SERIES_COLORS.length) {
        colorFor[group] = SERIES_COLORS[i]
        order.push(group)
      } else {
        colorFor[group] = OTHER_COLOR
      }
    })
    let hasOther = ranked.length > SERIES_COLORS.length
    if (hasOther) {
      order.push(OTHER_KEY)
      colorFor[OTHER_KEY] = OTHER_COLOR
    }

    this.agg = {
      counts: counts,
      density: density,
      colorFor: colorFor,
      order: order, // stacking order, bottom -> top
      quarters: Object.keys(available).map(Number).sort((a, b) => a - b)
    }
  }

  seriesKey (group) {
    return this.agg.order.indexOf(group) !== -1 ? group : OTHER_KEY
  }

  getRange () {
    let quarters = this.agg.quarters
    if (quarters.length === 0) {
      return null
    }
    let end = this.state.end != null ? this.state.end : quarters[quarters.length - 1]
    let start = this.state.start != null ? this.state.start : Math.max(quarters[0], end - (DEFAULT_RANGE - 1))
    if (start > end) {
      let tmp = start
      start = end
      end = tmp
    }
    return {start: start, end: end}
  }

  // One entry per quarter in range (including quarters with no registrations)
  getColumns (range) {
    let columns = []
    for (let qi = range.start; qi <= range.end; qi++) {
      let byGroup = this.agg.counts[qi] || {}
      let values = {}
      let total = 0
      Object.keys(byGroup).forEach((group) => {
        let n = Object.keys(byGroup[group]).length
        let key = this.seriesKey(group)
        values[key] = (values[key] || 0) + n
        total += n
      })
      let d = this.agg.density[qi]
      let densityAthletes = d ? Object.keys(d.athletes).length : 0
      let ok = d && d.counted > 0 && d.counted / d.registrations >= MIN_COVERAGE
      columns.push({
        qi: qi,
        values: values,
        total: total,
        avg: ok ? d.classes / densityAthletes : null,
        counted: d ? d.counted : 0,
        registrations: d ? d.registrations : 0
      })
    }
    return columns
  }

  onStartChange (e) {
    let start = parseInt(e.target.value, 10)
    let range = this.getRange()
    this.setState({start: start, end: Math.max(start, range.end), hover: null})
  }

  onEndChange (e) {
    let end = parseInt(e.target.value, 10)
    let range = this.getRange()
    this.setState({end: end, start: Math.min(end, range.start), hover: null})
  }

  renderChart (columns) {
    let order = this.agg.order
    let colorFor = this.agg.colorFor
    let width = Math.max(this.state.width, 280)
    let plotW = width - MARGIN.left - MARGIN.right
    let height = PLOT_HEIGHT + MARGIN.top + MARGIN.bottom

    let maxTotal = 0
    columns.forEach((c) => { maxTotal = Math.max(maxTotal, c.total) })
    let ticks = niceTicks(maxTotal)
    let yMax = ticks[ticks.length - 1]
    let y = (v) => MARGIN.top + PLOT_HEIGHT - (v / yMax) * PLOT_HEIGHT

    let slot = plotW / columns.length
    let barW = Math.max(6, Math.min(56, slot * 0.6))
    let useShort = slot < 78
    let labelEvery = Math.max(1, Math.ceil((useShort ? 46 : 78) / slot))
    let xOf = (i) => MARGIN.left + slot * i + slot / 2

    // right axis: average classes per athlete, ticks on the same gridlines
    let maxAvg = 0
    columns.forEach((c) => { if (c.avg != null) { maxAvg = Math.max(maxAvg, c.avg) } })
    let rTicks = alignedTicks(maxAvg, ticks.length - 1)
    let rMax = rTicks[rTicks.length - 1]
    let yR = (v) => MARGIN.top + PLOT_HEIGHT - (v / rMax) * PLOT_HEIGHT

    // break the line wherever a quarter has no usable average
    let linePath = ''
    let pen = false
    let lastAvg = -1
    columns.forEach((c, i) => {
      if (c.avg == null) {
        pen = false
        return
      }
      linePath += (pen ? 'L' : 'M') + xOf(i) + ',' + yR(c.avg)
      pen = true
      lastAvg = i
    })
    let hover = this.state.hover
    // Value label on every point when the columns are wide enough for the
    // labels not to run into each other; otherwise just the latest point.
    let labelAll = slot >= 34
    // Above the dot by default; below it when that would overlap the bar's
    // total label (baseline at y(total) - 8, ~12px tall).
    let avgLabelY = (c) => {
      let above = yR(c.avg) - 10
      let totalBase = y(c.total) - 8
      let overlaps = c.total > 0 && Math.abs(above - totalBase) < 20
      return overlaps ? yR(c.avg) + 20 : above
    }

    return (
      <svg className='acct-chart__svg' width={width} height={height} role='img'
        aria-label={'Stacked bar chart of registered athletes by quarter and group, with a line for average classes per athlete on the right axis, ' + quarterLabel(columns[0].qi) + ' to ' + quarterLabel(columns[columns.length - 1].qi)}>
        {ticks.map((t, ti) => (
          <g key={'tick-' + t}>
            <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)}
              className={t === 0 ? 'acct-chart__baseline' : 'acct-chart__grid'} />
            <text x={MARGIN.left - 8} y={y(t)} dy='0.32em' textAnchor='end' className='acct-chart__tick'>{t}</text>
            <text x={width - MARGIN.right + 8} y={y(t)} dy='0.32em' textAnchor='start' className='acct-chart__tick acct-density__tick'>{rTicks[ti]}</text>
          </g>
        ))}
        <text x={0} y={MARGIN.top - 16} textAnchor='start' className='acct-density__axis-title'>Athletes</text>
        <text x={width} y={MARGIN.top - 16} textAnchor='end' className='acct-density__axis-title'>Avg classes</text>

        {columns.map((col, i) => {
          let cx = MARGIN.left + slot * i + slot / 2
          let x = cx - barW / 2
          let acc = 0
          let present = order.filter((key) => col.values[key])
          let segments = present.map((key, si) => {
            let v = col.values[key]
            let y0 = y(acc)
            acc += v
            let y1 = y(acc)
            let isTop = si === present.length - 1
            // 2px surface gap between segments: trim the top of every
            // segment except the topmost
            let h = Math.max(0, y0 - y1 - (isTop ? 0 : GAP))
            let top = isTop ? y1 : y1 + GAP
            if (isTop) {
              return (<path key={key} d={topRoundedRect(x, top, barW, h, 4)} fill={colorFor[key]} />)
            }
            return (<rect key={key} x={x} y={top} width={barW} height={h} fill={colorFor[key]} />)
          })
          let hovered = this.state.hover === i
          let showLabel = i % labelEvery === 0 || i === columns.length - 1
          return (
            <g key={col.qi}>
              {hovered ? (<rect x={MARGIN.left + slot * i} y={MARGIN.top} width={slot} height={PLOT_HEIGHT} className='acct-chart__hover-band' />) : null}
              {segments}
              {showLabel ? (
                <text x={cx} y={MARGIN.top + PLOT_HEIGHT + 22} textAnchor='middle' className='acct-chart__tick'>
                  {useShort ? shortQuarterLabel(col.qi) : quarterLabel(col.qi)}
                </text>
              ) : null}
            </g>
          )
        })}

        {/* avg classes per athlete (right axis), drawn over the bars */}
        <path d={linePath} className='acct-density__line-casing' />
        <path d={linePath} className='acct-density__line' />
        {columns.map((c, i) => (c.avg == null ? null : (
          <circle key={'avg-' + c.qi} cx={xOf(i)} cy={yR(c.avg)} r={hover === i ? 5.5 : 4}
            className={'acct-density__dot' + (hover === i ? ' acct-density__dot--active' : '')} />
        )))}
        {/* bar totals go on top of the line so it never hides them */}
        {columns.map((c, i) => (c.total > 0 ? (
          <text key={'total-' + c.qi} x={xOf(i)} y={y(c.total) - 8} textAnchor='middle' className='acct-chart__total acct-chart__total--halo'>{c.total}</text>
        ) : null))}
        {columns.map((c, i) => ((c.avg != null && (labelAll || i === lastAvg)) ? (
          <text key={'avg-label-' + c.qi} x={xOf(i)} y={avgLabelY(c)} textAnchor='middle'
            className={'acct-density__value' + (hover === i ? ' acct-density__value--active' : '')}>
            {fmtAvg(c.avg)}
          </text>
        ) : null))}

        {/* hit targets: the whole column, larger than the bar */}
        {columns.map((c, i) => (
          <rect key={'hit-' + c.qi} x={MARGIN.left + slot * i} y={MARGIN.top} width={slot} height={PLOT_HEIGHT + 30}
            fill='transparent' style={{cursor: 'default'}}
            onMouseEnter={() => { this.setState({hover: i}) }}
            onMouseLeave={() => { this.setState({hover: null}) }} />
        ))}
      </svg>
    )
  }

  renderTooltip (columns) {
    let i = this.state.hover
    if (i == null || !columns[i]) {
      return null
    }
    let col = columns[i]
    let width = Math.max(this.state.width, 280)
    let slot = (width - MARGIN.left - MARGIN.right) / columns.length
    let cx = MARGIN.left + slot * i + slot / 2
    let alignRight = cx > width * 0.6
    let style = {top: MARGIN.top + 'px'}
    if (alignRight) {
      style.right = (width - cx + slot / 2 + 4) + 'px'
    } else {
      style.left = (cx + slot / 2 + 4) + 'px'
    }
    // list top segment first so it reads in the same order as the stack
    let rows = this.agg.order.filter((key) => col.values[key]).reverse()
    return (
      <div className='acct-chart__tooltip' style={style}>
        <p className='acct-chart__tooltip-title'>{quarterLabel(col.qi)}</p>
        {rows.length === 0 ? (<p className='acct-chart__tooltip-empty'>No registrations</p>) : null}
        {rows.map((key) => (
          <div key={key} className='acct-chart__tooltip-row'>
            <span className='acct-chart__swatch' style={{backgroundColor: this.agg.colorFor[key]}} />
            <span className='acct-chart__tooltip-label'>{groupLabel(key)}</span>
            <span className='acct-chart__tooltip-value'>{col.values[key]}</span>
          </div>
        ))}
        {rows.length > 0 ? (
          <div className='acct-chart__tooltip-row acct-chart__tooltip-row--total'>
            <span className='acct-chart__tooltip-label'>Total</span>
            <span className='acct-chart__tooltip-value'>{col.total}</span>
          </div>
        ) : null}
        {col.registrations ? (
          <div className='acct-chart__tooltip-row acct-chart__tooltip-row--total'>
            <span className='acct-density__swatch' />
            <span className='acct-chart__tooltip-label'>Avg classes / athlete</span>
            <span className='acct-chart__tooltip-value'>{col.avg != null ? fmtAvg(col.avg) : '—'}</span>
          </div>
        ) : null}
        {col.registrations ? (
          <p className='acct-chart__tooltip-empty acct-density__coverage'>
            {col.avg != null
              ? 'Avg based on ' + col.counted + ' of ' + col.registrations + ' registrations'
              : 'Too few registrations with a class count'}
          </p>
        ) : null}
      </div>
    )
  }

  renderTable (columns) {
    let order = this.agg.order
    return (
      <div className='acct-table-wrap'>
        <table className='acct-table'>
          <thead>
            <tr>
              <th>Quarter</th>
              {order.map((key) => (<th key={key}>{groupLabel(key)}</th>))}
              <th>Total</th>
              <th>Avg classes / athlete</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col) => (
              <tr key={col.qi}>
                <td>{quarterLabel(col.qi)}</td>
                {order.map((key) => (<td key={key}>{col.values[key] || 0}</td>))}
                <td><strong>{col.total}</strong></td>
                <td>{col.avg != null ? fmtAvg(col.avg) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  render () {
    let quarters = this.agg.quarters
    let range = this.getRange()
    if (!range) {
      return (<div className='acct-empty'>No registrations to chart yet.</div>)
    }
    let columns = this.getColumns(range)
    let otherGroups = Object.keys(this.agg.colorFor).filter((g) => g !== OTHER_KEY && this.agg.order.indexOf(g) === -1)

    return (
      <div className='acct-chart'>
        <div className='acct-chart__controls'>
          <div className='reg-field acct-chart__field'>
            <label htmlFor='chart-start'>Start Quarter</label>
            <select id='chart-start' className='reg-input' value={range.start} onChange={this.onStartChange.bind(this)}>
              {quarters.map((qi) => (<option key={qi} value={qi}>{quarterLabel(qi)}</option>))}
            </select>
          </div>
          <div className='reg-field acct-chart__field'>
            <label htmlFor='chart-end'>End Quarter</label>
            <select id='chart-end' className='reg-input' value={range.end} onChange={this.onEndChange.bind(this)}>
              {quarters.filter((qi) => qi >= range.start).map((qi) => (<option key={qi} value={qi}>{quarterLabel(qi)}</option>))}
            </select>
          </div>
          <button type='button' className='acct-card__action acct-chart__toggle' onClick={() => { this.setState({showTable: !this.state.showTable, hover: null}) }}>
            <i className={this.state.showTable ? 'fa fa-bar-chart' : 'fa fa-table'} /> {this.state.showTable ? 'Chart' : 'Table'}
          </button>
        </div>

        <ul className='acct-chart__legend'>
          {this.agg.order.map((key) => (
            <li key={key} title={key === OTHER_KEY ? otherGroups.map(groupLabel).join(', ') : key}>
              <span className='acct-chart__swatch' style={{backgroundColor: this.agg.colorFor[key]}} />
              {groupLabel(key)}
            </li>
          ))}
          <li className='acct-density__legend'>
            <span className='acct-density__swatch' />
            Avg classes / athlete (right axis)
          </li>
        </ul>

        {this.state.showTable ? this.renderTable(columns) : (
          <div className='acct-chart__plot' ref={(el) => { this.container = el }}>
            {this.renderChart(columns)}
            {this.renderTooltip(columns)}
          </div>
        )}
        <p className='reg-subnote acct-chart__note'>
          Bars: distinct athletes per group each quarter. Quarter year follows the Year column (winter registrations in Jan/Feb count toward the previous year).
          Line: average classes per athlete. Drop-in and private lessons count as 1 class, Unlimited as 30; summer camp, Elite, Emerging Elite, Professional and adult registrations without a recorded class count are left out, and quarters where fewer than half of registrations have a class count are left blank.
        </p>
      </div>
    )
  }
}

export default RegistrationChart
