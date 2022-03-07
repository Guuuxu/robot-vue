import request from "@/utils/request";

// 查询策略列表
export const getStrategyList = query => {
  return request({
    url: "/robot/strategy/list",
    method: "get",
    params: query
  });
};

/**
 * 新建策略
 * @param stationId 站点id
 * @param strategyName 策略名称
 * @param startDate
 * @param endDate
 * @param isSingle //0-非单站所
 * @param strategyType //策略类型 3-间隔方案 2-模板方案 1-自定义
 * @param intervalType // 1：小时 2：天 3：周 4 分钟
 * @param intervalCount // 十分钟一次 间隔时间
 * @param inspectionType //1-全站 2-定点 3-定制
 * @param template strategyType=2  时间方案模板 1：每日一巡2：每日两巡3：每日三巡4：每周一巡5：每周两巡6：每周三巡
 * @param strategyMonth //strategyType=1 策略月
 * @param strategyDay //strategyType=1 策略日
 * @param strategyHour //strategyType=1 策略时
 * @param sensorIds // inspectionType=2或者3的时候传多个用逗号相隔
 */
export const getStrategyAdd = ({
  stationId,
  strategyName,
  strategyType,
  startDate,
  endDate,
  intervalType,
  intervalCount,
  inspectionType,
  template,
  strategyMonth,
  strategyDay,
  strategyHour,
  sensorIds
}) => {
  return request({
    url: "/robot/strategy",
    method: "post",
    data: {
      stationId,
      strategyName,
      strategyType,
      startDate,
      endDate,
      isSingle: 1,
      intervalType,
      intervalCount,
      inspectionType,
      template,
      strategyMonth,
      strategyDay,
      strategyHour,
      sensorIds
    }
  });
};

/**
 * 修改策略
 * @param id
 * @param stationId 站点id
 * strategyIds 策略id
 * @param strategyName 策略名称
 * @param startDate  //strategyType=3
 * @param endDate  //strategyType=3
 * @param isSingle //0-非单站所
 * @param strategyType //策略类型 3-间隔方案 2-模板方案 1-自定义
 * @param intervalType // 1：小时 2：天 3：周 4 分钟
 * @param intervalCount // 十分钟一次 间隔时间
 * @param inspectionType //1-全站 2-定点 3-定制
 * @param template strategyType=2  时间方案模板 1：每日一巡2：每日两巡3：每日三巡4：每周一巡5：每周两巡6：每周三巡
 * @param strategyMonth //strategyType=1 策略月
 * @param strategyDay //strategyType=1 策略日
 * @param strategyHour //strategyType=1 策略时
 * @param sensorIds // inspectionType=2或者3的时候传多个用逗号相隔
 */
export const getStrategyUpdate = ({
  id,
  stationId,
  strategyName,
  strategyType,
  startDate,
  endDate,
  intervalType,
  intervalCount,
  inspectionType,
  template,
  strategyMonth,
  strategyDay,
  strategyHour,
  sensorIds,
  strategyId
}) => {
  return request({
    url: "/robot/strategy",
    method: "put",
    data: {
      id,
      stationId,
      strategyName,
      strategyType,
      startDate,
      endDate,
      isSingle: 1,
      intervalType,
      intervalCount,
      inspectionType,
      template,
      strategyMonth,
      strategyDay,
      strategyHour,
      sensorIds,
      strategyId
    }
  });
};

// 删除策略
export const getStrategyDelete = (id, strategyIds) => {
  return request({
    url: `/robot/strategy/${id}`,
    method: "DELETE",
    data: {
      strategyIds
    }
  });
};

// 查询某个策略
export const getStrategyDetail = id => {
  return request({
    url: `/robot/strategy/${id}`,
    method: "get"
  });
};
