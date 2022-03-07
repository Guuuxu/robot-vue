import request from "@/utils/request";

/**
 * 升降控制
 * @param {*} directionUpDown   0-上 1-下
 * @param {*} speedMode  0-低 1-中 2-高
 * @param {*} buttonFlag 0-按下 1-松开
 */
export const LiftHeightControl = ({
  directionUpDown,
  speedMode,
  buttonFlag
}) => {
  return request({
    url: "/robot/control/liftHeightControl",
    method: "post",
    data: {
      directionUpDown,
      speedMode,
      buttonFlag
    }
  });
};

/**
 * 行走控制
 * @param {*} direction   0-前进，1-后退,2-左前转弯，3-左后转弯，4-右前，5-右后
 * @param {*} speedMode  0-低 1-中 2-高
 * @param {*} buttonFlag 1-按下 1-松开
 */
export const walkControl = ({ direction, buttonFlag, speedMode }) => {
  return request({
    url: "/robot/control/walkControl",
    method: "post",
    data: {
      direction,
      speedMode,
      buttonFlag
    }
  });
};

/**
 * 云台旋转控制
 * @param {*} direction   0-左 1-右
 * @param {*} speedMode  0-低 1-中 2-高
 * @param {*} buttonFlag 0-按下 1-松开
 */
export const rotateControl = ({ direction, speedMode, buttonFlag }) => {
  return request({
    url: "/robot/control/rotateControl",
    method: "post",
    data: {
      direction,
      speedMode,
      buttonFlag
    }
  });
};

/**
 * 小车旋转接口
 * @param {*} direction   0-左 1-右
 * @param {*} speedMode  0-低 1-中 2-高
 * @param {*} buttonFlag 1-按下 1-松开
 */
export const rotateCarControl = ({ direction, speedMode, buttonFlag }) => {
  return request({
    url: "/robot/control/rotateCarControl",
    method: "post",
    data: {
      direction,
      speedMode,
      buttonFlag
    }
  });
};

/**
 * 云台俯仰控制
 * @param {*} direction   0-上 1-下
 * @param {*} speedMode  0-低 1-中 2-高
 * @param {*} buttonFlag 1-按下 1-松开
 */
export const udangleControl = ({ direction, speedMode, buttonFlag }) => {
  return request({
    url: "/robot/control/udangleControl",
    method: "post",
    data: {
      direction,
      speedMode,
      buttonFlag
    }
  });
};

/**
 * 机器人启停控制
 * @param {*} stopFlag   0-恢复 1-暂停 2-终止
 */
export const stopFlagControl = stopFlag => {
  return request({
    url: "/robot/control/stopFlagControl",
    method: "post",
    data: {
      stopFlag
    }
  });
};

/**
 * 机器人速率控制接口
 * @param {*} speedMode   0-低 1-中 2-高
 */
export const speedModeControl = query => {
  return request({
    url: "/robot/control/speedModeControl",
    method: "post",
    data: {
      ...query
    }
  });
};

/**
 * 相机参数控制
 * @param {*}   exposure 曝光模式 0-自动，1 手动
 * @param {*}   aperture : "0",//
 * @param {*} 	focusVal: "20", //焦距
 * @param {*} 	zoomVal: "0" ,//放大倍数
 * @param {*} 	shutter: "0" ,//快门
 * @param {*} 	gain: "0" ,//增益
 * @param {*} 	controlMode: "1"  //操作类型 1 调整焦距2 调整倍率3 光圈 4快门 5曝光 6增益
 */
export const getLightCameraControl = ({
  focusVal,
  zoomVal,
  aperture,
  exposure,
  shutter,
  gain,
  controlMode,
  speedMode
}) => {
  return request({
    url: "/robot/control/lightCameraControl",
    method: "post",
    data: {
      focusVal,
      zoomVal,
      aperture,
      exposure,
      shutter,
      gain,
      controlMode,
      speedMode
    }
  });
};

/**
 * 机器人避障控制
 * @param {} obstacleOpenFlag // 0-不开启避障 1-开启避障
 * @param {} obstacleType //0 左侧避障1 右侧避障2 下方避障
 */
export const getRobotObstacleControl = ({ obstacleOpenFlag, obstacleType }) => {
  return request({
    url: "/robot/control/robotObstacleControl",
    method: "post",
    data: {
      obstacleOpenFlag,
      obstacleType
    }
  });
};

/**
 * 机器人温度、电池、报警数
 * @param {*}
 */
export const getRobotInfoRealTime = () => {
  return request({
    url: "/robot/control/getRobotInfoRealTime",
    method: "post"
  });
};

/**
 * 一键返航或者移动到某个测点控制
 * @param {*} sensorId //如果不传值 默认复位、传值则机器人回到某个测点位置
 */
export const getRobotToWatch = (sensorId = "") => {
  return request({
    url: "/robot/control/robotToWatch",
    method: "post",
    data: {
      sensorId
    }
  });
};

/**
 * 机器人复位
 * @param {*}
 */
export const getRobotReset = () => {
  return request({
    url: "/robot/control/robotReset",
    method: "post"
  });
};

/**
 * 全景拍照
 * @param {*} type // 1全景图，2表示测点图
 */
export const getTakePhoto = ({ type, sensorParentName }) => {
  return request({
    url: "/robot/control/takePhoto",
    method: "post",
    data: {
      type,
      sensorParentName
    }
  });
};

/**
 * 设备抓图
 * @param {*}  robot2Cabinet //机器人到电器柜的距离
 * @param {*}  hTargetDist //目标中心到图像中心的水平距离
 * @param {*}  vTargetDist //目标中心到图像中心的垂直距离
 * @param {*}  imageWidth // 图像的宽度
 * @param {*}  imageHeight // 图像的高度
 * @param {*}  frameWidth // 图框的宽度
 * @param {*}  frameHeight // 图框的高度
 * @param {*}  deviceName // 设备名
 * @param {*}  sensorParentName // 二级测点名
 * @param {*}  sensorName // 测点名
 */
export const moveCameraToSensor = () => {
  return request({
    url: "/robot/control/moveCameraToSensor",
    method: "post"
  });
};

/**
 * 调焦调倍(按钮调整)
 * @param {*} cmdType //0 变倍 1 变焦
 * @param {*} paramType //0 调小 1 调大
 * @param {*} buttonFlag //0 按下 1 松开
 */
export const getLightCameraRelative = ({ cmdType, paramType, buttonFlag }) => {
  return request({
    url: "/robot/control/lightCameraRelative",
    method: "post",
    data: {
      cmdType,
      paramType,
      buttonFlag
    }
  });
};

/**
 * 可见光参数查询
 * @param {*}
 */
export const getLightCameraQuery = () => {
  return request({
    url: "/robot/control/lightCameraQuery",
    method: "post"
  });
};

/**
 * 机器人移动到具体位置
 * @param {*}  "positionX",
 * @param {*}  "positionY",
 * @param {*}  "rotationAngle" //旋转角度
 * @param {*}  "ptzUdangle" //云台俯仰角度
 * @param {*}  "ptzRotation" //云台旋转角度
 * @param {*}  "type" 1-定点 2-机器人旋转角度  3-云台俯仰角度 4-云台旋转角度
 * @param {*}  "speedMode"  //速度必输 0-低 1-中 2-高
 */
export const getRobotToPosition = ({
  positionX,
  positionY,
  rotationAngle,
  ptzUdangle,
  ptzRotation,
  type,
  speedMode
}) => {
  return request({
    url: "/robot/control/robotToPosition",
    method: "post",
    data: {
      positionX,
      positionY,
      rotationAngle,
      ptzUdangle,
      ptzRotation,
      type,
      speedMode
    }
  });
};

/**
 * 红外温度接口
 * @param {*}
 */
export const queryCameraTemperature = () => {
  return request({
    url: "/robot/control/queryCameraTemperature",
    method: "post"
  });
};

/**
 * 机器人光线明暗调节
 * @param {*} autoDarkLightSet //0-关闭 1-开启
 */
export const robotLightOffOnControl = autoDarkLightSet => {
  return request({
    url: "/robot/control/robotLightOffOnControl",
    method: "post",
    data: {
      autoDarkLightSet
    }
  });
};

/**
 * 机器人雨刷接口
 * @param {*} isWiperOn //0-关闭 1-开启
 */
export const robotWiperControl = isWiperOn => {
  return request({
    url: "/robot/control/robotWiperControl",
    method: "post",
    data: {
      isWiperOn
    }
  });
};
