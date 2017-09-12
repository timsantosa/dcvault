import React from 'react';
import {render} from 'react-dom';

class SuperTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: JSON.parse(JSON.stringify(this.props.data)),
      keys: this.getKeys(this.props.data),
      currentlySorted: '',
      shownColumns: this.getKeys(this.props.data),
      filter: {key: '', value: ''}
    };
  }

  getKeys(arr) {
    let keys = [];
    for (let i = 0; i < arr.length; i++) {
      for (let key in arr[i]) {
        if (keys.indexOf(key) === -1) {
          keys.push(key);
        }
      }
    }
    return keys;
  }

  componentWillReceiveProps(newProps) {
    if (JSON.stringify(this.props) !== JSON.stringify(newProps)) {
      this.setState({
        data: newProps.data,
        keys: this.getKeys(newProps.data),
        currentlySorted: '',
        shownColumns: newProps.shownColumns || this.getKeys(newProps.data)
      });
    }
  }

  exportCSV() {
    let rows = [];

    let firstRow = [];
    this.state.shownColumns.map((key, index) => {
      firstRow.push(key);
    });
    rows.push(firstRow.join(','));

    this.state.data.map((row, dataIndex) => {
      if (this.passesFilter(row)) {
        let outputRow = [];
        this.state.shownColumns.map((key, keyIndex) => {
          outputRow.push(row[key] || '');
        });
        rows.push(outputRow.join(','));
      }
    });

    let csvContent = 'data:text/csv;charset=utf-8,' + rows.join('\n');
    let link = document.createElement('a');
    let now = new Date();
    let dateString = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    if (!!this.props.fileName) {
      dateString += '_' + this.props.fileName;
    }
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', dateString + '.csv');
    document.body.appendChild(link);
    link.click();
  }

  exportColumn(key) {
    let exportArr = [];
    this.state.data.map((row, index) => {
      if (row[key]) {
        exportArr.push(row[key]);
      }
    })
    return exportArr.join(',');
  }

  passesFilter(row) {
    if (this.state.filter.key.length === 0 || this.state.keys.indexOf(this.state.filter.key) === -1) {
      return true;
    } else {
      let rowVal, index;
      if(this.props.caseSensitive === true) {
        rowVal = (row[this.state.filter.key] + '');
        index = rowVal.indexOf((this.state.filter.value + ''));
      } else {
        rowVal = (row[this.state.filter.key] + '').toUpperCase();
        index = rowVal.indexOf((this.state.filter.value + '').toUpperCase());
      }
      return index !== -1;
    }
  }

  updateFilter(key, val) {
    if (this.state.keys.indexOf(key) !== -1) {
      this.setState({
        filter: {key: key, value: val}
      });
    }
  }

  toggleColumn(col) {
    let index = this.state.shownColumns.indexOf(col);
    let currentArr = this.state.shownColumns.slice();
    if (index !== -1) {
      currentArr.splice(index, 1);
    } else {
      currentArr.push(col)
    }

    this.setState({
      shownColumns: currentArr
    });
  }

  sortBy(key) {
    let currentArr = JSON.parse(JSON.stringify(this.state.data));

    if (this.state.currentlySorted !== key) {
      currentArr.sort((a, b) => {
        if (a[key] > b[key]) {
          return -1;
        } else if (a[key] < b[key]) {
          return 1;
        }
        return 0;
      });
      this.setState({
        currentlySorted: key
      });
    } else {
      currentArr.sort((b, a) => {
        if (a[key] > b[key]) {
          return -1;
        } else if (a[key] < b[key]) {
          return 1;
        }
        return 0;
      });
      this.setState({
        currentlySorted: ''
      });
    }

    this.setState({
      data: currentArr
    });
  }

  render() {

    return (
      <div>
        <ColumnSelector keys={this.state.keys} toggleColumn={this.toggleColumn.bind(this)}/>
        <ColumnFilter keys={this.state.keys} updateFilter={this.updateFilter.bind(this)}/>
        <ColumnExport keys={this.state.keys} exportColumn={this.exportColumn.bind(this)}/>
        <a onClick={this.exportCSV.bind(this)}>Export CSV</a>
        <table>
          <thead><tr>
            {this.state.keys.map((key, index) => {
              if (this.state.shownColumns.indexOf(key) !== -1) {
                return (<th onClick={() => {this.sortBy.bind(this)(key)}} key={index} className='superTable-th'> {key} </th>)
              }
            })}
          </tr></thead>
          <tbody>
            {this.state.data.map((row, index) => {
              if(this.passesFilter.bind(this)(row)) {
                return (
                  <SuperTableRow key={index} info={row} keys={this.state.keys} shownColumns={this.state.shownColumns}/>
                );
              }
            })}
          </tbody>
        </table>
        <a onClick={() => {console.log(this.state)}}>state</a>
      </div>
    );
  }
}

class SuperTableRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      values: Object.values(props.info)
    };
  }

  render() {
    return (
      <tr>
        {this.props.keys.map((key, index) => {
          if (this.props.shownColumns.indexOf(key) !== -1) {
            return (<td key={index}> {this.props.info.hasOwnProperty(key) ? this.props.info[key] : '-'} </td>);
          }
        })}
      </tr>
    );
  }
}

class ColumnSelector extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      view: false
    }
  }

  toggleView() {
    let current = this.state.view;
    this.setState({
      view: !current
    });
  }

  render() {
    return (
      <div>
        <a onClick={this.toggleView.bind(this)}> Edit Shown Columns </a>

        <div style={{display: this.state.view ? 'block' : 'none'}} className='row'>
            {this.props.keys.map((key, index) => {
              return(
                <div key={index} className="col-xs-4 col-md-2">
                  <a style={{margin: '10px'}} onClick={() => {this.props.toggleColumn(key)}}>{key}</a>
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}

class ColumnFilter extends React.Component {
  constructor(props) {
    super(props);
  }

  updateFilter() {
    let key = this.refs.key.value;
    let value = this.refs.value.value;
    this.props.updateFilter(key, value);
  }

  clearFilter() {
    let key = this.refs.key.value;
    this.refs.value.value = '';
    this.props.updateFilter(key, '');
  }

  render() {
    return (
      <div>
        Filter:
        <select ref='key'>
          {this.props.keys.map((key, index) => {
            return (<option key={index} name={key}>{key}</option>)
          })}
        </select>
        <input type='text' ref='value' onChange={this.updateFilter.bind(this)}/>
        <a onClick={this.clearFilter.bind(this)}>Clear</a>
      </div>
    );
  }
}

class ColumnExport extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showBox: false,
      msg: ''
    }
  }

  exportColumn() {
    let key = this.refs.key.value;
    let exportVal = this.props.exportColumn(key);
    this.refs.listBox.value = exportVal;
    this.setState({showBox: true});
  }

  toClipboard() {
    var copyTextArea = document.querySelector('#export-column-box');
    copyTextArea.select();
    try {
      let successful = document.execCommand('copy');
      let msg = successful ? 'Info Copied Successfully!' : 'Failed to copy info...';
      this.setState({msg: msg});
      setTimeout(() => {
        this.setState({msg: ''});
      }, 3000);
    } catch (e) {
      console.log('unable to copy\n', e);
    }
  }

  render() {
    let statusText = ''
    if (this.state.msg.length > 0) {
      statusText = (
        <p style={{display: this.state.showBox ? 'block' : 'none'}}> {this.state.msg} </p>
      )
    }

    return (
      <div>
        Export Column:
        <select ref='key'>
          {this.props.keys.map((key, index) => {
            return (<option key={index} name={key}>{key}</option>)
          })}
        </select>
        <button value='export' onClick={this.exportColumn.bind(this)}>Export</button>
        <textArea id='export-column-box' ref='listBox' style={{display: this.state.showBox ? 'block' : 'none'}} cols='32' rows='10'/>
        <button value='clipboard' style={{display: this.state.showBox ? 'inline-block' : 'none'}} onClick={this.toClipboard.bind(this)}>Copy to Clipboard</button>
        <button value='close' style={{display: this.state.showBox ? 'inline-block' : 'none'}} onClick={() => {this.setState.bind(this)({showBox: false})}}>Close</button>
        {statusText}
      </div>
    );
  }


}

export default SuperTable;