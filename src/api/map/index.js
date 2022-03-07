import request from "@/utils/request";

/**
 *  轨道画图信息保存
 * @param
 */
export const getRobotMapPath = query => {
  return request({
    url: "/robot/path",
    method: "post",
    data: query
  });
};

/**
 *  轨道画图信息编辑
 * @param
 */
export const updateRobotMapPath = query => {
  return request({
    url: "/robot/path",
    method: "put",
    data: query
  });
};

/**
 *  地图信息查询
 * @param
 */
export const getRobotMapData = () => {
  return request({
    url: "/robot/path/queryMapData",
    method: "get"
  });
};

/**
 *  地图信息查询
 * @param
 */
export const deleteRobotMapNode = id => {
  return request({
    url: "/robot/path/" + id,
    method: "DELETE"
  });
};

/**
 *  地图信息查询
 * @param "ids":"1,2,3",
 * @param"level":"1"//一层 二层 三层轨迹
 */
export const updateRobotNodePath = query => {
  return request({
    url: "/robot/path/updateRobotNodePathBatch",
    method: "POST",
    data: query
  });
};

/**
 *  地图新建调脚本
 * @param
 */
export const startMapNode = query => {
  return request({
    url: "/robot/path/startMapNode",
    method: "POST",
    data: query
  });
};

/**
 *  自动地图生成操作
 * @param
 */
export const generateMap = query => {
  return request({
    url: "/robot/path/generateMap",
    method: "POST",
    data: query
  });
};

/**
 *  清除地图检修区域
 * @param
 */
export const removeCheckPgm = () => {
  return request({
    url: "/robot/upload/removeCheckPgm",
    method: "POST"
  });
};
