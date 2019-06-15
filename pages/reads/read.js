// pages/read/read.js
let innerAudioContext = wx.createInnerAudioContext(); //音频实例
const util = require('../../utils/util.js');
const requestFun = require('../../utils/request.js');
const app = getApp();
var truefor = true; //循环查找当前目录时，控制跳出循环
var temporary = 0;  //记录匹配的目录id
var progressVal = 0;  //语速
Page({
  /** 页面的初始数据**/
  data: {
    movable:{
      scalevalue: 1, //图片缩放的值
      width:0,
      scaleis:false,
      x:0,
      startX:0,
    },
    alternative: false, //单点alternative
    showCont: true,
    newindex: 0, //当前切换到哪个分组
    isshow: true, //在切换分组时，暂且隐藏轮播
    newlist: [], //切割的数组
    startX: 0, //手指咱轮播上滑动时，判断到了当前分组的第一个或者最后一个，准备做出响应。
    newcurrent: 0, //当前分组切换到的下标
    scrollleft: 0, //底部页码导航组件的位置调整
    timeout: true, //暂停
    is_loop: true, //直接点击选取时，判断是否选中了单读
    subject: '', //科目
    bookinfo: '', //书本信息
    cover: '', //书本封面
    loadtemp: true, //加载遮罩层
    truebtn: true, //图片预加载
    subjectId: 0, //课本类型
    translation: false, //翻译
    // audio: [],
    speechval: 0, //倍数
    playURL: [], //音频数组
    bookid: 0, //本书id
    menulist: [], //目录
    menulistIndex: 0, //目录id
    bookset: [], //整本图书
    windowW: 0, //屏幕宽度
    leftul: 0, //侧边栏left
    spacing: 0, //语音倍速调整
    imgurl: '', //图片域名
    bottom_show: true, //底部导航
    top_show: false,
    leftul_show: false, //侧边栏isshow
    speechrate: false, //语速调整框
    moveX: 0,
    // animations: false,
    audioContentTrans: [], //翻译
    //语速调节器
    progress: {
      width: 0,
      startX: 0,
      moveX: 0,
      endX: 0,
      val: 40,
      speed: true,
    },
    //复读选区
    repeat: {
      startcurrent: -1, //起点的页码
      startindex: -1,
      startpage: 0,
      endpage: 0,
      endcurrent: -1, //终点的页码
      endindex: -1,
      tiptext: '请选择复读的起始位置',
    },
    sreadIndex: -1,
    range: {
      index: 0,
      list: [],
    }, //范围
    current: 0,
    topBtn: {
      repeat: false, //复读
      speechrate: false, //语速
      continuous: false, //连续播放
      sreading: false,
      startaudio: false,
    },
    touch: {
      startX: 0,
      endX: 0,
    },
  },
  // 缩放
  bindscaleswiper:function(e){
    this.data.movable.scalevalue = e.detail.scale
    this.data.movable.width = this.data.windowW * e.detail.scale
    this.data.movable.x=e.detail.x
  },
  // bindchangeswiper:function(e){
  //   console.log('移动容器中')
  //   if(this.data.movable.scalevalue!==1){
  //   console.log('不是原有尺寸，禁止轮播切换');
  //     this.setData({
  //       'movable.scaleis': true
  //     })
  //   }else{      
  //     this.setData({
  //       'movable.scaleis': false
  //     })
  //   }
  //   this.setData({
  //     'movable.x': e.detail.x
  //   })
  // },
  touchStarts: function(e) {
    this.data.startX = e.changedTouches[0].clientX
  },
  touchEnds: function(e) {
    let seep = this.data.startX - e.changedTouches[0].clientX,
      _this = this.data;
    if (seep > 0 && seep > 100 && _this.newcurrent == _this.newlist[_this.newindex].length - 1 && _this.newindex < _this.newlist.length - 1) {
      this.setData({
        newindex: _this.newindex + 1,
        isshow: false,
        newcurrent: 0,
        loadtemp:true,
      })
      setTimeout(() => {
        this.setData({
          isshow: true,
          loadtemp:false,
        })
      }, 500)
    } else if (seep < 0 && seep < -100 && _this.newcurrent == 0 && _this.newindex > 0) {
      this.setData({
        newindex: _this.newindex - 1,
        isshow: false,
        newcurrent: 9,
        loadtemp: true,
      })
      setTimeout(() => {
        this.setData({
          isshow: true,
          loadtemp: false
        })
      }, 500)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let _this = this.data,
      winW = wx.getSystemInfoSync().windowWidth,
      browse = wx.getStorageSync('browse');
    _this.windowW = wx.getSystemInfoSync().windowWidth;
    try {
      let bookinfo = JSON.parse(options.bookinfo);
      this.setData({
        bookinfo: options.info,
        subject: options.subject,
        bookid: bookinfo.bookid,
        subjectId: bookinfo.subjectId,
        imgurl: app.globalData.imgurl,
        cover: _this.imgurl + options.cover + '?x-oss-process=style/book-cover',
      })
    } catch (err) {
      console.log(err);
    }
    if (typeof(options.current) != 'undefined') {
      let current = options.current;
      if (current > 9) {
        _this.newindex = (current - (current % 10)) / 10;
        _this.newcurrent = _this.current % 10
      } else {
        _this.newindex = 0;
        _this.newcurrent = _this.current
      }
    }
    typeof(options.current) != 'undefined' ? this.setData({
      'current': options.current
    }): '';
    if (browse.length > 0) {
      if (typeof(browse.find(x => x.bookid == _this.bookid)) != 'undefined') {
        _this.current = browse.find(x => x.bookid == _this.bookid).current;
      }
    }
    this.setData({
      leftul: -winW / 750 * 640,
      speechval: (_this.progress.val / 50).toFixed(1),
      newindex: _this.newindex,
      newcurrent: _this.newcurrent
    })
    try {
      const value = wx.getStorageSync('user');
      if (value) {
        //请求整本图书
        requestFun.request('api', 'GET', '/book/page?bookId=' + _this.bookid, 'Bearer ' + JSON.parse(value).access_token).then((res) => {
          res.data.data.forEach((v, i) => {
            v.imgUrl = _this.imgurl + v.imgUrl;
          })
          _this.bookset = res.data.data;
          //底部页码器
          let leftall = winW / 750 * 100,
            scrollleft;
          if (_this.current > 4 || _this.current < _this.bookset.length - 4) {
            scrollleft = leftall * (_this.current - 3)
          } else if (_this.current <= 4) {
            scrollleft = 0
          } else if (_this.current >= _this.bookset.length - 4) {
            scrollleft = _this.bookset.length - 4 * leftall
          }
          //切割数组
          _this.newlist = util.sliceArray(_this.bookset, 10);
          this.setData({
            bookset: _this.bookset,
            newlist: _this.newlist,
            scrollleft: scrollleft,
          })
          //请求页面选区
          return requestFun.request('api', 'GET', '/book/page/getByBookIdAndSequence?bookId=' + _this.bookid + "&sequence=" + _this.bookset[_this.current].sequence, 'Bearer ' + JSON.parse(value).access_token)
        }).catch((res) => {
          console.log('错误' + res)
        }).then((res) => { //页面选区
          _this.range.list[_this.current] = res.data.data;
          this.setData({
            'range.list': _this.range.list
          })
          try {
            let audioId = '',
              audioContentTrans = [];
            if (res.data.data.length <= 0) {
              throw new Error('暂无音频');
            }
            res.data.data.forEach((val, index) => {
              if (typeof(val.audioAliVid) != 'undefined') {
                audioId += val.audioAliVid + ','
              } else {
                wx.hideLoading();
                throw new Error('暂无音频');
              }
              if (typeof(val.audioContentTrans) != 'undefined') {
                audioContentTrans.push(val.audioContentTrans)
              }
            })
            this.setData({
              audioContentTrans: audioContentTrans
            })
            audioId = audioId.substr(0, audioId.length - 1);
            //请求音频
            requestFun.request('aliVod', 'GET', '/mediaResource/getVideoInfos?videoIds=' + audioId).then((res) => {
              _this.playURL[_this.current] = res.data.data;
              if (_this.current > 9) {
                _this.newindex = parseInt(_this.current / 10);
                _this.newcurrent = _this.current % 10;
              } else {
                _this.newindex = 0;
                _this.newcurrent = _this.current;
              }
              if (_this.current != 0) {
                util.iconnone('您上次浏览到这喽~');
              }
              this.setData({
                loadtemp: false,
                newindex: _this.newindex,
                newcurrent: _this.newcurrent
              })
              //在页面加载完以后
              setTimeout(() => {
                this.setData({
                  bottom_show: false
                })
              }, 3000)
            }).catch((res) => {
              console.log(res)
            })
          } catch (res) {
            util.iconnone(res.message)
            if (_this.current > 9) {
              _this.newindex = parseInt(_this.current / 10);
              _this.newcurrent = _this.current % 10;
            } else {
              _this.newindex = 0;
              _this.newcurrent = _this.current;
            }
            this.setData({
              loadtemp: false,
              newindex: _this.newindex,
              newcurrent: _this.newcurrent
            })
          }
        }).catch((res) => {
          console.log('错误' + res)
        })
      }
    } catch (err) {
      console.log(err)
    }
  },
  //触摸页面开始
  touchStart: function(e) {
    this.data.startX = e.touches[0].pageX
  },
  //移动中
  // touchMove: function(e) {
  //   let _this = this.data,
  //     spacing = 0;
  //   _this.moveX = e.touches[0].pageX;
  //   spacing = _this.moveX - _this.startX;
  //   _this.spacing = spacing;
  // },
  // touchEnd: function() {
  //   let _this = this.data;
  //   if (Math.abs(_this.spacing) > 100) {
  //     this.setData({
  //       animations: true
  //     })
  //   } else if (_this.spacing > 100) {
  //     this.setData({
  //       animations: false
  //     })
  //   }
  // },
  //复读播放
  repeatTips: function() {
    let _this = this.data;
    _this.topBtn.repeat = true;
    _this.topBtn.startaudio = true;
    _this.topBtn.speechrate = false;
    _this.topBtn.continuous = false;
    this.setData({
      topBtn: _this.topBtn,
      newcurrent: _this.repeat.startcurrent,
      'range.index': _this.repeat.startindex,
      newindex: _this.repeat.startpage
    })
    this.audio();
  },
  audio: function() {
    let _this = this.data;
    innerAudioContext = wx.createInnerAudioContext(); //音频实例
    innerAudioContext.src = _this.playURL[_this.current][_this.range.index].mezzanine.fileURL;
    innerAudioContext.play();
    innerAudioContext.onEnded((res) => {
      if (_this.repeat.endcurrent == _this.current) { //到了选中的结束页
        if (_this.range.index < _this.repeat.endindex) {
          innerAudioContext.stop(); //停止
          innerAudioContext.destroy();
          this.setData({
            'range.index': _this.range.index + 1
          })
          this.audio();
        } else {
          _this.newcurrent = _this.repeat.startcurrent;
          _this.newindex = _this.repeat.startpage;
          this.setData({
            newcurrent: _this.newcurrent,
            'range.index': _this.repeat.startindex,
            newindex: _this.newindex
          })
          innerAudioContext.stop(); //停止
          innerAudioContext.destroy();
          this.audio();
        }
      } else {
        if (_this.range.index < _this.range.list[_this.current].length - 1) {
          innerAudioContext.stop(); //停止
          innerAudioContext.destroy();
          this.setData({
            'range.index': _this.range.index + 1
          })
          this.audio();
        } else { //到本页最后一条语音了，切换页码
          if (_this.newcurrent == _this.newlist[_this.newindex].length - 1) {
            _this.newcurrent = 0;
            _this.newindex++
          } else {
            _this.newcurrent++
          }
          this.setData({
            'range.index': 0,
            newcurrent: _this.newcurrent,
            newindex: _this.newindex
          })
          if (typeof(_this.playURL[_this.current]) == 'undefined') {
            this.xuanqu();
          } else {
            this.audio();
          }
        }
      }
    })
  },
  //这是未选择状态时点击选区播放
  alternative: function(e) {
    let _this = this.data,
      index = e.currentTarget.dataset.index;
    if (_this.topBtn.sreading) { //当选中复读时，禁止点击切换正读选区
      return;
    }
    this.setData({
      alternative: true
    })
    _this.is_loop = false; //是否显示关闭的按钮
    this.topBtn('sreading');
    _this.topBtn.startaudio = true;
    this.setData({
      sreadIndex: index,
      'range.index': index,
      topBtn: _this.topBtn,
      is_loop: _this.is_loop
    })
    this.audiosread();
  },
  //选择复读区
  rangeclick: function(e) {
    let _this = this.data,
      sindex = _this.repeat.startindex,
      index = e.currentTarget.dataset.index,
      type = e.currentTarget.dataset.type;
    //当前单读选中
    if (type == 'sreading') {
      _this.topBtn.sreading ? _this.is_loop = true : _this.is_loop = false; //是否显示关闭的按钮
      console.log(e.currentTarget.dataset.alt)
      this.topBtn('sreading');
      _this.topBtn.startaudio = true;
      _this.topBtn.sreading = true;
      this.setData({
        sreadIndex: index,
        'range.index': index,
        topBtn: _this.topBtn,
        is_loop: _this.is_loop
      })
      this.audiosread();
    }
    //判断是否是复读选择状态
    if (_this.topBtn.repeat) {
      if (sindex == -1) {
        _this.repeat.startindex = index;
        _this.repeat.startcurrent = _this.current;
        _this.repeat.startpage = _this.newindex;
        _this.repeat.tiptext = '请选择结束位置';
      } else {
        if (_this.repeat.startcurrent > _this.current || (_this.repeat.startcurrent == _this.current && _this.repeat.startindex > index)) {
          util.iconnone('终点不可大于起点');
          return;
        } else {
          _this.repeat.endindex = index;
          _this.repeat.endcurrent = _this.current;
          _this.repeat.endpage = _this.newindex;
        }
        _this.repeat.tiptext = '播放';
      }
    }
    this.setData({
      repeat: _this.repeat
    })
  },
  audiosread: function() {
    let _this = this.data;
    innerAudioContext = wx.createInnerAudioContext(); //音频实例
    innerAudioContext.src = _this.playURL[_this.current][_this.range.index].mezzanine.fileURL;
    innerAudioContext.play();
    innerAudioContext.onEnded((res) => {
      innerAudioContext.stop(); //停止
      innerAudioContext.destroy();
      if (_this.is_loop) {
        this.audiosread();
      } else {
        this.prohibitever();
        this.setData({
          alternative: false
        })
      };
      return;
    })
  },
  //单读
  sreading: function() {
    let _this = this.data;
    if (typeof(_this.playURL[_this.current]) == 'undefined') {
      util.iconnone('暂无音频');
      return;
    }
    _this.topBtn.sreading = !_this.topBtn.sreading;
    _this.topBtn.sreading ? '' : this.setData({
      sreadIndex: -1
    })
    this.topBtn('sreading');
    this.setData({
      'topBtn': _this.topBtn,
    })
  },
  //复读
  repeatbtn: function() {
    let _this = this.data;
    if (_this.range.list[_this.current].length > 0) {
      if (typeof(_this.playURL[_this.current]) == 'undefined') {
        util.iconnone('暂无音频');
        return;
      }
    } else {
      util.iconnone('此页无文字可读哟');
      return;
    }
    _this.topBtn.repeat = true;
    _this.is_loop = true;
    this.topBtn('repeat');
    this.setData({
      'topBtn': _this.topBtn,
      is_loop: _this.is_loop
    })
  },
  //连续播放：
  continuous: function() {
    let _this = this.data;
    if (_this.range.list[_this.current].length <= 0) {
      util.iconnone('此页无文字可读哟');
      return;
    }
    if (typeof(_this.playURL[_this.current]) == 'undefined' && _this.range.list[_this.current].length > 0) {
      util.iconnone('暂无音频');
      return;
    }
    //改变按钮状态；
    _this.topBtn.continuous = !_this.topBtn.continuous;
    this.topBtn('continuous');
    if (!_this.topBtn.continuous) {
      this.setData({
        'range.index': 0
      });
      this.setData({
        'topBtn': _this.topBtn
      });
    } else if (_this.range.list[_this.current].length > 0) {
      _this.topBtn.startaudio = true
      _this.is_loop = true;
      this.setData({
        'topBtn': _this.topBtn,
        is_loop: _this.is_loop
      });
      this.a();
      this.setData({
        bottom_show: false
      })
    }
  },
  xuanqu: function() {
    let _this = this.data,
      tant = this;
    const value = wx.getStorageSync('user');
    requestFun.request('api', 'GET', '/book/page/getByBookIdAndSequence?bookId=' + _this.bookid + "&sequence=" + _this.bookset[_this.current].sequence, 'Bearer ' + JSON.parse(value).access_token).then((res) => { //页面选区
      _this.range.list[_this.current] = res.data.data;
      this.setData({
        'range.list': _this.range.list
      })
      try {
        let audioId = '',
          audioContentTrans = [];
        if (res.data.data.length <= 0) {
          throw new Error('暂无音频');
        }
        res.data.data.forEach((val, index) => {
          if (typeof(val.audioAliVid) != 'undefined') {
            audioId += val.audioAliVid + ','
          } else {
            wx.hideLoading();
            throw new Error('暂无音频');
          }
          if (typeof(val.audioContentTrans) != 'undefined') {
            audioContentTrans.push(val.audioContentTrans)
          }
        })
        this.setData({
          audioContentTrans: audioContentTrans
        })
        console.log(audioContentTrans)
        audioId = audioId.substr(0, audioId.length - 1);
        //请求音频
        requestFun.request('aliVod', 'GET', '/mediaResource/getVideoInfos?videoIds=' + audioId).then((res) => {
          _this.playURL[_this.current] = res.data.data;
          tant.setData({
            loadtemp: false,
          })
          if (_this.repeat.startindex == -1) {
            tant.a();
          } else {
            tant.audio();
            console.log('复读')
          }
        }).catch((res) => {
          console.log(res)
        })
      } catch (res) {
        util.iconnone(res.message)
        this.setData({
          loadtemp: false
        })
      }
    }).catch((res) => {
      console.log('错误' + res)
    })
  },
  a: function() {
    let _this = this.data;
    innerAudioContext = wx.createInnerAudioContext(); //音频实例
    innerAudioContext.src = _this.playURL[_this.current][_this.range.index].mezzanine.fileURL;
    innerAudioContext.play();
    innerAudioContext.onEnded((res) => {
      //判断有没有到本页的最后一条
      if (_this.range.index < _this.range.list[_this.current].length - 1) {
        innerAudioContext.stop(); //停止
        innerAudioContext.destroy();
        this.setData({
          'range.index': _this.range.index + 1
        })
        this.a(); //未到结尾,重复调用
      } else { //本页播放完
        if (_this.bookset.length - 1 > _this.current) { //没有到最后一页
          if (_this.newcurrent == _this.newlist[_this.newindex].length - 1) {
            _this.newcurrent = 0;
            _this.newindex++
          } else {
            _this.newcurrent++ //页码++
          }
          this.setData({
            'range.index': 0, //本页播放到第0条，重置
            newcurrent: _this.newcurrent,
            newindex: _this.newindex
          })
          if (typeof(_this.playURL[_this.current]) == 'undefined') { //之前是否存有本页选区和音频，没有的话重新请求
            this.xuanqu();
          } else { //否则直接开始调用播放本函数
            //切换页码，重新调用函数
            this.a();
          }
        } else {
          innerAudioContext.stop();
          innerAudioContext.destroy();
          this.setData({
            'topBtn.continuous': false,
            'range.index': 0,
          })
          util.iconnone('最后一页了哟')
          return;
        }
      }
    })
  },
  //切换底部导航
  swipertab: function(e) {
    let index = e.currentTarget.dataset.index,
      _this = this.data;
    if (index > 9) {
      if (_this.newindex != (index - (index % 10)) / 10) {
        this.setData({
          loadtemp: true
        })
      }
      _this.newindex = (index - (index % 10)) / 10;
      _this.newcurrent = index % 10
    } else {
      if (_this.newindex != 0) {
        this.setData({
          loadtemp: true
        })
      }
      _this.newindex = 0;
      _this.newcurrent = index
    }
    if (_this.current !== index) {
      this.topBtn();
      this.setData({
        topBtn: this.data.topBtn
      });
    }
    _this.current = index;
    this.setData({
      current: _this.current,
      newindex: _this.newindex,
      newcurrent: _this.newcurrent
    })
    setTimeout(() => {
      this.setData({
        loadtemp: false,
      })
    }, 500)
  },
  //语速
  speechrate: function() {
    util.iconnone('此功能暂未开启');
  },
  //调节语速
  controlStart: function(e) {
    this.data.progress.startX = e.touches[0].pageX;
    progressVal = this.data.progress.val;
  },
  controlMove: function(e) {
    let _this = this.data,
      speel = 0,
      startX = _this.progress.startX,
      moveX = e.touches[0].pageX,
      boxWidth = _this.progress.width,
      val = (boxWidth / 100 * progressVal + (moveX - startX)) / boxWidth * 100;
    if (val > 0 && val < 100) {
      val > 50 ? _this.progress.speed = false : _this.progress.speed = true;
      _this.progress.val = val.toFixed(1);
      _this.speechval = (_this.progress.val / 50).toFixed(1);
      /**导致安卓卡顿问题---待处理**/
      this.setData({
        progress: _this.progress,
        speechval: _this.speechval
      })
    } else {
      this.controlEnd()
    }
  },
  controlEnd: function() {},
  //点击蒙层，关闭语速调节
  speechrateMask: function() {
    this.setData({
      'topBtn.speechrate': false
    })
  },
  slideleft: function() {
    this.setData({
      leftul: 0,
      leftul_show: true
    })
    this.topBtn();
    this.setData({
      topBtn: this.data.topBtn
    });
  },
  //关闭侧边栏；
  maskmouver: function() {
    this.setData({
      leftul: -this.data.windowW / 750 * 640,
      leftul_show: false
    })
  },
  showControl: function() {
    let _this = this.data;
    if (_this.showCont) {
      this.setData({
        bottom_show: !this.data.bottom_show,
        top_show: !this.data.top_show,
        showCont: false
      })
      setTimeout(() => {
        this.setData({
          showCont: true
        })
      }, 1000)
    }
  },
  //返回上一页
  previouspage: function() {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let _this = this.data,
        tant=this;
    //目录
    try {
      const value = wx.getStorageSync('user');
      if (value) {
        requestFun.request('api', 'GET', '/book/menu_tree?bookId=' + _this.bookid, 'Bearer ' + JSON.parse(value).access_token).then((res) => {
          this.forListeach(res.data.data,_this,tant)
          console.log(_this.menulistIndex)
          this.setData({
            menulist: res.data.data,
            menulistIndex: _this.menulistIndex
          })
        }).catch((res) => {
          console.log('错误' + res)
        })
      }
    } catch (err) {
      console.log(err);
    }
  },
  /***监听页码改变***/
  swiperchang: function(e) {
    this.setData({
      movable: {
        scalevalue: 1, //图片缩放的值
        width: 0,
        scaleis: false,
        x: 0,
        startX: 0,
      },
    })
    //目录
    let _this = this.data,
      index = _this.menulist.findIndex(x => {
        return x.pageSequence >= _this.current + 1
      });
    if (index > 0 && _this.menulist[index].pageSequence != _this.current + 1) {
      index = index - 1;
    }
    _this.newcurrent = e.detail.current
    if (_this.newindex != 0) {
      _this.current = _this.newindex * 10 + e.detail.current
    } else {
      _this.current = e.detail.current
    }
    truefor = true
    temporary = 0
    this.forListeach(_this.menulist,_this,this);
    this.setData({
      'current': _this.current,
      newcurrent: _this.newcurrent,
      menulistIndex: _this.menulistIndex
    })
    let winW = wx.getSystemInfoSync().windowWidth,
      leftall = winW / 750 * 100,
      scrollleft;
    if (_this.current > 4 || _this.current < _this.bookset.length - 4) {
      scrollleft = leftall * (_this.current - 3)
    } else if (_this.current <= 4) {
      scrollleft = 0
    } else if (_this.current >= _this.bookset.length - 4) {
      scrollleft = _this.bookset.length - 4 * leftall
    }
    this.setData({
      scrollleft: scrollleft
    })
    if (typeof(_this.playURL[_this.current]) == 'undefined') {
      try {
        const value = wx.getStorageSync('user');
        if (value && typeof(_this.range.list[_this.current]) == 'undefined') {
          requestFun.request('api', 'GET', '/book/page/getByBookIdAndSequence?bookId=' + _this.bookid + "&sequence=" + _this.bookset[_this.current].sequence, 'Bearer ' + JSON.parse(value).access_token).then((res) => {
            _this.range.list[_this.current] = res.data.data;
            //页面选区
            this.setData({
              'range.list': _this.range.list
            })
            if (res.data.data.length <= 0) {
              return;
            }
            try {
              let audioId = '',
                audioContentTrans = [];
              res.data.data.forEach((val, index) => {
                if (typeof(val.audioAliVid) != 'undefined') {
                  audioId += val.audioAliVid + ','
                } else {
                  this.setData({
                    loadtemp: false
                  })
                  throw new Error('暂无音频');
                }
                if (typeof(val.audioContentTrans) != 'undefined') {
                  audioContentTrans.push(val.audioContentTrans)
                }
              })
              this.setData({
                audioContentTrans: audioContentTrans
              })
              audioId = audioId.substr(0, audioId.length - 1);
              requestFun.request('aliVod', 'GET', '/mediaResource/getVideoInfos?videoIds=' + audioId).then((res) => {
                _this.playURL[_this.current] = res.data.data;
                this.setData({
                  loadtemp: false
                })
              }).catch((res) => {
                console.log(res)
              })
            } catch (res) {
              util.iconnone(res.message)
            }
          }).catch((res) => {
            console.log('错误' + res)
          })
        }
      } catch (err) {
        console.log(err)
      }
    }
  },
  /*** 生命周期函数--监听页面显示*/
  onShow: function() {},
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    innerAudioContext.stop(); //停止
    innerAudioContext.destroy();
    let _this = this.data;
    try {
      let browse = wx.getStorageSync('browse');
      let obj = {
        bookid: _this.bookid,
        current: _this.current
      }
      if (browse.length == 0) {
        browse = [obj];
        wx.setStorageSync('browse', browse)
      } else {
        let bookobj = browse.find(x => x.bookid == _this.bookid);
        if (typeof(bookobj) == 'undefined') {
          let objc = {
            bookid: _this.bookid,
            current: _this.current
          };
          browse.push(objc);
          wx.setStorageSync('browse', browse)
        } else {
          let index = browse.findIndex(x => x.bookid == _this.bookid);
          browse[index].current = _this.current;
          wx.setStorageSync('browse', browse)
        }
      }
    } catch (err) {
      console.log(err)
    }
  },
  /**页面相关事件处理函数--监听用户下拉动作**/
  onPullDownRefresh: function() {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},
  topBtn: function(name) {
    // console.log('切换-----播放停止');
    innerAudioContext.stop();
    innerAudioContext.destroy();
    for (let i in this.data.topBtn) {
      if (i != name) {
        this.data.topBtn[i] = false;
        switch (i) {
          case 'continuous': //连播状态下，清除定时器,初始化index
            this.setData({
              'range.index': 0
            })
            break;
          case 'sreading': //单读状态时，初始化index
            this.setData({
              sreadIndex: -1,
              bottom_show: false
            })
            break;
          case 'repeat':
            this.setData({
              repeat: {
                startcurrent: -1, //起点的页码
                startindex: -1,
                endcurrent: -1, //终点的页码
                endindex: -1,
                tiptext: '请选择复读的起始位置'
              }
            })
            break;
        }
      }
    }
  },
  //目录切换
  listnavbackto: function(e) {
    let _this = this.data;
    if (typeof (e.detail.seq) != 'undefined') {
      _this.current = e.detail.seq - 1
    }
    let winW = wx.getSystemInfoSync().windowWidth,
      leftall = winW / 750 * 100,
      scrollleft;
    if (_this.current > 4 || _this.current < _this.bookset.length - 4) {
      scrollleft = leftall * (_this.current - 3)
    } else if (_this.current <= 4) {
      scrollleft = 0
    } else if (_this.current >= _this.bookset.length - 4) {
      scrollleft = _this.bookset.length - 4 * leftall
    }
    if (_this.current > 9) {
      if (_this.newindex != (_this.current - (_this.current % 10)) / 10) {
        this.setData({
          loadtemp: true
        })
      }
      _this.newindex = (_this.current - (_this.current % 10)) / 10;
      _this.newcurrent = _this.current % 10
    } else {
      if (_this.newindex != 0) {
        this.setData({
          loadtemp: true
        })
      }
      _this.newindex = 0;
      _this.newcurrent = _this.current
    }
    this.setData({
      menulistIndex: e.detail.itemid,
      current: _this.current,
      newcurrent: _this.newcurrent,
      newindex: _this.newindex,
      leftul: -this.data.windowW / 750 * 640,
      leftul_show: false,
      scrollleft: scrollleft
    })
    setTimeout(() => {
      this.setData({
        loadtemp: false,
      })
    }, 500)
  },
  //开启翻译
  translation: function() {
    this.setData({
      translation: !this.data.translation
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    return {
      title: "",
      path: "pages/read/read?current=" + this.data.current
    }
  },
  prohibitever: function() { //停止所有的播放
    this.setData({
      topBtn: {
        repeat: false, //复读
        speechrate: false, //语速
        continuous: false, //连续播放
        sreading: false,
        startaudio: false,
        is_loop: true
      },
      repeat: {
        startcurrent: -1, //起点的页码
        startindex: -1,
        endcurrent: -1, //终点的页码
        endindex: -1,
        startpage: 0,
        endpage: 0,
        tiptext: '请选择复读的起始位置',
      },
      sreadIndex: -1,
      'range.index': 0
    })
    innerAudioContext.stop();
    innerAudioContext.destroy();
  },
  //暂停
  timeout: function() {
    let _this = this.data;
    innerAudioContext.stop();
    innerAudioContext.destroy();
    this.setData({
      timeout: !_this.timeout
    })
    if (_this.timeout) {
      this.a();
    }
  },
  forListeach: function (list, _this, tant){
    list.forEach((v,i)=>{
      if (truefor){
        if (typeof (v.childMenus) == 'undefined') {
          if (v.pageSequence > _this.current + 1) {
            if (temporary!=0){
              _this.menulistIndex = temporary
            }else{
              _this.menulistIndex=v.id
            }
            truefor = false
            return;
          }else{
            temporary = v.id
          }
        } else {
          tant.forListeach(v.childMenus, _this, tant)
        }
      }else{
        return
      }
    })
  },
  forbidMove: function(e) {
    return;
  }
})