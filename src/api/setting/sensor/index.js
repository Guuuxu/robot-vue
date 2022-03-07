import request from "@/utils/request";

// 查询测点类型列表
export const getSensorTypeList = (parentId = 0) => {
  return request({
    url: "/robot/sensorType/viewList?parentId=" + parentId,
    method: "get"
  });
};

// 查询按测点类型分类下的柜体的测点信息
export const getSensorListBySensorType = ({ parentId = 0, stationId }) => {
  return request({
    url: `/robot/sensorType/viewRobotSensorListBySensorType?parentId=${parentId}&stationId=${stationId}`,
    method: "get"
  });
};

// 新增测点
export const getSensorAdd = query => {
  return request({
    url: "/robot/sensor",
    method: "post",
    data: {
      ...query
    }
  });
};

// 修改测点
export const getSensorUpdate = query => {
  return request({
    url: "/robot/sensor",
    method: "put",
    data: {
      ...query
    }
  });
};

// 获取某个测点以及详情
export const getSensorDetail = id => {
  return request({
    url: "/robot/sensor/" + id,
    method: "get"
  });
};

// 获取二级测点信息
export const getParentSensorDetail = id => {
  return request({
    url: "/robot/sensor/parent/" + id,
    method: "get"
  });
};

// 删除测点
export const getSensorDelete = id => {
  return request({
    url: "/robot/sensor/" + id,
    method: "DELETE"
  });
};

// 删除测点
export const getSensorExport = () => {
  return request({
    url: "/robot/sensor/export",
    method: "get"
  });
};

// 批量更新子测点框选数据
/**
 * 
 * @returns "sensorId",
        "ovImageSelectX",//原点位置x
        "ovImageSelectY",//原点位置y
        "ovImageSelectWidth":,//框宽
        "ovImageSelectHeight",//框高
 */
export const editBatchSensor = query => {
  return request({
    url: "/robot/sensor/editBatch",
    method: "post",
    data: { sensorDetailList: query }
  });
};

// 获取测点算法类型
export const getSensorTreeList = () => {
  return request({
    url: "/robot/sensor/treeList",
    method: "get"
  });
};

// 导航去某个点
export const navigationToSensor = parentId => {
  return request({
    url: "/robot/sensor/navigation",
    method: "post",
    data: {
      parentId
    }
  });
};

// 导航开启
export const navigationOpen = isOpen => {
  return request({
    url: "/robot/sensor/openclose",
    method: "post",
    data: {
      isOpen
    }
  });
};

/**
 * 图片画框与增加文字
 *  @param "sensorId",
    @param  "ovImageSelectX",//原点位置x
      @param  "ovImageSelectY",//原点位置y
      @param  "ovImageSelectWidth":,//框宽
      @param  "ovImageSelectHeight",//框高
      @param  algType
      @param  path
 */
export const cutPicture = query => {
  return request({
    url: "/cutPicture",
    method: "post",
    data: {
      ...query
    }
  });
};
