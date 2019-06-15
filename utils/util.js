const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
/*
* 将一个数组分成几个同等长度的数组
* array[分割的原数组]
* size[每个子数组的长度]
*/
function sliceArray(array, size) {
  var result = [];
  for (var x = 0; x < Math.ceil(array.length / size); x++) {
    var start = x * size;
    var end = start + size;
    result.push(array.slice(start, end));
  }
  return result;
}
function stringify(obj) {
  let data = '';
  for (var i in obj) {
    data += i + '=' + obj[i] + '&'
  }
  return data.substr(0, data.length - 1)
}

function load() {
  wx.showLoading({
    title: '加载中...',
    mask: true
  })
}
//无图标提示
function iconnone(message) {
  wx.showToast({
    title: message,
    icon: 'none',
    mask: true,
  })
}
// 网络请求
function requestFun(type, url, data, auth) {
  var data = new Promise(function(resolve, reject) {
    wx.request({
      url: 'https://api.audiobook.dev.taozhi.cn' + url,
      method: type,
      data: data,
      header: {
        "Authorization": auth
      },
      success: function(res) {
        resolve(res)
      },
      fail: function(res) {
        reject("系统异常，请重试！")
      },
      complete: function(res) {
        wx.hideLoading()
      },
    })
  });
  return data;
}
module.exports = {
  formatTime: formatTime,
  requestFun: requestFun,
  iconnone: iconnone,
  load: load,
  stringify: stringify,
  sliceArray: sliceArray
}