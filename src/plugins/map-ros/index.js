/**
 * ros地图
 */
import { Message } from "element-ui";
import axios from "axios";
import { getToken } from "@/utils/auth";
import { getSiteIsUsing } from "@/api/setting/site";
import { getDocumentList } from "@/api/document";
import Cookies from "js-cookie";
import storage from "@/utils/storage";

var paintRos = {
  dom: null,
  bytes: [],
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    fileName: undefined,
    fileType: 2
  },
  load: function() {
    return new Promise((resolve, reject) => {
      this.x = []; //记录鼠标移动是的X坐标
      this.y = []; //记录鼠标移动是的Y坐标
      this.clickDrag = [];
      this.lock = false; //鼠标移动前，判断鼠标是否按下
      this.isEraser = false;
      //this.Timer=null;//橡皮擦启动计时器
      //this.radius=5;

      this.storageColor = "#000000";
      this.eraserRadius = 15; //擦除半径值
      this.color = [
        "#000000",
        "#FF0000",
        "#80FF00",
        "#00FFFF",
        "#808080",
        "#FF8000",
        "#408080",
        "#8000FF",
        "#CCCC00"
      ]; //画笔颜色值
      this.fontWeight = [2, 5, 8];
      this.$ = function(id) {
        return typeof id == "string" ? document.getElementById(id) : id;
      };
      this.canvas = document.getElementsByTagName("canvas")[0];
      if (this.canvas.getContext) {
      } else {
        alert("您的浏览器不支持 canvas 标签");
        return;
      }
      this.cxt = this.canvas.getContext("2d");
      this.cxt.lineJoin = "round"; //context.lineJoin - 指定两条线段的连接方式
      this.cxt.lineWidth = 5; //线条的宽度

      // var grd=this.cxt.createLinearGradient(0,0,175,50);
      // grd.addColorStop(0,"#FF0000");
      // grd.addColorStop(1,"#00FF00");
      // this.cxt.fillStyle=grd;
      // this.cxt.fillRect(0,0,175,50);

      this.w = this.canvas.width; //取画布的宽
      this.h = this.canvas.height; //取画布的高
      this.touch = "createTouch" in document; //判定是否为手持设备
      this.StartEvent = this.touch ? "touchstart" : "mousedown"; //支持触摸式使用相应的事件替代
      this.MoveEvent = this.touch ? "touchmove" : "mousemove";
      this.EndEvent = this.touch ? "touchend" : "mouseup";
      var input = this.$("fielinput");
      if (typeof FileReader === "undefined") {
        result.innerHTML =
          "抱歉，你的浏览器不支持 FileReader，请使用现代浏览器操作！";
        input.setAttribute("disabled", "disabled");
      } else {
      }

      // this.bind();
      resolve("111");
    });
  },
  bind: function() {
    var t = this;
  },
  movePoint: function(x, y, dragging) {
    /*将鼠标坐标添加到各自对应的数组里*/
    this.x.push(x);
    this.y.push(y);
    this.clickDrag.push(y);
  },
  preventDefault: function(e) {
    /*阻止默认*/
    var touch = this.touch ? e.touches[0] : e;
    if (this.touch) touch.preventDefault();
    else window.event.returnValue = false;
  },
  /** 查询文档列表 */
  loadDocumentList(dom, isShowCut) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      self.dom = dom;
      let mapData;
      if (isShowCut) {
        // 显示缩放导航图
        const res = await getSiteIsUsing();
        mapData = res.data[0].uploadPath;
      } else {
        self.queryParams.stationId = Cookies.get("stationId");

        const res = await getDocumentList(self.queryParams);
        if (res.rows.length) {
          mapData = res.rows[0].filePath;
        } else {
          const res2 = await getSiteIsUsing();
          mapData = res2.data[0].uploadOriginPath;
        }
      }

      const resFile = await axios({
        method: "get",
        url:
          process.env.VUE_APP_BASE_API +
          `/robot/upload/downloadByFilePath?filePath=${mapData}`,
        responseType: "blob",
        headers: { Authorization: "Bearer " + getToken() }
      });
      // //从response的headers中获取filename, 后端response.setHeader("Content-disposition", "attachment; filename=xxxx.docx") 设置的文件名;
      var patt = new RegExp("filename=([^;]+\\.[^\\.;]+);*");
      var contentDisposition = decodeURI(
        resFile.headers["content-disposition"]
      );
      var result = patt.exec(contentDisposition);
      var fileName = result[1];
      fileName = fileName.replace(/\"/g, "");
      // IE兼容方法
      // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      //   window.navigator.msSaveOrOpenBlob(resFile.data);
      //   return;
      // }
      var blob = new Blob([resFile.data], { type: "" });
      var reader = new FileReader();
      reader.readAsArrayBuffer(blob);
      reader.onload = function(e) {
        var bytes = new Uint8Array(e.target.result);
        // console.log(bytes);
        self.bytes = bytes;
        var readIndex = 0;
        if (bytes[readIndex++] != 80 || bytes[readIndex++] != 53) {
          console.log("---非pgm--");
          Message.warning("请上传激光导航图！");
          return;
        }
        readIndex++;
        var c = bytes[readIndex++];
        if (c == 35) {
          do {
            c = bytes[readIndex++];
          } while (c != 10 && c != 13);
          c = bytes[readIndex++];
        }

        if (c < 48 || c > 57) {
          console.log("---读取宽错误--:" + c);
          return;
        }
        var k = 0;
        do {
          k = k * 10 + c - 48;
          c = bytes[readIndex++];
        } while (c >= 48 && c <= 57);
        self.width = k;
        c = bytes[readIndex++];
        if (c < 48 || c > 57) {
          console.log("---读取高错误--:" + c);
          return;
        }

        k = 0;
        do {
          k = k * 10 + c - 48;
          c = bytes[readIndex++];
        } while (c >= 48 && c <= 57);
        self.height = k;

        c = bytes[readIndex++];
        if (c < 48 || c > 57) {
          console.log("---读取灰度错误--:" + c);
          return;
        }
        k = 0;
        do {
          k = k * 10 + c - 48;
          c = bytes[readIndex++];
        } while (c >= 48 && c <= 57);
        self.maxValue = k;
        const domCanvas = $($(self.dom)[0].firstChild);
        // document.getElementsByTagName("canvas")[0].width = this.width; //注意这里要打引号
        // document.getElementsByTagName("canvas")[0].height = this.height;
        // this.canvas = document.getElementsByTagName("canvas")[0];
        domCanvas[0].width = self.width; //注意这里要打引号
        domCanvas[0].height = self.height;
        self.canvas = domCanvas[0];
        var content = self.canvas
          .getContext("2d")
          .createImageData(self.width, self.height);
        for (var m = 0; m < self.width * self.height; m++) {
          c = bytes[readIndex++];
          content.data[m * 4 + 0] = c;
          content.data[m * 4 + 1] = c;
          content.data[m * 4 + 2] = c;
          content.data[m * 4 + 3] = 255;
        }

        self.w = self.width / 2; //取画布的宽
        self.h = self.height; //取画布的高
        storage.$instance.setItem("rosMapWidth", self.width);
        storage.$instance.setItem("rosMapHeight", self.height);
        self.canvas.getContext("2d").putImageData(content, 0, 0);
        resolve(self.canvas);
      };
    });
  },
  // 获取地图流
  loadMap(uploadPath) {
    return new Promise(async (resolve, reject) => {
      const res = await axios({
        method: "get",
        url:
          process.env.VUE_APP_BASE_API +
          `/robot/upload/downloadByFilePath?filePath=${uploadPath}`,
        responseType: "blob",
        headers: { Authorization: "Bearer " + getToken() }
      });
      this.resolveBlob(res);
    });
  },
  resolveBlob(res, mimeType) {
    return new Promise((resolve, reject) => {
      /* 你的逻辑代码 */
      const self = this;
      // //从response的headers中获取filename, 后端response.setHeader("Content-disposition", "attachment; filename=xxxx.docx") 设置的文件名;
      var patt = new RegExp("filename=([^;]+\\.[^\\.;]+);*");
      var contentDisposition = decodeURI(res.headers["content-disposition"]);
      var result = patt.exec(contentDisposition);
      var fileName = result[1];
      fileName = fileName.replace(/\"/g, "");
      // IE兼容方法
      // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      //   window.navigator.msSaveOrOpenBlob(res.data);
      //   return;
      // }
      var blob = new Blob([res.data], { type: mimeType });
      var reader = new FileReader();
      reader.readAsArrayBuffer(blob);
      reader.onload = function(e) {
        var bytes = new Uint8Array(e.target.result);
        // console.log(bytes);
        self.bytes = bytes;
        var readIndex = 0;
        if (bytes[readIndex++] != 80 || bytes[readIndex++] != 53) {
          console.log("---非pgm--");
          Message.warning("请上传激光导航图！");
          return;
        }
        readIndex++;
        var c = bytes[readIndex++];
        if (c == 35) {
          do {
            c = bytes[readIndex++];
          } while (c != 10 && c != 13);
          c = bytes[readIndex++];
        }

        if (c < 48 || c > 57) {
          console.log("---读取宽错误--:" + c);
          return;
        }
        var k = 0;
        do {
          k = k * 10 + c - 48;
          c = bytes[readIndex++];
        } while (c >= 48 && c <= 57);
        this.width = k;
        c = bytes[readIndex++];
        if (c < 48 || c > 57) {
          console.log("---读取高错误--:" + c);
          return;
        }

        k = 0;
        do {
          k = k * 10 + c - 48;
          c = bytes[readIndex++];
        } while (c >= 48 && c <= 57);
        this.height = k;

        c = bytes[readIndex++];
        if (c < 48 || c > 57) {
          console.log("---读取灰度错误--:" + c);
          return;
        }
        k = 0;
        do {
          k = k * 10 + c - 48;
          c = bytes[readIndex++];
        } while (c >= 48 && c <= 57);
        this.maxValue = k;
        const domCanvas = $($(self.dom)[0].firstChild);
        // document.getElementsByTagName("canvas")[0].width = this.width; //注意这里要打引号
        // document.getElementsByTagName("canvas")[0].height = this.height;
        // this.canvas = document.getElementsByTagName("canvas")[0];
        domCanvas[0].width = this.width; //注意这里要打引号
        domCanvas[0].height = this.height;
        this.canvas = domCanvas[0];
        var content = this.canvas
          .getContext("2d")
          .createImageData(this.width, this.height);
        for (var m = 0; m < this.width * this.height; m++) {
          c = bytes[readIndex++];
          content.data[m * 4 + 0] = c;
          content.data[m * 4 + 1] = c;
          content.data[m * 4 + 2] = c;
          content.data[m * 4 + 3] = 255;
        }

        this.w = this.width / 2; //取画布的宽
        this.h = this.height; //取画布的高
        console.log(this.width);
        storage.$instance.setItem("rosMapWidth", this.width);
        storage.$instance.setItem("rosMapHeight", this.height);
        this.canvas.getContext("2d").putImageData(content, 0, 0);
      };
      resolve(this.canvas);
    });
  }
};

export default paintRos;
