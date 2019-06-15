const app = getApp()
const util = require('../../utils/util.js');
const requestFun = require('../../utils/request.js');
Page({
  /**页面的初始数据**/
  data: {
    userInfo: {},
    check_id: 0,
    showSkeleton: true, //骨架屏幕
    is_click: false,
    winWidth: 0, //视口宽度
    contentH: 0, //内容box的高度
    avatartop: 0,
    headerH: 0, //头部高度
    titleBarHeight: 0,
    statusBarHeight: 0,
    animation: '',
    imgurl: '',
    list: [{}],
    showmodal: false,
    operating: false,
    edittabber: false,
    tips: false,
    tipstext: '',
    chenum: 0,
    seachsub: []
  },
  /*** 生命周期函数--监听页面加载*/
  onLoad: function(options) {
    let _this = this.data,
      that = this;
    //屏幕可用宽度
    _this.winWidth = wx.getSystemInfoSync().windowWidth;
    wx.getSystemInfo({
      success: function(res) {
        let titleBarHeight = 0
        if (res.model.indexOf('iPhone') !== -1) {
          titleBarHeight = 44
        } else {
          titleBarHeight = 48
        }
        _this.avatartop = (titleBarHeight - (_this.winWidth / 750 * 60)) / 2;
        _this.headerH = (_this.winWidth / 750 * 144) + titleBarHeight + 20;
        _this.contentH = wx.getSystemInfoSync().windowHeight - _this.headerH;
        that.setData({
          avatartop: _this.avatartop,
          headerH: _this.headerH,
          statusBarHeight: res.statusBarHeight,
          titleBarHeight: titleBarHeight,
          contentH: _this.contentH
        });
      },
      failure() {
        that.setData({
          statusBarHeight: 0,
          titleBarHeight: 0
        });
      }
    })
    this.getUserInfo();
  },
  //长按
  userPress: function(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      operating: true,
      edittabber: true,
      is_click: true,
    })
  },
  editcheck: function(e) {
    let id = e.currentTarget.dataset.id,
      _this = this.data;
    this.setData({
      showmodal: true,
      check_id: id
    })
  },
  cancelClick: function() {
    this.setData({
      showmodal: false,
      operating: false
    })
  },
  addClick: function() {
    let _this = this.data;
    this.setData({
      showmodal: false,
      operating: false
    })
    let index = _this.list.findIndex((val) => {
      return val.id == _this.check_id
    })
    try {
      const value = wx.getStorageSync('user');
      if (value) {
        requestFun.request('api', 'DELETE', '/shelf/deleteByBookIds?bookIds=' + _this.check_id, {}, 'Bearer ' + JSON.parse(value).access_token).then((res) => {
          if (res.data.data.delete) {
            _this.list.splice(index, 1);
            this.setData({
              list: _this.list,
              tipstext: '删除成功',
              tips: true,
            })
            setTimeout(() => {
              this.setData({
                tips: false,
              })
            }, 1500)
            // wx.showToast({
            //   title: '删除成功',
            //   icon: 'none',
            //   duration: 1000,
            //   mask: true
            // })
          }
        }).catch((err) => {
          console.log(err)
        })
      }
    } catch (e) {
      console.log(e)
    }
  },
  // 添加
  addbook: function() {
    wx.navigateTo({
      url: '../look/pages/addbook/addbook',
    })
  },
  //详情
  infobook: function(e) {
    let index = e.currentTarget.dataset.index,
      _this = this.data;
    if (!this.data.is_click) {
      let bookinfo = {
        bookid: e.currentTarget.dataset.id,
        subjectId: e.currentTarget.dataset.subjectid,
      }
      let info = _this.seachsub[1].find(x => x.Id == _this.list[index].bbId).Name + '/' + _this.seachsub[2].find(x => x.Id == _this.list[index].gradeId).Name + '/' + _this.seachsub[3].find(x => x.Id == _this.list[index].jdId).Name,
        subject = _this.seachsub[0].find(x => x.Id == _this.list[index].subjectId).Name + '教材';
      wx.navigateTo({
        url: '../reads/read?bookinfo=' + JSON.stringify(bookinfo) + '&info=' + info + '&subject=' + subject + '&cover=' + _this.list[index].cover,
      })
    } else {
      _this.is_click = false
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let _this = this.data;
    //学科
    requestFun.request('taozhi', 'POST', '/_Source/BookHandler.ashx?op=FindSubjectList').then((res) => {
      _this.seachsub[0] = res.data.data
      return requestFun.request('taozhi', 'POST', '/_Source/BookHandler.ashx?op=FindBBList');
    }).catch((res) => {
      console.log('错误' + res)
    }).then((res) => {
      _this.seachsub[1] = res.data.data
      return requestFun.request('taozhi', 'POST', '/_Source/BookHandler.ashx?op=FindGradeList');
    }).catch((res) => {
      console.log('错误' + res)
    }).then((res) => { //年级
      _this.seachsub[2] = res.data.data
      return requestFun.request('taozhi', 'POST', '/_Source/BookHandler.ashx?op=FindJDList');
    }).catch((res) => {
      console.log('错误' + res)
    }).then((res) => { //阶段
      _this.seachsub[3] = res.data.data;
      app.globalData.seachsub = _this.seachsub
      this.setData({
        seachsub: _this.seachsub
      })
    }).catch((res) => {
      console.log('错误' + res)
    })
  },
  imageLoad: function() {
    let _this = this.data,
      tant = this;
    let animation = wx.createAnimation({
      duration: 1500,
      timingFunction: 'linear',
    });
    animation.translate3d(0, -(_this.winWidth * 20 / 750), 0).step();
    tant.setData({
      animation: animation.export()
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    try {
      const value = wx.getStorageSync('user')
      if (value) {
        requestFun.request('api', 'GET', '/shelf', {}, 'Bearer ' + JSON.parse(value).access_token).then((res) => {
          if (res.data.data.length > 0) {
            res.data.data.unshift({})
            res.data.data.forEach((v, i) => {
              v.check = false;
              v.cover = app.globalData.imgurl + v.cover + '?x-oss-process=style/book-cover'
            })
            this.setData({
              list: res.data.data,
              showSkeleton: false
            })
          } else {
            this.setData({
              showSkeleton: false
            })
            util.iconnone('暂无添加')
          }
        }).catch((err) => {
          wx.reLaunch({
            url: '../login/login',
            success: () => {
              wx.removeStorageSync('user')
            }
          })
          console.log(err)
        })
      }
    } catch (e) {
      console.log(e)
    }
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
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  canceloper: function() {
    this.setData({
      operating: false
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  getUserInfo: function() {
    wx.getUserInfo({
      success: (res) => {
        this.data.userInfo = res.userInfo;
        this.setData({
          'userInfo.avatarUrl': res.userInfo.avatarUrl
        })
      }
    })
  }
})