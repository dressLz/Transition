var api = 'https://api.audiobook.dev.taozhi.cn'; //服务器
var alivod = 'https://alivod.dev.taozhi.cn'; //视频
var security = 'https://security.dev.taozhi.cn'; //登录          
var taozhi = 'https://www.taozhi.cn';
// 网络请求
function request(urltype, type, url, data, auth) {
  let http = '',
    header = {};
  switch (urltype) {
    case 'api':
      http = api;
      header = {
        "Authorization": auth
      }
      break;
    case 'security':
      http = security;
      header = {
        'content-type': "application/x-www-form-urlencoded",
        'Authorization': 'Basic dGFvemhpOk1FVmwwSWdndngzMVVObm1QSURp'
      };
      break;
    case 'aliVod':
      http = alivod;
      break;
    case 'taozhi':
      http = taozhi;
      header = {
        'content-type': "application/x-www-form-urlencoded"
      };
      break;
  }
  var data = new Promise(function(resolve, reject) {
    wx.request({
      header: header,
      url: http + url,
      method: type,
      data: data,
      success: function(res) {
        resolve(res)
      },
      fail: function(res) {
        console.log(res)
        reject("系统异常，请重试！");
      },
      complete: function(res) {
        wx.hideLoading()
      },
    })
  });
  return data;
}
module.exports = {
  request: request
}