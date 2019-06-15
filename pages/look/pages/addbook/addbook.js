const util = require('../../../../utils/util.js');
const app = getApp();
const requestFun = require('../../../../utils/request.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loadtemp: false, //加载中
    addbookid: 0,
    showSkeleton: true, //骨架屏幕
    winWidth: 0,
    animation: '',
    imgurl: '',
    addbookM: false,
    bookList: [],
    seachIndex: 0,
    page: 0,
    size: 18,
    total: 0,
    namelist: ['subjectId', 'bbId', 'gradeId', 'jdId'],
    seachList: [{
        'name': '学科',
        'isshow': false
      },
      {
        'name': '版本',
        'isshow': false
      },
      {
        'name': '年级',
        'isshow': false
      },
      {
        'name': '阶段',
        'isshow': false
      }
    ], //筛选条件
    list: [{}, {}, {}, {}, {}, {}, {}],
    subjectshow: false,
    seachsub: [],
    tips: false,
    tipstext: '',
  },
  //初始化
  initi: function() {
    this.setData({
      bookList: [],
      seachIndex: 0,
      page: 0,
      size: 18,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  infobook: function(e) {
    let bookinfo = {
        bookid: e.currentTarget.dataset.id,
        subjectId: e.currentTarget.dataset.subjectid,
      },
      index = e.currentTarget.dataset.index,
      _this = this.data;
    let info = _this.seachsub[1].find(x => x.Id == _this.bookList[index].bbId).Name + '/' + _this.seachsub[2].find(x => x.Id == _this.bookList[index].gradeId).Name + '/' + _this.seachsub[3].find(x => x.Id == _this.bookList[index].jdId).Name,
      subject = _this.seachsub[0].find(x => x.Id == _this.bookList[index].subjectId).Name + '教材';
    wx.navigateTo({
      url: '../../../reads/read?bookinfo=' + JSON.stringify(bookinfo) + '&info=' + info + '&subject=' + subject + '&cover=' + _this.bookList[index].cover,
    })
  },
  onLoad: function(options) {
    let _this = this.data;
    this.setData({
      imgurl: app.globalData.imgurl,
      seachsub: app.globalData.seachsub
    })
    this.initi();
    this.bookrequest(_this, this);
    _this.winWidth = wx.getSystemInfoSync().windowWidth;
  },
  //添加到个人列表
  addbook: function(e) {
    this.setData({
      addbookM: true,
      addbookid: e.currentTarget.dataset.bookid
    })
  },
  cancelClick: function() {
    this.setData({
      addbookM: false
    })
  },
  addClick: function() {
    let _this = this.data;
    this.setData({
      addbookM: false
    })
    let index = _this.bookList.findIndex((val, index) => {
      return val.id == _this.addbookid
    })
    try {
      const value = wx.getStorageSync('user')
      if (value) {
        requestFun.request('api', 'POST', '/shelf', {
          bookId: this.data.addbookid
        }, 'Bearer ' + JSON.parse(value).access_token).then((res) => {
          _this.bookList[index].inShelf = true
          this.setData({
            bookList: _this.bookList,
            tips: true,
            tipstext: '添加成功'
          })
          setTimeout(() => {
            this.setData({
              tips: false
            })
          }, 1500)
        }).catch((err) => {
          console.log(err)
        })
      }
    } catch (e) {
      console.log(e)
    }
  },
  //筛选
  seachcondition: function(e) {
    let _this = this.data;
    _this.seachIndex = e.currentTarget.dataset.index;
    _this.seachList.forEach((val, index) => {
      if (index != _this.seachIndex) {
        val.isshow = false
      } else {
        val.isshow = !val.isshow
      }
    })
    if (_this.seachList[_this.seachIndex].isshow) {
      _this.subjectshow = true
    } else {
      _this.subjectshow = false
    }
    this.setData({
      subjectshow: _this.subjectshow,
      seachList: _this.seachList,
      seachIndex: _this.seachIndex
    })
  },
  //筛选
  selectedseach: function(e) {
    let index = e.currentTarget.dataset.index, //当前点击的是子列第几个 
      list = [],
      _this = this.data;
    _this.seachsub[_this.seachIndex][index].check = true;
    _this.seachsub[_this.seachIndex].forEach((val, indexs) => {
      if (index != indexs) {
        val.check = false
      }
    })
    _this.seachList[_this.seachIndex].isshow = false;
    this.setData({
      seachsub: _this.seachsub,
      seachIndex: _this.seachIndex,
      seachList: _this.seachList,
      subjectshow: false,
    })
    this.initi(); //初始化
    this.bookrequest(_this, this)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},
  bookrequest: function(_this, tant) {
    let list = [],
      datas = '';
    if (_this.total > _this.bookList.length || _this.page == 0) {
      this.setData({
        loadtemp: true
      })
      _this.page = _this.page + 1; //页码++
      _this.seachsub.forEach((val, index) => {
        list.push(0);
        val.forEach((vals, ins) => {
          if (vals.check) {
            list[index] = vals.Id
          }
        })
      })
      list.forEach((val, i) => {
        if (val != 0) {
          datas = datas + '&' + _this.namelist[i] + '=' + val
        }
      })
      let data = datas.substring(1, datas.length) + '&page=' + _this.page + '&size=' + _this.size;
      try {
        const value = wx.getStorageSync('user');
        if (value) {
          requestFun.request('api', 'GET', '/book?' + data + '&page=' + _this.page + '&size=' + _this.size+'&status='+2, {}, 'Bearer ' + JSON.parse(value).access_token).then((res) => {
            res.data.data.forEach((v, i) => {
              v.cover = app.globalData.imgurl + v.cover + '?x-oss-process=style/book-cover'
            })
            _this.bookList = _this.bookList.concat(res.data.data);
            tant.setData({
              bookList: _this.bookList,
              showSkeleton: false,
              total: res.data.totalElements,
              loadtemp: false
            })
          }).catch((err) => {
            console.log(err)
          })
        }
      } catch (e) {
        console.log(e)
      }
    } else {
      tant.setData({
        showSkeleton: false
      })
    }
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.bookrequest(this.data, this);
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})