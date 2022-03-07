import request from "@/utils/request";

/**
 * 首页图表数据
 * @param {*}
 */
export const getIndexData = ({ sensorTypeId = "" }) => {
  return request({
    url: "/robot/index/queryIndexData",
    method: "post",
    data: {
      sensorType: sensorTypeId
    }
  });
};
