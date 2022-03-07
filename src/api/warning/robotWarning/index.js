import request from "@/utils/request";

/**
 * (未处理)告警列表
 * @param {*} stationId
 * @param {*} beginTime
 * @param {*} endTime
 * @param {*} warningState 0 未处理 1 已处理
 * @param {*} warningValue
 */
export const getWarningRobotList = ({
  stationId,
  beginTime,
  endTime,
  warningState,
  warningType,
  warningValue,
  pageSize,
  pageNum
}) => {
  return request({
    url: "/robot/warningRobot/list",
    method: "get",
    params: {
      stationId,
      beginTime,
      endTime,
      warningState,
      warningType,
      warningValue,
      pageSize,
      pageNum
    }
  });
};

/**
 *  删除告警
 * @param {*} id
 */
export const getWarningRobotDelete = id => {
  return request({
    url: "/robot/warningRobot/" + id,
    method: "delete"
  });
};

/**
 *  查询某个告警
 * @param {*} id
 */
export const getWarningRobotDetail = id => {
  return request({
    url: "/robot/warningRobot/" + id,
    method: "get"
  });
};

/**
 *  处理告警
 * @param {*} id
 * @param {*} dealType 规则类型
 * @param {*} dealInfo 规则名称
 * @param {*} descb 描述
 */
export const getWarningRobotHandler = ({ id, dealType, dealInfo, descb }) => {
  return request({
    url: "/robot/warningRobot/handle",
    method: "post",
    data: {
      id,
      dealType,
      dealInfo,
      descb
    }
  });
};
