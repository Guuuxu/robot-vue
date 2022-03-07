import request from "@/utils/request";

/**
 * (未处理)告警列表
 * @param {*} stationId
 * @param {*} beginTime
 * @param {*} endTime
 * @param {*} warningState
 * @param {*} sensorName
 */
export const getWarningSensorList = ({
  stationId,
  beginTime,
  endTime,
  warningState,
  warningType,
  sensorName,
  pageSize,
  pageNum
}) => {
  return request({
    url: "/robot/warningSensor/list",
    method: "get",
    params: {
      stationId,
      beginTime,
      endTime,
      warningState,
      warningType,
      sensorName,
      pageSize,
      pageNum
    }
  });
};

/**
 *  删除告警
 * @param {*} id
 */
export const getWarningSensorDelete = id => {
  return request({
    url: "/robot/warningSensor/" + id,
    method: "delete"
  });
};

/**
 *  修改告警
 * @param {*} id
 */
export const editWarningSensor = ({
  id,
  resultId,
  warningValue,
  dealContent,
  warningState
}) => {
  return request({
    url: "/robot/warningSensor",
    method: "PUT",
    data: {
      id,
      resultId,
      warningValue,
      dealContent,
      warningState
    }
  });
};

/**
 *  查询某个告警
 * @param {*} id
 */
export const getWarningSensorDetail = id => {
  return request({
    url: "/robot/warningSensor/" + id,
    method: "get"
  });
};

/**
 *  处理告警
 * @param {*} id
 * @param {*} dealContent 规则名称
 * @param {*} descb 描述
 */
export const getWarningSensorHandler = ({ id, dealContent, descb }) => {
  return request({
    url: "/robot/warningSensor/handle",
    method: "post",
    data: {
      id,
      dealContent,
      descb
    }
  });
};
