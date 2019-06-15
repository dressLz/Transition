// pages/login/login.js
const util = require('../../utils/util.js');
const requestFun = require('../../utils/request.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    btn: false,
    loadtemp: false,
    titleBarHeight: 0,
    statusBarHeight: 0
  },
  /**生命周期函数--监听页面加载**/
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
        _this.headerH = (_this.winWidth / 750 * 144) + titleBarHeight + 20;
        _this.contentH = wx.getSystemInfoSync().windowHeight - _this.headerH;
        that.setData({
          statusBarHeight: res.statusBarHeight,
          titleBarHeight: titleBarHeight,
        });
      },
      failure() {
        that.setData({
          statusBarHeight: 0,
          titleBarHeight: 0
        });
      }
    })
    wx.getSetting({ //获取用户登录状态
      success: res => {
        if (res.authSetting['scope.userInfo'] != undefined && res.authSetting['scope.userInfo'] != false && wx.getStorageSync('user').length != 0) {
          wx.reLaunch({
            url: '../index/index'
          })
        } else {
          this.setData({
            btn: true
          })
        }
      }
    })
  },
  login: function(e) {
    let tant = this;
    wx.login({
      success: function(t) {
        if (e.detail.userInfo) {
          let obj = {
            code: t.code,
            iv: e.detail.iv,
            encryptedData: e.detail.encryptedData,
          }
          let data = {
            grant_type: 'password',
            username: t.code,
            password: '',
            login_type: 'weChat',
            application_id: 1,
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv,
          };
          tant.setData({
            loadtemp: true
          })
          /****交互****/
          requestFun.request('security', 'POST', '/oauth/token', data).then((res) => {
            wx.setStorage({
              key: 'user',
              data: JSON.stringify(res.data),
              success: (res) => {
                wx.reLaunch({
                  url: '../index/index',
                })
                tant.setData({
                  loadtemp: false
                })
              }
            })
          }).catch((err) => {
            console.log(err)
          })
        } else {
          wx.showModal({
            title: '警告',
            content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
            showCancel: false,
            confirmText: '返回授权',
            success: function(res) {
              if (res.confirm) {}
            }
          })
        }
      },
      fail: function(error) {
        console.log(error);
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
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
    this.setData({
      loadtemp: false
    })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})