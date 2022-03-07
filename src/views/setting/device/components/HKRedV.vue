<template>
  <div class="hkv-wrap" ref="hkv">
    <div id="divPlugin" class="plugin"></div>
  </div>
</template>

<script>
import { WebVideoCtrl } from '@/plugins/video-haikang/codebase/web-video-ctrl.js'
export default {
  props: {
    tab: {
      type: String,
      default: '0'
    }
  },
  watch: {
    tab: {
      handler(val) {
        this.clickStopRealPlay()
        this.onLogout()
        if (val == '0') {
          const ipinfo = JSON.parse(this.$storage.getItem('lightMode'))
          this.hkvInfo = {
            ip: ipinfo[0], //海康威视摄像头/硬盘录像机的ip地址
            port: ipinfo[1], //海康威视摄像头/硬盘录像机的端口
            username: ipinfo[2], //海康威视摄像头/硬盘录像机的用户名
            password: ipinfo[3], //海康威视摄像头/硬盘录像机的密码
            channels: [] //海康威视摄像头/硬盘录像机的通道
          }
        } else {
          const ipinfo = JSON.parse(this.$storage.getItem('infraredMode'))
          this.hkvInfo = {
            ip: ipinfo[0], //海康威视摄像头/硬盘录像机的ip地址
            port: ipinfo[1], //海康威视摄像头/硬盘录像机的端口
            username: ipinfo[2], //海康威视摄像头/硬盘录像机的用户名
            password: ipinfo[3], //海康威视摄像头/硬盘录像机的密码
            channels: [] //海康威视摄像头/硬盘录像机的通道
          }
        }

        this.videoInitPlugin() // 初始化video界面
      }
    }
  },
  data() {
    return {
      hkvInfo: {
        channels: [] //海康威视摄像头/硬盘录像机的通道
      },
      mySelectWnd: 0, //当前选中的窗口
      g_bPTZAuto: false,
      iProtocol: 1,
      loginLoading: false,
      startPlayLoading: false,
      iStreamType: 1,
      bZeroChannel: false,
      iRtspPort: 0
    }
  },
  mounted: function () {
    const ipinfo = JSON.parse(this.$storage.getItem('infraredMode'))
    this.hkvInfo = {
      ip: ipinfo[0],
      port: ipinfo[1],
      username: ipinfo[2],
      password: ipinfo[3],
      channels: []
    }
    // this.objectHIK = {
    //   szIP: ipinfo[0],
    //   szPort: ipinfo[1],
    //   szUsername: ipinfo[2],
    //   szPassword: ipinfo[3],
    //   iStreamType: 1,
    //   iWndIndex: 0,
    //   iChannelID: 1
    // }
    this.videoInitPlugin() // 初始化video界面
    // this.clickInitPlugin(1)
  },

  destroyed: function () {
    this.clickStopRealPlay()
    this.onLogout()
  },
  methods: {
    onLogin() {
      const that = this
      that.loginLoading = true
      // 登录设备
      WebVideoCtrl.I_Login(that.hkvInfo.ip, that.iProtocol, that.hkvInfo.port, that.hkvInfo.username, that.hkvInfo.password, {
        async: true,
        success: function (xmlDoc) {
          console.log('xmlDoc2', xmlDoc) //不能删除
          //TODO 获取通道信息
          that.getChannelInfo()
          that.getDevicePort(that.hkvInfo.ip + '_' + that.hkvInfo.port)

          that.clickStartRealPlay()
        },
        error: function () {
          that.loginLoading = false
          that.$message({
            showClose: true,
            message: '登录失败',
            type: 'error'
          })
        }
      })
    },
    onLogout() {
      this.hkvInfo.channels = []
      var szDeviceIdentify = this.hkvInfo.ip + '_' + this.hkvInfo.port
      var iRet = WebVideoCtrl.I_Logout(szDeviceIdentify)
      if (0 == iRet) {
        // this.$message({
        //   showClose: true,
        //   message: "退出成功",
        //   type: "success"
        // });
      } else {
        // this.$message({
        //   showClose: true,
        //   message: "退出失败",
        //   type: "error"
        // });
      }
    },
    clickStartRealPlay() {
      // 开始预览
      var that = this
      that.startPlayLoading = true
      var szDeviceIdentify = that.hkvInfo.ip + '_' + that.hkvInfo.port
      var j = that.hkvInfo.channels.length > 4 ? 4 : that.hkvInfo.channels.length
      for (var i = 0; i < j; i++) {
        setTimeout(that.startRealPlay(szDeviceIdentify, i, that.hkvInfo.channels[i]), 500)
      }
      that.startPlayLoading = false
    },
    videoInitPlugin: function () {
      var iRet = WebVideoCtrl.I_CheckPluginInstall()
      if (iRet === -1) {
        // alert("您还未安装过插件，双击开发包目录里的WebComponentsKit.exe安装");
        var a = document.createElement('a')
        a.setAttribute('href', '/codebase/WebComponentsKit.exe')
        a.setAttribute('download', 'WebComponentsKit.exe')
        document.body.appendChild(a)
        a.click()
        return
      }
      this.initPlugin()
    },
    initPlugin: function () {
      var that = this
      // console.log(this.$refs.hkv.clientWidth);
      const cw = this.$refs?.hkv?.clientWidth || '100%'
      const ch = this.$refs?.hkv?.clientHeight || 200
      WebVideoCtrl.I_InitPlugin(cw, ch, {
        bWndFull: true, //是否支持单窗口双击全屏，默I_CheckPluginInstall
        iWndowType: 1,
        myCbSelWnd: function (xmlStr) {
          //自己新增的方法
          var jsonObj = that.$x2js.xml2js(xmlStr)
          that.mySelectWnd = jsonObj.RealPlayInfo.SelectWnd
          var szInfo = '当前选择的窗口编号：' + that.mySelectWnd
        },
        cbInitPluginComplete: function () {
          WebVideoCtrl.I_InsertOBJECTPlugin('divPlugin')
          // 检查插件是否最新
          if (WebVideoCtrl.I_CheckPluginVersion() === -1) {
            alert('检测到新的插件版本，双击开发包目录里的WebComponentsKit.exe升级！')
            return
          }
          //先调用窗口分割方法
          that.changeWndNum('1')
          setTimeout(() => {
            //调用登录方法
            that.onLogin()
          }, 100)
        }
      })
    },
    changeWndNum(iType) {
      iType = parseInt(iType, 10)
      WebVideoCtrl.I_ChangeWndNum(iType)
    },
    getDevicePort: function (szDeviceIdentify) {
      var oPort = WebVideoCtrl.I_GetDevicePort(szDeviceIdentify)
      this.iRtspPort = oPort.iRtspPort
    },
    startRealPlay: function (szDeviceIdentify, iWndIndex, iChannelID) {
      var that = this
      WebVideoCtrl.I_StartRealPlay(szDeviceIdentify, {
        iRtspPort: that.iRtspPort,
        iWndIndex: iWndIndex,
        iStreamType: 1,
        iChannelID: iChannelID,
        bZeroChannel: that.bZeroChannel,
        success: function () {
          that.$notify({
            title: '成功',
            message: '开始预览',
            type: 'success'
          })
        },
        error: function (status, xmlDoc2) {
          console.log(xmlDoc2) //不能删除
          // that.$notify({
          //   title: "失败",
          //   message: "开始预览通道" + iChannelID + "失败",
          //   type: "error"
          // });
          if (status === 403) {
            console.log('szInfo 设备不支持Websocket取流！')
          } else {
            console.log('开始预览失败 ', status, xmlDoc2)
          }
        }
      })
    },
    clickStopRealPlay: function () {
      var j = this.hkvInfo.channels.length > 4 ? 4 : this.hkvInfo.channels.length
      for (var i = 0; i < j; i++) {
        setTimeout(this.stopRealPlay(i), 1000)
      }
    },
    stopRealPlay: function (iWndIndex) {
      var that = this
      WebVideoCtrl.I_Stop({
        iWndIndex: iWndIndex,
        success: function () {
          // that.$notify({
          //   title: "成功",
          //   message: "停止预览窗口" + iWndIndex + "成功",
          //   type: "success"
          // });
        },
        error: function () {
          // that.$notify({
          //   title: "失败",
          //   message: "停止预览窗口" + iWndIndex + "失败",
          //   type: "error"
          // });
        }
      })
    },
    // 获取通道，实际上可以根据自己的项目，获取数字通道，模拟通道，零通道中的一个或多个，不用全部获取（提高效率）
    getChannelInfo: function () {
      var that = this
      var szDeviceIdentify = this.hkvInfo.ip + '_' + this.hkvInfo.port
      // debugger
      // 数字通道
      that.hkvInfo.channels = []
      WebVideoCtrl.I_GetDigitalChannelInfo(szDeviceIdentify, {
        async: false,
        mysuccess: function (xmlStr) {
          console.log('mysuccess I_GetDigitalChannelInfo: ', xmlStr)
          var jsonObj = that.$x2js.xml2js(xmlStr)
          var list = jsonObj.InputProxyChannelStatusList.InputProxyChannelStatus
          for (var x = 0; x < list.length; x++) {
            that.hkvInfo.channels.push(list[x].id)
          }
        },
        success: function (xmlDoc) {},
        error: function (status, xmlDoc) {
          console.log('获取数字通道失败')
        }
      })
      // TODO 模拟通道
      // 模拟通道
      WebVideoCtrl.I_GetAnalogChannelInfo(szDeviceIdentify, {
        async: false,
        mysuccess: function (xmlStr) {
          var jsonObj = that.$x2js.xml2js(xmlStr)
          // var list = jsonObj.VideoInputChannelList;
          // for (var x = 0; x < list.length; x++) {
          //   that.hkvInfo.channels.push(list[x].VideoInputChannel.id);
          // }
          var id = jsonObj.VideoInputChannelList.VideoInputChannel[1].id
          that.hkvInfo.channels.push(id)
        },
        success: function (xmlStr) {
          console.log('模拟通道success', xmlStr)
        },
        error: function (status, xmlDoc) {
          console.log('模拟通道error', xmlDoc)
        }
      })
      // TODO 零通道
    }
  }
}
</script>

<style scoped>
.hkv-wrap {
  width: 100%;
  height: 100%;
}
.plugin {
  width: 100%;
  height: 200px;
}

.my-tag {
  margin-left: 3px;
}

.my-group-btn {
  margin-top: 0;
}
</style>
