import request from "@/utils/request";

/**
 * 未处理告警汇总
 * @param {*} stationId
 * @param {*} beginTime
 * @param {*} endTime
 * @param {*} keyWord
 */
export const getUnHandledList = ({
  stationId,
  beginTime,
  endTime,
  keyWord,
  warningType,
  pageSize,
  pageNum,
  warningState
}) => {
  return request({
    url: "/robot/warningRobot/unHandledList",
    method: "get",
    params: {
      stationId,
      beginTime,
      endTime,
      keyWord,
      warningType,
      pageSize,
      pageNum,
      warningState
    }
  });
};
