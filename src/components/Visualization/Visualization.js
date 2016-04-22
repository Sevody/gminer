import React, { Component, PropTypes } from 'react';
import s from './Visualization.scss';
import withStyles from '../../decorators/withStyles';
import d3 from 'd3';
import fetch from '../../core/fetch';
import AuthorDisplay from '../AuthorDisplay/AuthorDisplay';

const title = 'Visualizing...';
@withStyles(s)
class Visualization extends Component {

  constructor() {
    super();
    this.state ={
      rID: '',                    // 要可视化的作者主体id
      rName: '',                  // 主体作者名称
      storageData: [],            // 除rID外的共同作者List
      searchTimeOut: 3,           // 查询失败控制
      searchSuccess: false,       // 查询成功flag
      publicationStorage: [],     // 为设置多重实体连接， 保存论文列表
      authorInforamtion: [],      // 单击实体，显示该作者信息
      showSearchFalse: false,     // 显示查询失败flag
    }
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  static defaultProps = {
    queryOptions: {
      ResultObjects: 'Publishtion',
      StartIdx: 0,
      EndIdx: 50,
      OrderBy: 'year',
    }
  };
  componentWillMount() {
    this.context.onSetTitle(title);
    this.setState({rID: this.props.search});
  }

  componentDidMount() {
    // 加载完页面后请求publication数据，并渲染graph
    this.setState({searchTimeOut: 3, searchSuccess: false, showSearchFalse: false},
                        this.getCoAuthorData.bind(this, 'local'));
  }

/**
 * 使用d3.js渲染力导向图
 * @return {[type]} [description]
 */
  d3Render() {
    const self = this;
    let rootNodeObj = {};
    rootNodeObj.id = this.state.rID;
    rootNodeObj.name = this.state.rName;
    let nodesTime = [];
    const nodes = [];
    const edges = [];
    nodes.push(rootNodeObj);
    this.state.storageData.map(function(aut, i) {
      let autObj = {};
      let edgeObj = {};
      autObj.id = aut.id;
      autObj.name = aut.name;
      autObj.time = aut.time;
      nodesTime.push(aut.time);
      nodes.push(autObj);
      edgeObj.source = 0;
      edgeObj.target = i + 1;
      edges.push(edgeObj);
    });

    // 添加多重连接关系
    self.state.storageData.map(function(aut, i) {
      self.state.publicationStorage.map(function(pub) {
        pub.Author.map(function(pubAut) {
          if (pubAut.ID == aut.id) {
            pub.Author.map(function(pubAut2) {
              if (pubAut2.ID != aut.id && pubAut2.ID != self.state.rID) {
                self.state.storageData.map(function(aut2, j) {
                  if (aut2.id == pubAut2.ID) {
                    let edgeObj = {};
                    edgeObj.source = i + 1;
                    edgeObj.target = j + 1;
                    edges.push(edgeObj);
                  }
                })
              }
            })
          }
        })
      })
    })

    rootNodeObj.time = d3.max(nodesTime);
    // FIXME: 根据生成的图形大小设置宽高
    const width = document.body.clientWidth;
    const height = 700 + nodes.length * 4;

    const Forcelinear = d3.scale.linear()
        .domain([d3.min(nodesTime), d3.max(nodesTime)])
        .range([300, 100]);

    const Circlelinear = d3.scale.linear()
        .domain([d3.min(nodesTime), d3.max(nodesTime)])
        .range([d3.max(nodesTime) === 1 ? 20 : 8, 25]);

    const Textlinear = d3.scale.linear()
        .domain([d3.min(nodesTime), d3.max(nodesTime)])
        .range([12, 18]);

    // 如果svg图像已存在，则先删除
    const removeSvg = d3.select('#map svg')
        .remove();

    const svg = d3.select('#map')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const force = d3.layout.force()
        .nodes(nodes) // 指定节点数组
        .links(edges) // 指定连线数组
        .size([width, height]) // 指定范围
        .linkDistance(function(d) {
          return Forcelinear(d.target.time) ;
        }) // 指定连线长度
        .charge(-500); // 相互之间的作用力

    force.start(); // 开始作用

    // 添加连线
    const svgEdge = svg.selectAll('line')
        .data(edges)
        .enter()
        .append('line')
        .style('stroke', '#ccc')
        .style('stroke-width', 1);

    force.resume(); // 开始作用
    const color = d3.scale.category20();

    // 添加描述节点的文字
    const svgText = svg.selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .style('fill', 'black')
        .style('font-size', function(d) {
          return Textlinear(d.time)
        })
        .attr('dx', function(d) {
          return Circlelinear(d.time) + 1;
        })
        .attr('dy', 8)
        .text(function (d) {
          return d.name;
        });

    // 添加节点
    const svgNode = svg.selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', function draw(d, i) {
          return Circlelinear(d.time);
        })
        .style('fill', function fill(d, i) {
          return color(i);
        })
        // 双击事件，加载被双击 entity 的 graph 和 information
        .on('dblclick', function(d) {
          event.preventDefault();
          self.setState({rID: d.id, searchTimeOut: 3, searchSuccess: false, showSearchFalse: false}, function(){
            self.getCoAuthorData('local');
          });
        })
        // 单击事件，加载被单击 entity 的 information
        .on('click', function(d) {
            if (d._clickid) {
              clearTimeout(d._clickid);
              d._clickid = null;
            } else {
              d._clickid = setTimeout(function() {
                // process simple click
                self.setState({searchTimeOut: 3, searchSuccess: false}, function(){
                  self.getAuthorInforamtion('local', d.id);
                  d._clickid = null;
                });
              }.bind(this),300);
            }
        })
        // 当鼠标移入 entity 时，隐藏与该 entity 没有连接关系的 edge
        .on('mouseover', function(d) {
          let group = [];
          svgEdge.each(function(s) {
            if (s.target.index == d.index)
              group.push(s);
          })
          svgEdge.style('stroke', function(s) {
            let sourceFlag = false;
            let targetFlag = false;
            group.map(function(member) {
              if (member.source.id == s.source.id)
                sourceFlag = true;
              if (member.source.id == s.target.id || member.target.id == s.target.id)
                targetFlag = true;
            })
            return sourceFlag && targetFlag ? '#bbb' : '';
          });

          if (d.id != self.state.rID) {
            svgText.style('display', function(s) {
              let textFlag = false;
              group.map(function(member) {
                if (member.source.id == s.id || member.target.id == s.id)
                  textFlag = true;
              })
              return textFlag ? '' : 'none';
            });
          }

        })
        .on('mouseout', function(d) {
          svgEdge.style('stroke', '#ccc');
          svgText.transition().style('display', '');
        })
        .call(force.drag); // 使得节点能够拖动


    force.on('tick', function () { // 对于每一个时间间隔

        // 更新连线坐标
      svgEdge.attr('x1', function (d) {
        return d.source.x;
      })
        .attr('y1', function (d) {
          return d.source.y;
        })
        .attr('x2', function (d) {
          return d.target.x;
        })
        .attr('y2', function (d) {
          return d.target.y;
        });

        // 更新节点坐标
      svgNode.attr('cx', function (d) {
        return d.x;
      })
        .attr('cy', function (d) {
          return d.y;
        });

        // 更新文字坐标
        svgText.attr('x', function (d) {
          return d.x;
        })
          .attr('y', function (d) {
            return d.y;
          });
    });

  }

  /**
   * 生成获取数据url
   * @param  {String} host          remote / local
   * @param  {String} ResultObjects Publication / Author
   * @param  {String} AuthorID      要查询对象的id
   * @return {String}               查询url
   */
  getSourceURL(host = 'remote', ResultObjects = this.props.queryOptions.ResultObjects, AuthorID = this.state.rID) {
    // let source = "http://academic.research.microsoft.com/json.svc/search?AppId=6e030916-5f1f-4362-975c-8da95ddd632a&ResultObjects=Publishtion&StartIdx=0&EndIdx=50&OrderBy=year&AuthorID=1034212";
    let source = `./api/data/${host}?type=mss&ResultObjects=${ResultObjects}&StartIdx=${this.props.queryOptions.StartIdx}&EndIdx=${this.props.queryOptions.EndIdx}&OrderBy=Rank&AuthorID=${AuthorID}`;
    return source;
  }

  /**
   * 获取目标作者的Publication数据
   * @param  {String} host remote / local
   * @return {[type]}      [description]
   */
  async getCoAuthorData(host) {
    let searchTimeOut = this.state.searchTimeOut > 0 ? this.state.searchTimeOut - 1 : 0;
    this.setState({searchTimeOut: searchTimeOut}, async function(){

      // 查询成功
      if (this.state.searchSuccess) {
        return;
      }

      // 查询失败
      if (this.state.searchTimeOut === 0) {
        this.setState({showSearchFalse: true});
        return;
      }

      let source = this.getSourceURL(host);
      let response = await fetch(source);
      let json = await response.json().catch(function (err){
        console.log(err);
      });

      // 查询成功
      if (json && json.d && json.d.Publication && json.d.Publication.TotalItem) {
        let parseJson = this.handleMSSData(json);
        this.setState({searchSuccess: true, storageData: parseJson, showSearchFalse: false}, function(){
          this.d3Render.call(this);
          setTimeout(function() {
            this.setState({searchTimeOut: 3, searchSuccess: false}, function(){
              this.getAuthorInforamtion('local');
            }.bind(this));
          }.bind(this), 100);
        }.bind(this));
        return;
      }
      console.log(this.state.searchTimeOut);

      // 查询不成功，继续尝试查询
      this.getCoAuthorData('remote');
      /*fetch(source)
        .then(function(response) {
          return response.json()
        }).then((json) => {
          let length = json.d.Publication.TotalItem;
          this.handleMSSData(json);
          console.log('parsed json', json);
          this.d3Render.call(this);
        }).catch(function(ex) {
          console.log('parsing failed', ex)
        })*/
    }.bind(this));
  }
  /**
   * 获取目标作者的Author数据
   * @param  {String} host [remote / local]
   * @param  {string} rID  [目标作者id]
   * @return {[type]}      [description]
   */
  async getAuthorInforamtion(host, rID = this.state.rID) {
    // 查询控制，第一次使用本地数据查询失败时，继续3次尝试 remote api 查询
    let searchTimeOut = this.state.searchTimeOut > 0 ? this.state.searchTimeOut - 1 : 0;
    this.setState({searchTimeOut: searchTimeOut}, async function(){

      // 查询成功
      if (this.state.searchSuccess) {
        return;
      }

      // 查询失败
      if (this.state.searchTimeOut === 0) {
        return;
      }

      // 获取查询地址
      let source = this.getSourceURL(host, 'Author', rID);

      // 开始异步查询
      let response = await fetch(source);
      let json = await response.json().catch(function (err){
        console.log(err);
      });

      // 如果返回的数据结构正常，则说明查询成功
      if (json && json.d && json.d.Author && json.d.Author.TotalItem) {
        let parsedJson = json.d.Author.Result;
        this.setState({authorInforamtion: parsedJson,
                        searchSuccess: true});
        return;
      }
      console.log(this.state.searchTimeOut);

      // 查询不成功，继续尝试查询
      this.getAuthorInforamtion('remote', rID);
    });
  }

  /**
   * 处理 mss api 返回的原始数据，使其符合组件加载的数据结构
   * @param  {Array} raw 原始数据数组
   * @return {[type]}     [description]
   */
  handleMSSData(raw) {
    let length = raw.d.Publication.TotalItem;
    let data = length > 0 ? raw.d.Publication.Result : [];
    const rID =
      this.state.rID.split && this.state.rID.split('')[0] !== 's' ? this.state.rID : data[0].Author[0].ID;
    this.setState({rID: rID, publicationStorage: data});
    let storageData = [];
    data.map(function(pub, i) {
      pub.Author.map(function(aut, j) {
        if (aut.ID != rID) {
          // 未存入storageData的共同作者
          let flag = false;
          storageData.map(function(obj, z){
            if (obj.id === aut.ID) {
              storageData[z].time++;
              flag = true;
            }
          });
          if (!flag) {
            let newAuthor = {};
            newAuthor.id = aut.ID;
            newAuthor.name = aut.FirstName + ' ' + (aut.MiddleName ? aut.MiddleName : '') + ' ' + aut.LastName;
            newAuthor.time = 1;
            storageData.push(newAuthor);
          }
        } else {
          this.setState({rName: aut.FirstName + ' ' + (aut.MiddleName ? aut.MiddleName : '') + ' ' + aut.LastName});
        }
      }.bind(this));
    }.bind(this));
    return storageData;
  }
  render() {
    let style = this.state.showSearchFalse ? s.searchNothing : s.searchSomethig;
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.information}>
            <AuthorDisplay authorList={this.state.authorInforamtion} clickCallBack = {this.clickCallBack}>
            </AuthorDisplay>
          </div>
          <div className={style}>
            <span>加载失败... (╯﹏╰)...</span>
          </div>
          <div id="map"></div>
        </div>
      </div>
    );
  }

}

export default Visualization;
