import React from 'react';
import {render} from 'react-dom';

class SuperTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: this.props.data,
      keys: this.getKeys(this.props.data),
      currentlySorted: '',
      shownColumns: this.getKeys(this.props.data)
    };
  }

  getKeys(arr) {
    let keys = [];
    for (let i = 0; i < arr.length; i++) {
      for (let key in arr[i]) {
        if (!(keys.includes(key))) {
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
        <ColumnChooser keys={this.state.keys} toggleColumn={this.toggleColumn.bind(this)}/>
        <table>
          <thead><tr>
            {this.state.keys.map((key, index) => {
              if (this.state.shownColumns.includes(key)) {
                return (<th onClick={() => {this.sortBy.bind(this)(key)}} key={index} className='superTable-th'> {key} </th>)
              }
            })}
          </tr></thead>
          <tbody>
            {this.state.data.map((row, index) => {
              return (
                <SuperTableRow key={index} info={row} keys={this.state.keys} shownColumns={this.state.shownColumns}/>
              );
            })}
          </tbody>
          <a onClick={() => {console.log(this.state)}}>state</a>
        </table>
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
          if (this.props.shownColumns.includes(key)) {
            return (<td key={index}> {this.props.info.hasOwnProperty(key) ? this.props.info[key] : '-'} </td>);
          }
        })}
      </tr>
    );
  }
}

class ColumnChooser extends React.Component {
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

        <div style={{display: this.state.view ? 'block' : 'none', wordWrap: 'normal', width: '100%'}} className='row'>
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

export default SuperTable;