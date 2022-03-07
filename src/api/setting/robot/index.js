import request from "@/utils/request";

// 机器人配置参数查询
export const getRobotConfig = () => {
  return request({
    url: "/robot/config/list",
    method: "get"
  });
};

// 机器人配置参数修改
export const getEditRobotConfig = ({
  id,
  pageNum,
  pageSize,
  beginTime,
  endTime,
  lightCameraIp,
  lightCameraPort,
  lightCameraUser,
  lightCameraPassword,
  lightPositionX,
  lightPositionY,
  lightCameraHorizontalAngle,
  redCameraIp,
  redCameraPort,
  redCameraUser,
  redCameraPassword,
  robotIp,
  robotPort,
  robotUser,
  robotPassword,
  versionNo,
  walkRate,
  walkAvoidObstacle,
  bottomAvoidObstacle,
  dataSourceIp,
  dataSourcePort,
  robotId,
  madeDate
}) => {
  return request({
    url: "/robot/config",
    method: "put",
    data: {
      id,
      pageNum,
      pageSize,
      beginTime,
      endTime,
      lightCameraIp,
      lightCameraPort,
      lightCameraUser,
      lightCameraPassword,
      lightPositionX,
      lightPositionY,
      lightCameraHorizontalAngle,
      redCameraIp,
      redCameraPort,
      redCameraUser,
      redCameraPassword,
      robotIp,
      robotPort,
      robotUser,
      robotPassword,
      versionNo,
      walkRate,
      walkAvoidObstacle,
      bottomAvoidObstacle,
      dataSourceIp,
      dataSourcePort,
      robotId,
      madeDate
    }
  });
};
