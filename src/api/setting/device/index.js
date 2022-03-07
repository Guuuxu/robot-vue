import request from "@/utils/request";

// 查询柜体树结构信息
export const getDeviceTreeList = () => {
  return request({
    url: "/robot/device/treeList",
    method: "get"
  });
};

/**
 * 新增柜体
 * @param deviceName 柜机名称
 * @param deviceType 柜机类型名称
 * @param stationId 站点id
 */
export const getAddDevice = ({ stationId, deviceName, deviceType }) => {
  return request({
    url: "/robot/device",
    method: "post",
    data: {
      deviceName,
      deviceType,
      stationId
    }
  });
};

/**
 * 编辑柜体
 * @param deviceName 柜机名称
 * @param deviceType 柜机类型名称
 * @param stationId 站点id
 */
export const updateDevice = ({ id, stationId, deviceName, deviceType }) => {
  return request({
    url: "/robot/device",
    method: "put",
    data: {
      id,
      deviceName,
      deviceType,
      stationId
    }
  });
};

/**
 * 查询某个柜体
 * @param id
 */
export const getDeviceDetail = id => {
  return request({
    url: "/robot/device/" + id,
    method: "get"
  });
};

/**
 * 删除柜体与测点
 * @param id
 * @param sensorLevels 测点层级
 */
export const deleteDevice = (id, sensorLevels) => {
  return request({
    url: "/robot/sensor/delete/" + id,
    method: "delete",
    data: {
      sensorLevels
    }
  });
};
