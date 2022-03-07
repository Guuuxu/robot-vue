import request from "@/utils/request";

// 站所列表
export const getSiteList = () => {
  return request({
    url: "/robot/station/list",
    method: "get"
  });
};

// 站所新增
/**
 * @param stationId 站所id
 * @param stationName 站所名称
 * @param isHaveSensor
 * @param isHaveBiaodingFile 是否有标定文件
 * @param isHaveMap 是否有地图信息
 * @param isUsed 是否启用
 * @param deleteFlag
 * @param createBy
 *
 */
export const getAddSite = ({
  stationId,
  stationName,
  isHaveSensor,
  isHaveBiaodingFile,
  isHaveMap,
  isUsed,
  deleteFlag,
  createBy
}) => {
  return request({
    url: "/robot/station",
    method: "post",
    data: {
      stationId,
      stationName,
      isHaveSensor,
      isHaveBiaodingFile,
      isHaveMap,
      isUsed,
      deleteFlag,
      createBy
    }
  });
};

// 站所修改
/**
 * @param stationId 站所
 * @param stationName 站所名称
 * @param isHaveSensor
 * @param isHaveBiaodingFile 是否有标定文件
 * @param isHaveMap 是否有地图信息
 * @param isUsed 是否启用
 * @param deleteFlag
 * @param createBy
 *
 */
export const getEditSite = ({
  id,
  stationId,
  stationName,
  isHaveSensor,
  isHaveBiaodingFile,
  isHaveMap,
  isUsed,
  deleteFlag,
  createBy
}) => {
  return request({
    url: "/robot/station",
    method: "put",
    data: {
      id,
      stationId,
      stationName,
      isHaveSensor,
      isHaveBiaodingFile,
      isHaveMap,
      isUsed,
      deleteFlag,
      createBy
    }
  });
};

/**
 * 站所启用
 * @param id
 * @param isUsed 是否启用
 * @param updateBy 当前用户id
 *
 */
export const updateStationStatus = ({ id, isUsed, updateBy }) => {
  return request({
    url: "/robot/station/updateStationStatus",
    method: "post",
    data: {
      id,
      isUsed,
      updateBy
    }
  });
};

/**
 * 删除站所
 * @param id
 *
 */
export const deleteSite = id => {
  return request({
    url: "/robot/station/" + id,
    method: "DELETE"
  });
};

/**
 * 查询使用中的站点
 * @param isUsed
 *
 */
export const getSiteIsUsing = () => {
  return request({
    url: "/robot/station/viewList",
    method: "get",
    params: {
      isUsed: 1
    }
  });
};
