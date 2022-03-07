import request from "@/utils/request";

/**
 *  关联报警列表
 * @param {*} stationId
 * @param {*} beginTime
 * @param {*} endTime
 * @param {*} warningState 0 未处理 1 已处理
 * @param {*} warningType
 * @returns
 */
export const getReWarningList = ({
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
    url: "/robot/warningRe/list",
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
export const deleteWarningRe = id => {
  return request({
    url: "/robot/warningRe/" + id,
    method: "delete"
  });
};

/**
 *  查询某个告警
 * @param {*} id
 */
export const getWarningReDetail = id => {
  return request({
    url: "/robot/warningRe/" + id,
    method: "get"
  });
};

/**
 *  修改
 * @param {*} id
 */
export const updateWarningRe = ({
  id,
  resultId,
  warningValue,
  dealContent,
  warningState
}) => {
  return request({
    url: "/robot/warningRe/",
    method: "put",
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
 *  报警处理
 * @param {*} id
 */
export const handleWarningRe = ({ id, dealContent, descb }) => {
  return request({
    url: "/robot/warningRe/handle",
    method: "post",
    data: {
      id,
      dealContent,
      descb
    }
  });
};
