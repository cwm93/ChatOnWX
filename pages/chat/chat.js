//index.js
//获取应用实例
const app = getApp()

var page = 1;
var page_size = 20;

var GetList = function (self) {
  self.setData({ hidden: false});
  let hasuserInfo = app.globalData.userInfoAPI.value == undefined;
  if (hasuserInfo) {
    wx.request({
      url: app.globalData.baseUrl + 'api/Chat/GetChatList',
      method: "POST",
      data: { "Head": { "Token": "", "AppType": 0 },
        "Content": { "UserId": 1,"PageIndex": page,"PageCount": page_size}
      },
      header: { "Content-Type": "application/json" },
      success: function (res) {
        if (res.data.head.success) {
          console.info("获取聊天列表成功！")
          var list = self.data.chatList;
          for (var i = 0; i < res.data.content.length; i++) {
            list.push(res.data.content[i]);
          }
          self.setData({chatList: list});
          page++;
          self.setData({ hidden: true });
        }
        else{ 
          console.error("获取聊天列表失败！");
          self.setData({ hidden: true });}
      },
      fail: function (res) { console.error("获取聊天列表失败！"); }
    })
  }
  else { console.info("获取用户信息失败！")}
}

Page({
  data: {
    chatList: [],
    hidden: true,
    scrollTop: 0,
    scrollHeight: 400
  },

  onLoad: function () {
    let self = this;
    wx.getSystemInfo({
      success: function (res) {
        console.info("当前设备屏幕高度："+res.windowHeight);
        self.setData({ scrollHeight: res.windowHeight });
      }
    });
    GetList(this);
  },

  onShow: function () { 
    //GetList(this);
    },

  //滚动到底部时加载数据
  bindDownLoad: function () { GetList(this); },

  scroll: function (event) {
    this.setData({scrollTop: event.detail.scrollTop });
  },

//滚动到顶部刷新
  refresh: function (event) {
    page = 1;
    this.setData({ scrollTop: 0,chatList: []});
    GetList(this)
  },

  //清除未读提示
  clearunreadCount: function (event) {
    var self = this;
    let partnerId = event.currentTarget.dataset.idx; 
    let index = event.currentTarget.dataset.key;
    if (self.data.chatList[index].unreadCount !="")
    {
      wx.request({
        url: app.globalData.baseUrl + 'api/Chat/ClearUnRead',
        method: "POST",
        data: {
          "Head": { "Token": "", "AppType": 0 },
          "Content": {
            "UserId": 1,//app.globalData.userInfoAPI.userId,
            "PartnerId": partnerId
          }
        },
        header: { "Content-Type": "application/json" },
        success: function (res) {
          if (res.data.head.success && res.data.content)
          {
            console.info("清除未读消息数量成功");
            self.data.chatList[index].unreadCount = '';
            self.setData({ chatList: self.data.chatList })
          }
        },
        fail: function (res) { console.error("清除未读消息数量失败！"); }
      })
    }
  },

  //长按删除该好友
  deleteItem: function (event) {
    var self = this;
    let partnerId = event.currentTarget.dataset.idx;
    let index = event.currentTarget.dataset.key;
    wx.showModal({
      title: '提示',
      content: '确定要删除该消息吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.baseUrl + 'api/UserInfo/DeleteFriend',
            method: "POST",
            data: {
              "Head": { "Token": "", "AppType": 0 },
              "Content": { "UserId": 1,//app.globalData.userInfoAPI.userId,
                "PartnerId": partnerId }
            },
            header: { "Content-Type": "application/json" },
            success: function (res) {
              if (res.data.head.success && res.data.content) { 
                let list = self.data.chatList;
                list.splice(index, 1);
                self.setData({ chatList: list });
                }
              else { console.error("数据库删除好友失败") }
            },
            fail: function (res) { console.error("数据库删除好友失败")  }
          })
        } 
        else if (res.cancel) { return false; }
      }
    })
  },
})


