import { getRobotMapData } from "@/api/map";
import { Message } from "element-ui";
import { accAdd, accSub, accDiv, accMul } from "@/utils";
import global from "@/utils/global";
import storage from "@/utils/storage";

function MapDrawer(option) {
  this.MAP_CANVAS_WIDTH = 500;
  this.MAP_CANVAS_HEIGHT = 300;

  this.CANVAS_BACKGROUND_COLOR = "rgba(255, 255, 255, 0)";
  this.CANVAS_LINE_COLOR = "#303133";
  this.CANVAS_LINE_WIDTH = 2;
  this.CANVAS_LINE_INNER_WIDTH = 1;
  this.CANVAS_LINE_INNER_COLOR = "#E4E7ED" /*"#141e20"*/;
  this.CANVAS_LINE_BORDER_WIDTH = 1;
  this.CANVAS_LINE_BORDER_COLOR = "#EBEEF5" /*"#141e20"*/;
  //站所平面图上的对象类型
  this.OBJECT_TYPE_DEVICE = 0;
  this.OBJECT_TYPE_PATHNODE = 1;
  this.OBJECT_TYPE_ENVDEVICE = 2;
  // 激光地图ros
  this.pxToPos = global.pxToPos;
  this.originPoint = JSON.parse(storage.$instance.getItem("originPoint")); // 导航地图中心点相对图片位置
  this.mapScale = JSON.parse(storage.$instance.getItem("scaling")); // 导航地图缩放比例
  if (option && option.nodevices) {
    this.NODEVICES = true;
  } else {
    this.NODEVICES = false;
  }

  //防止id重复，绑定事件用
  this.diffId = MapDrawer.prototype.registerCount;
  MapDrawer.prototype.registerCount++;

  this.robotStatus = {
    div: null
  };
  //轨道路径点
  this.pathNodes = new Array();
  //充电点
  this.batteryNodes = new Array();
  //设备，也就是站所内的机柜
  this.devices = new Array();
  //环境设备
  this.envDevices = new Array();
  //计算下一个排序值
  this.curSortId = 0;

  //绘图用canva
  this.canvas2d = null;
  //缩放比例
  this.scaleX = 1;
  this.scaleY = 1;
  this.imgScale = 1;
  //当前地图显示的div
  this.div = null;
  this.domCanvas = null;
  //判断是否加载成功
  this.loaded = false;
  //判断的是否附加到div上
  this.attached = false;

  this.selectfunc = null;

  this.startMousePosition = {
    x: 0,
    y: 0
  };
}

MapDrawer.prototype.registerCount = 0;

MapDrawer.prototype.onselect = function(callback) {
  var self = this;

  function getPixelValue(px) {
    if (px) {
      return parseInt(px.replace("px", ""));
    }
  }

  function isRectInRect(srcRect, destRect) {
    return (
      srcRect.left >= destRect.left &&
      srcRect.left + srcRect.width <= destRect.left + destRect.width &&
      srcRect.top >= destRect.top &&
      srcRect.top + srcRect.height <= destRect.top + destRect.height
    );
  }
  /**
   * 查询一个范围内，所有被包含在内的元素
   * @param {Object} selectBox
   */
  function findObjectsInRect(selectBox) {
    var boxInObject = new Array();
    var index = 0;
    var rectLeft = 0;
    var rectTop = 0;
    var rectWidth = 0;
    var rectHeight = 0;
    //查询机柜
    for (index = 0; index < self.devices.length; index++) {
      rectWidth = self.devices[index].info.deviceLength;
      rectHeight = self.devices[index].info.deviceWidth;
      rectLeft = self.devices[index].info.posX;
      rectTop = self.devices[index].info.posY;
      if (
        isRectInRect(
          {
            left: rectLeft,
            top: rectTop,
            width: rectWidth,
            height: rectHeight
          },
          selectBox
        )
      ) {
        boxInObject.push(self.devices[index]);
      }
    }

    return boxInObject;
  }

  if (!!callback) {
    this.selectfunc = callback;
    //绑定操作事件
    this.div.mousedown(function(e) {
      //计算鼠标位置
      e.clientX = parseInt(
        e.pageX - self.div.offset().left + self.div.scrollLeft()
      );
      e.clientY = parseInt(
        e.pageY - self.div.offset().top + self.div.scrollTop()
      );

      self.startMousePosition.x = e.clientX;
      self.startMousePosition.y = e.clientY;

      self.boxDiv = $(
        "<div style='border:1px dashed #ededed;position: absolute'></div>"
      );
      self.boxDiv.css("left", self.startMousePosition.x + "px");
      self.boxDiv.css("top", self.startMousePosition.y + "px");
      self.boxDiv.css("width", "1px");
      self.boxDiv.css("height", "1px");
      self.boxDiv.appendTo(self.div);
    });

    this.div.mousemove(function(e) {
      //计算鼠标位置
      e.clientX = parseInt(
        e.pageX - self.div.offset().left + self.div.scrollLeft()
      );
      e.clientY = parseInt(
        e.pageY - self.div.offset().top + self.div.scrollTop()
      );

      var minX =
        e.clientX >= self.startMousePosition.x
          ? self.startMousePosition.x
          : e.clientX;
      var minY =
        e.clientY >= self.startMousePosition.y
          ? self.startMousePosition.y
          : e.clientY;
      var maxX =
        e.clientX < self.startMousePosition.x
          ? self.startMousePosition.x
          : e.clientX;
      var maxY =
        e.clientY < self.startMousePosition.y
          ? self.startMousePosition.y
          : e.clientY;

      //调用当前工具的处理事件
      if (self.boxDiv) {
        self.boxDiv.css("left", minX + "px");
        self.boxDiv.css("top", minY + "px");
        self.boxDiv.css("width", maxX - minX + "px");
        self.boxDiv.css("height", maxY - minY + "px");
      }
    });

    this.div.mouseup(function(e) {
      //计算鼠标位置
      if (self.boxDiv) {
        //去除之前
        $(".mapdrawer .mapDevice").removeClass("mapDeviceSelect");

        //添加现在的

        var box = {
          left: getPixelValue(self.boxDiv.css("left")) / self.scaleX,
          top: getPixelValue(self.boxDiv.css("top")) / self.scaleY,
          width: getPixelValue(self.boxDiv.css("width")) / self.scaleX,
          height: getPixelValue(self.boxDiv.css("height")) / self.scaleY
        };

        self.boxDiv.remove();
        self.boxDiv = null;

        var sl = findObjectsInRect(box);
        for (var index = 0; index < sl.length; index++) {
          sl[index].div.addClass("mapDeviceSelect");
        }

        //
        if (box.width >= box.height) {
          //冒泡排序
          for (var jj = 0; jj < sl.length - 1; jj++) {
            for (var index = 0; index < sl.length - 1 - jj; index++) {
              var temp;
              if (sl[index].info.posX > sl[index + 1].info.posX) {
                temp = sl[index];
                sl[index] = sl[index + 1];
                sl[index + 1] = temp;
              }
            }
          }
        }

        if (box.width < box.height) {
          //冒泡排序
          for (var jj = 0; jj < sl.length - 1; jj++) {
            for (var index = 0; index < sl.length - 1 - jj; index++) {
              var temp;
              if (sl[index].info.posY > sl[index + 1].info.posY) {
                temp = sl[index];
                sl[index] = sl[index + 1];
                sl[index + 1] = temp;
              }
            }
          }
        }

        //回调事件,传入已经选中的东西
        if (self.selectfunc) {
          self.selectfunc(sl);
        }
      }
    });

    this.div.mouseleave(function(e) {
      self.div.trigger("mouseup");
    });
  }
};

MapDrawer.prototype.bindToDiv = function(dom) {
  this.unbind();
  //获得div
  this.div = $(dom);

  /*	if(this.div.length == 0) {
			xauto.browser.log("绑定地图面板失败，目标不是dom节点");
			return;
		}*/

  //部署节点结构
  this.div.css("position", "relative");
  this.div.addClass("mapdrawer");
  this.domCanvas = $(
    "<canvas width='" +
      this.div.innerWidth() +
      "px' height='" +
      this.div.innerHeight() +
      "px'> </canvas>"
  );
  this.div.append(this.domCanvas);

  this.robotStatus.drawerInfo = $(
    "<div style='text-align:left;width:100%;height:25px;line-height:25px;color:red;position:absolute;left:0px;top:0px;color:beige;font-size:15px;' ></div>"
  );
  this.div.append(this.robotStatus.drawerInfo);
  //获得canvas对象
  var canvas = this.domCanvas[0];

  if (canvas.getContext) {
    this.canvas2d = canvas.getContext("2d");
  } else {
    Message.error("不支持getContext");
    return;
  }

  this.attached = true;
};

// 存在canvas 2021.6.12
MapDrawer.prototype.bindToHasDiv = function(dom) {
  this.unbind();
  //获得div
  this.div = $(dom);
  // 已存在的canvas
  const existingDomCanvas = $($(dom)[0].getElementsByTagName("canvas"));
  //部署节点结构
  this.div.css("position", "relative");
  this.div.addClass("mapdrawer");
  this.div.append(existingDomCanvas);

  this.robotStatus.drawerInfo = $(
    "<div style='text-align:left;width:100%;height:25px;line-height:25px;color:red;position:absolute;left:0px;top:0px;color:beige;font-size:15px;' ></div>"
  );
  this.div.append(this.robotStatus.drawerInfo);
  //获得canvas对象
  var canvas = existingDomCanvas[0];

  if (canvas.getContext) {
    this.canvas2d = canvas.getContext("2d");
  } else {
    Message.error("不支持getContext");

    return;
  }

  this.attached = true;
};

MapDrawer.prototype.unbind = function() {
  this.loaded = false;
  if (this.div) {
    // this.div.children().remove();
  }
  this.div?.children().remove();
  this.div = null;
  this.attached = false;
};

MapDrawer.prototype.clearFocus = function() {
  $(".mapdrawer .mapDevice").removeClass("mapDeviceSelect");
  $(".mapdrawer .mapDevice").removeClass("mapDeviceFocus");
};

MapDrawer.prototype.redraw = function() {
  if (!this.loaded) {
    return;
  }
  //更新画板大小
  this.domCanvas.attr("width", this.div.innerWidth() + "px");
  this.domCanvas.attr("height", this.div.innerHeight() + "px");
  //计算当前缩放比例
  this.scaleX = this.div.innerWidth() / this.MAP_CANVAS_WIDTH;
  this.scaleY = this.div.innerHeight() / this.MAP_CANVAS_HEIGHT;
  //更新所有对象
  for (var index = 0; index < this.devices.length; index++) {
    this.updateMapObject(this.devices[index]);
  }

  for (var index = 0; index < this.pathNodes.length; index++) {
    this.updateMapObject(this.pathNodes[index]);
  }

  for (var index = 0; index < this.envDevices.length; index++) {
    this.updateMapObject(this.envDevices[index]);
  }

  for (var index = 0; index < this.batteryNodes.length; index++) {
    this.updateMapObject(this.batteryNodes[index]);
  }
  //更新路径
  this.redrawPath();
};

MapDrawer.prototype.showRobotStatus = function(show, coordinate) {
  var robotX = coordinate.xCoordinate;
  var robotY = coordinate.yCoordinate;
  //开关机器人的显示状态
  if (!show) {
    if (this.robotStatus.div) {
      this.robotStatus.div.remove();
      this.robotStatus.div = null;
    }
    return;
  } else {
    if (this.robotStatus.div == null) {
      this.robotStatus.div = $("<div class='mapRobot'></div>");
      this.robotStatus.div.appendTo(this.div);
      this.robotStatus.div.hide();
      var thisDrawer = this;
      //绑定事件
      $(document).on("mouseover", ".mapdrawer .mapRobot", function() {
        if (thisDrawer.onRobotOver) {
          thisDrawer.onRobotOver();
        }
      });
      $(document).on("mouseout", ".mapdrawer .mapRobot", function() {
        if (thisDrawer.onRobotOut) {
          thisDrawer.onRobotOut();
        }
      });
    }
  }

  //清空当前的告警信息
  this.robotStatus.drawerInfo.html("");

  //更改div位置,计算div的缩放比例
  robotX = accAdd(
    this.originPoint[0],
    accDiv(accMul(robotX, this.mapScale), this.pxToPos)
  );
  robotY = accSub(
    this.originPoint[1],
    accDiv(accMul(robotY, this.mapScale), this.pxToPos)
  );
  this.robotStatus.div.css(
    "left",
    accMul(
      robotX - this.getPixelValue(this.robotStatus.div.css("width")) / 2,
      this.imgScale
    )
  );
  this.robotStatus.div.css(
    "top",
    accMul(
      robotY - this.getPixelValue(this.robotStatus.div.css("height")) / 2,
      this.imgScale
    )
  );

  if (this.robotStatus.div) {
    this.robotStatus.div.show();
  }

  if (this.onRobotMove) {
    this.onRobotMove(this.robotStatus.div);
  }
};

MapDrawer.prototype.showDeviceFocus = function(deviceid) {
  //移除之前所有错误
  this.div.find(".mapDevice , .mapEnvDevice").removeClass("mapDeviceFocus");
  var destDom = null;
  for (var index = 0; index < this.devices.length && destDom == null; index++) {
    if (this.devices[index].info.deviceId == deviceid) {
      destDom = this.devices[index].div;
    }
  }

  for (
    var index = 0;
    index < this.envDevices.length && destDom == null;
    index++
  ) {
    if (this.envDevices[index].info.envDeviceId == deviceid) {
      destDom = this.envDevices[index].div;
    }
  }

  if (destDom != null) {
    destDom.addClass("mapDeviceFocus");
  }
};

//重绘轨道点所产生的路径
MapDrawer.prototype.redrawPath = function() {
  //清除当前线条
  this.canvas2d.fillStyle = this.CANVAS_BACKGROUND_COLOR;
  this.canvas2d.fillRect(0, 0, this.div.innerWidth(), this.div.innerHeight());
  this.canvas2d.lineWidth = this.CANVAS_LINE_WIDTH;
  this.canvas2d.strokeStyle = this.CANVAS_LINE_COLOR;
  this.drawPath();
};

MapDrawer.prototype.drawPath = function() {
  if (this.pathNodes.length > 0) {
    //根据sort字段进行冒泡排序
    var len = this.pathNodes.length;
    var temp;
    while (len > 0) {
      for (let j = 0; j < len - 1; j++) {
        if (this.pathNodes[j].info.sort > this.pathNodes[j + 1].info.sort) {
          temp = this.pathNodes[j];
          this.pathNodes[j] = this.pathNodes[j + 1];
          this.pathNodes[j + 1] = temp;
        }
      }
      len--;
    }
    //设定线条样式
    this.canvas2d.beginPath();
    for (var i = 0; i < this.pathNodes.length; i++) {
      if (i == 0) {
        this.canvas2d.moveTo(
          // 2021.7.8
          // this.pathNodes[i].info.posX * this.scaleX,
          // this.pathNodes[i].info.posY * this.scaleY
          this.pathNodes[i].info.mapNodeX,
          this.pathNodes[i].info.mapNodeY
        );
      } else {
        //根据角度画弧
        //直线
        if (this.pathNodes[i].info.angle == 0) {
          this.canvas2d.lineTo(
            // this.pathNodes[i].info.posX * this.scaleX,
            // this.pathNodes[i].info.posY * this.scaleY
            this.pathNodes[i].info.mapNodeX,
            this.pathNodes[i].info.mapNodeY
          );
        }
        // 正90度弧 ,表示为凸形90弧
        if (this.pathNodes[i].info.angle == 90) {
          var controlPoint = this.math2D.computeControlPoint(
            this.pathNodes[i - 1].info.mapNodeX,
            this.pathNodes[i - 1].info.mapNodeY,
            this.pathNodes[i].info.mapNodeX,
            this.pathNodes[i].info.mapNodeY,
            90
          );
          this.canvas2d.quadraticCurveTo(
            controlPoint.x,
            controlPoint.y,
            this.pathNodes[i].info.mapNodeX,
            this.pathNodes[i].info.mapNodeY
          );
        }

        // 负90度弧 ,表示为凹形90弧
        if (this.pathNodes[i].info.angle == "-90") {
          var controlPoint = this.math2D.computeControlPoint(
            this.pathNodes[i - 1].info.mapNodeX,
            this.pathNodes[i - 1].info.mapNodeY,
            this.pathNodes[i].info.mapNodeX,
            this.pathNodes[i].info.mapNodeY,
            -90
          );
          this.canvas2d.quadraticCurveTo(
            controlPoint.x,
            controlPoint.y,
            this.pathNodes[i].info.mapNodeX,
            this.pathNodes[i].info.mapNodeY
          );
        }
      }
    }
    //完成绘制
    this.canvas2d.stroke();
    this.canvas2d.closePath();
  }
};

MapDrawer.prototype.getEnvImageNameByType = function(type) {
  switch (type) {
    case MapBuilderConstant.DEVICE_TYPE_SF6:
      imgName = "equipment_collart_tool_09.png";
      break;
    case MapBuilderConstant.DEVICE_TYPE_GUARD:
      imgName = "equipment_collart_tool_106.png";
      break;
    case MapBuilderConstant.DEVICE_TYPE_FOG:
      imgName = "equipment_collart_tool_104.png";
      break;
    case MapBuilderConstant.DEVICE_TYPE_TEMP:
      imgName = "equipment_collart_tool_08.png";
      break;
    case MapBuilderConstant.DEVICE_TYPE_O3:
      imgName = "equipment_collart_tool_10.png";
      break;
    case MapBuilderConstant.DEVICE_TYPE_AIRCONDITIONER: //空调
      imgName = "equipment_collart_tool_07.png";
      break;
    case MapBuilderConstant.DEVICE_TYPE_WATERLEVEL: //液位
      imgName = "equipment_collart_tool_100.png";
      break;
    case MapBuilderConstant.DEVICE_TYPE_WATERPUMP:
      imgName = "equipment_collart_tool_06.png";
      break;
    case MapBuilderConstant.DEVICE_TYPE_DOOR:
      imgName = "equipment_collart_tool_11.png";
      break;
    case MapBuilderConstant.DEVICE_TYPE_CLOUD:
      imgName = "equipment_collart_tool_05.png";
      break;
    case MapBuilderConstant.DEVICE_TYPE_HUMIDITY:
      imgName = "equipment_collart_tool_102.png";
      break;
    case MapBuilderConstant.DEVICE_TYPE_LIGHT:
      imgName = "equipment_collart_tool_103.png";
      break;
    case MapBuilderConstant.DEVICE_TYPE_BATTERY:
      imgName = "equipment_collart_tool_105.png";
      break;
  }
  return imgName;
};
//添加Object并且创建div
MapDrawer.prototype.addObject = function(obj, flag) {
  var thisDraw = this;
  switch (obj.objectType) {
    //添加环境设备
    case this.OBJECT_TYPE_ENVDEVICE:
      //创建并添加div到面板上注意，div的左上角位置对应posX和posY
      obj.div = $(
        "<div id='" +
          this.diffId +
          "_" +
          obj.info.id +
          "_div' class='mapEnvDevice'></div>"
      );
      obj.div.appendTo(this.div);
      obj.div.css(
        "left",
        accMul(
          obj.info.posX - this.getPixelValue(obj.div.css("width")) / 2,
          this.imgScale
        )
      );
      obj.div.css(
        "top",
        accMul(
          obj.info.posY - this.getPixelValue(obj.div.css("height")) / 2,
          this.imgScale
        )
      );

      //填充环境设备的背景图片
      var imgName = this.getEnvImageNameByType(obj.info.envDeviceType);

      //有类型，则添加图片
      if (imgName) {
        obj.div.css({
          "background-image": "url(images/" + imgName + ")"
        });
      } else {
        obj.div.html("未关联");
      }
      var thisObjInfo = obj;
      //绑定div回调事件

      $(document).on(
        "click",
        "#" + this.diffId + "_" + obj.info.id + "_div",
        function(e) {
          if (thisDraw.onEnvDeviceClicked) {
            thisDraw.onEnvDeviceClicked(e, thisObjInfo.div, thisObjInfo.info);
          }
        }
      );

      this.envDevices.push(obj);
      break;
    case this.OBJECT_TYPE_DEVICE:
      if (!this.NODEVICES) {
        if (null == obj.info.deviceName) {
          obj.info.deviceName = "未关联设备";
        }
        //创建并添加div到面板上注意，div的左上角位置对应posX和posY
        obj.div = $(
          "<div title='" +
            obj.info.deviceName +
            "' id='" +
            this.diffId +
            "_" +
            obj.info.id +
            "_div' class='mapDevice'><div class='deviceBox'></div></div>"
        );
        obj.div.css("left", obj.info.posX);
        obj.div.css("top", obj.info.posY);
        obj.div.css("width", obj.info.deviceLength);
        obj.div.css("height", obj.info.deviceWidth);

        obj.div.css("line-height", obj.info.deviceWidth * 0.9 + "px");
        obj.div.find(".deviceBox").html(obj.info.deviceName);
        obj.div.appendTo(this.div);

        var thisObjInfo = obj;

        $(document).on(
          "click",
          "#" + this.diffId + "_" + obj.info.id + "_div",
          function(e) {
            if (thisDraw.onDeviceClicked) {
              thisDraw.onDeviceClicked(e, thisObjInfo.div, thisObjInfo.info);
            }
          }
        );
        this.devices.push(obj);
      }
      break;
    case this.OBJECT_TYPE_PATHNODE:
      //创建并添加div到面板上注意，div的中心位置对应posX和posY
      obj.div = $(
        "<div class='mapPathNode' id='" +
          (this.div.attr("id") + "_" + obj.info.id) +
          "'></div>"
      );
      obj.div.appendTo(this.div);

      obj.div.css(
        "left",
        accMul(
          obj.info.mapNodeX - this.getPixelValue(obj.div.css("width")) / 2,
          this.imgScale
        )
      );
      obj.div.css(
        "top",
        accMul(
          obj.info.mapNodeY - this.getPixelValue(obj.div.css("height")) / 2,
          this.imgScale
        )
      );
      obj.div.css("width", "8");
      obj.div.css("height", obj.div[0].clientHeight);
      this.pathNodes.push(obj);
      //重绘路径图
      if (!flag) {
        this.redrawPath();
      }
      break;
    case this.OBJECT_TYPE_BATTERY:
      // 创建并添加div到面板上注意，div的中心位置对应mapNodeX和mapNodeY
      obj.div = $("<div class='mapBatteryNode'></div>");
      obj.div.appendTo(this.div);
      obj.div.css(
        "left",
        accMul(
          obj.info.mapNodeX - this.getPixelValue(obj.div.css("width")) / 2,
          this.imgScale
        )
      );
      obj.div.css(
        "top",
        accMul(
          obj.info.mapNodeY - this.getPixelValue(obj.div.css("height")) / 2,
          this.imgScale
        )
      );
      this.batteryNodes.push(obj);

      break;
  }
};

//根据对象的info中,posX posY等位置属性,同步div的位置
MapDrawer.prototype.updateMapObject = function(obj) {
  if (obj) {
    //更新保存的值,这部分功能主要给撤销功能准备的
    var dataArray = null;
    switch (obj.objectType) {
      case this.OBJECT_TYPE_DEVICE:
        dataArray = this.devices;
        break;
      case this.OBJECT_TYPE_ENVDEVICE:
        dataArray = this.envDevices;
        break;
      case this.OBJECT_TYPE_PATHNODE:
        dataArray = this.pathNodes;
        break;
    }
    //更新div的位置
    if (obj.objectType == this.OBJECT_TYPE_DEVICE) {
      //机柜类型mapNodeX 和mapNodeY 对应div左上角的点
      obj.div.css("left", obj.info.mapNodeX + "px");
      obj.div.css("top", obj.info.mapNodeY + "px");
      obj.div.css("width", obj.info.deviceLength + "px");
      obj.div.css("height", obj.info.deviceWidth + "px");
      //0.9是内部框高度比例
      obj.div.css("line-height", obj.info.deviceWidth * 0.9 + "px");
      obj.div.find(".deviceBox").html(obj.info.deviceName);
    } else {
      //其他类型posX 和mapNodeY 对应div中点,高度和宽度由div本身决定(其高度和宽度实际上定义在css中)
      obj.div.css(
        "left",
        obj.info.mapNodeX - this.getPixelValue(obj.div.css("width")) / 2 + "px"
      );
      obj.div.css(
        "top",
        obj.info.mapNodeY -
          this.getPixelValue(obj.div.css("height")) / 2 -
          9 +
          "px"
      );
    }
  }
};
MapDrawer.prototype.loadStationMapInfo = async function(isLineTo) {
  //计算当前缩放比例
  this.scaleX = this.div.innerWidth() / this.MAP_CANVAS_WIDTH;
  this.scaleY = this.div.innerHeight() / this.MAP_CANVAS_HEIGHT;
  var curMap = this;
  const response = await getRobotMapData();
  //操作失败
  if (response.code != 200) {
    Message.error("获取站所平面图数据失败,原因:" + response.message);
    return;
  }
  var devicesList = response.data.mapDevices;
  var pathNodeList = response.data.mapNodes; // 2021-2-19 pathNodes>mapNodes
  // var envDevices = response.data.envDevices;
  const batteryNodeList = response.data.mapBattery;
  //添加路径点
  for (var index = 0; index < pathNodeList.length; index++) {
    //ros坐标点转换画布位置点
    const mapNodeX = accAdd(
      this.originPoint[0],
      accDiv(accMul(pathNodeList[index].posX, this.mapScale), this.pxToPos)
    );
    const mapNodeY = accSub(
      this.originPoint[1],
      accDiv(accMul(pathNodeList[index].posY, this.mapScale), this.pxToPos)
    );
    pathNodeList[index].mapNodeX = mapNodeX;
    pathNodeList[index].mapNodeY = mapNodeY;
    //添加一个节点
    var newPathNode = {
      objectType: curMap.OBJECT_TYPE_PATHNODE,
      info: {
        id: pathNodeList[index].id,
        posX: pathNodeList[index].posX,
        posY: pathNodeList[index].posY,
        mapNodeX: mapNodeX, // 地图点相对图片左上角位置x(px)
        mapNodeY: mapNodeY, // 地图点相对图片左上角位置y(px)
        //节点类型1：实际编码的点2：辅助画图虚拟点
        nodeType: pathNodeList[index].nodeType,
        //与上一个点的角度，现在有90度和180度
        angle: pathNodeList[index].angle,
        sensorParentNo: pathNodeList[index].sensorParentNo,
        chspeedEndSteel: pathNodeList[index].chspeedEndSteel,
        createTime: pathNodeList[index].createTime,
        updateTime: pathNodeList[index].updateTime,
        sort: pathNodeList[index].sort
      },
      div: null
    };
    //添加到地图上
    curMap.addObject(newPathNode, isLineTo);
  }

  //添加充电点
  for (var index = 0; index < batteryNodeList.length; index++) {
    //ros坐标点转换画布位置点
    const mapNodeX = accAdd(
      this.originPoint[0],
      accDiv(accMul(batteryNodeList[index].posX, this.mapScale), this.pxToPos)
    );
    const mapNodeY = accSub(
      this.originPoint[1],
      accDiv(accMul(batteryNodeList[index].posY, this.mapScale), this.pxToPos)
    );
    batteryNodeList[index].mapNodeX = mapNodeX;
    batteryNodeList[index].mapNodeY = mapNodeY;
    //添加一个节点
    var newPathNode = {
      objectType: curMap.OBJECT_TYPE_BATTERY,
      info: {
        id: batteryNodeList[index].id,
        posX: batteryNodeList[index].posX,
        posY: batteryNodeList[index].posY,
        mapNodeX: mapNodeX, // 地图点相对图片左上角位置x(px)
        mapNodeY: mapNodeY, // 地图点相对图片左上角位置y(px)
        //节点类型1：实际编码的点2：辅助画图虚拟点
        nodeType: batteryNodeList[index].nodeType,
        //与上一个点的角度，现在有90度和180度
        angle: batteryNodeList[index].angle,
        sensorParentNo: batteryNodeList[index].sensorParentNo,
        chspeedEndSteel: batteryNodeList[index].chspeedEndSteel,
        createTime: batteryNodeList[index].createTime,
        updateTime: batteryNodeList[index].updateTime,
        sort: batteryNodeList[index].sort
      },
      div: null
    };
    //添加到地图上
    curMap.addObject(newPathNode);
  }

  //添加机柜
  // for (var index = 0; index < devicesList.length; index++) {
  //   //添加一个节点
  //   var newDevice = {
  //     objectType: curMap.OBJECT_TYPE_DEVICE,
  //     info: {
  //       id: devicesList[index].id,
  //       posX: devicesList[index].posX,
  //       posY: devicesList[index].posY,
  //       //注意平面图上方块宽度就是机柜的长度
  //       deviceLength: devicesList[index].deviceLength,
  //       //注意平面图上方块高度就是机柜的宽度
  //       deviceWidth: devicesList[index].deviceWidth,
  //       createTime: devicesList[index].createTime,
  //       updateTime: devicesList[index].updateTime,
  //       //以下个字段是表关联CBS_DEVICE_INFO查询获得的,不可编辑
  //       deviceId: devicesList[index].deviceId,
  //       deviceName: devicesList[index].deviceName
  //     },
  //     status: {
  //       warning: false,
  //       deviceText: "",
  //       clickevent: null
  //     },
  //     div: null
  //   };

  //   //添加到地图上
  //   curMap.addObject(newDevice);
  // }

  curMap.loaded = true;

  if (curMap.onload) {
    curMap.onload();
  }
};
//获取像素的值
MapDrawer.prototype.getPixelValue = function(px) {
  if (px) {
    return parseInt(px.replace("px", ""));
  }
};
MapDrawer.prototype.math2D = {
  computeControlPoint: function(
    startPointX,
    startPointY,
    endPointX,
    endPointY,
    angle
  ) {
    if (angle == 90) {
      //目标点在当前点上方
      if (endPointY <= startPointY) {
        return {
          x: startPointX,
          y: endPointY
        };
      }

      //目标点在当前点下方
      if (endPointY > startPointY) {
        return {
          x: endPointX,
          y: startPointY
        };
      }
    }

    if (angle == -90) {
      //目标点在当前点上方
      if (endPointY <= startPointY) {
        return {
          x: endPointX,
          y: startPointY
        };
      }
      //目标点在当前点下方
      if (endPointY > startPointY) {
        return {
          x: startPointX,
          y: endPointY
        };
      }
    }
  },
  //计算两点间的距离
  computePointsDistance: function(point1X, point1Y, point2X, point2Y) {
    return Math.sqrt(
      Math.pow(point1X - point2X, 2) + Math.pow(point1Y - point2Y, 2)
    );
  }
};

export default MapDrawer;
