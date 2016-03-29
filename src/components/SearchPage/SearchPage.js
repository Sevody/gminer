import React, { Component, PropTypes } from 'react';
import s from './SearchPage.scss';
import withStyles from '../../decorators/withStyles';
import Link from '../Link';
import AuthorGather from '../AuthorGather/AuthorGather';

const title = 'Co-authorship Network Search';

@withStyles(s)
class SearchPage extends Component {
  constructor() {
      super();
      this.state ={
        authorList: [],           // 填充组件需要的数据
        searchTimeOut: 3,         // 查询失败控制
        searchSuccess: false,     // 查询成功flag
        showSearchFalse: false,   // 显示查询失败flag
      }
  }
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };
  static defaultProps = {
    queryOptions: {
      ResultObjects: 'Author',
      StartIdx: 0,
      EndIdx: 10,
    }
  };
  componentWillMount() {
    this.context.onSetTitle(title);
  }

  handleClick() {
    // setState是异步操作，会出现延迟赋值，需要使用回调函数
    this.setState({searchTimeOut: 3, searchSuccess: false, showSearchFalse: false},
                    this.getAuthorList.bind(this, 'local'));
  }

  handleKeyDown(event) {
    if (event.keyCode === 13) {
      this.handleClick();
    }
  }

  /**
   * 生成查询url地址
   * @param  {string} host [指定查询本地数据还是使用mss api]
   * @return {string}      [需要查询的关键字对应的api地址]
   */
  getSourceURL(host = 'remote') {
    let source = `./api/data/${host}?type=mss&FullTextQuery=${this.refs.searchString.value}&ResultObjects=${this.props.queryOptions.ResultObjects}&StartIdx=${this.props.queryOptions.StartIdx}&EndIdx=${this.props.queryOptions.EndIdx}`;
    return source;
  }

  getAuthorList(host) {

    /////////////////////////////////////////
    // fetch async await mss data example //
    ///////////////////////////////////////

    // 查询控制，第一次使用本地数据查询失败时，继续3次尝试 remote api 查询
    let searchTimeOut = this.state.searchTimeOut > 0 ? this.state.searchTimeOut - 1 : 0;
    this.setState({searchTimeOut: searchTimeOut}, async function(){

      // 查询成功
      if (this.state.searchSuccess) {
        return;
      }

      // 查询失败
      if (this.state.searchTimeOut === 0) {
        this.setState({authorList: [], showSearchFalse: true});
        return;
      }

      // 获取查询地址
      let source = this.getSourceURL(host);

      // 开始异步查询
      let response = await fetch(source);
      let json = await response.json().catch(function (err){
        console.log(err);
      });

      // 如果返回的数据结构正常，则说明查询成功
      if (json && json.d && json.d.Author && json.d.Author.TotalItem) {
        let parsedJson = this.handleMSSData(json);
        console.log('parsed json', parsedJson);
        this.setState({authorList: parsedJson,
                        searchSuccess: true,
                        showSearchFalse: false});
        return;
      }
      console.log(this.state.searchTimeOut);

      // 查询不成功，继续尝试查询
      this.getAuthorList('remote');

    }.bind(this));

    /////////////////////////////////////////
    // fetch then promise mss data example//
    ///////////////////////////////////////

/*

    let self = this;
    fetch(source)
      .then(function(response) {
        return response.json()
      }).then(function(json) {
        let parsedJson = self.handleMSSData(json);
        console.log('parsed json', parsedJson);
        self.setState({authorList: parsedJson});
      }).catch(function(ex) {
        console.log('parsing failed', ex)
      })
*/

  }

  /**
   * 对返回的json数据进行更改，满足组件操作的的数据结构
   * @param  {Object} raw 服务器返回的原始数据
   * @return {Object / Array}     满足组件读取操作的数据结构
   */
  handleMSSData(raw) {
    let length = raw.d.Author.TotalItem;
    let list = length > 0 ? raw.d.Author.Result : [];
    return list;
  }

  render() {
    let style = this.state.showSearchFalse ? s.searchNothing : s.searchSomethig;
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.searchBox}>
            <input className={s.inputBox} ref="searchString"
                  onKeyDown={this.handleKeyDown.bind(this)} />
            <button className={s.button}
                  onClick={this.handleClick.bind(this)}>
              Search
            </button>
          </div>
          <div className={style}>
            <span>查询失败... (╯﹏╰)...</span>
          </div>
          <AuthorGather authorList={this.state.authorList}>
          </AuthorGather>
        </div>
      </div>
    );
  }

}

export default SearchPage;
