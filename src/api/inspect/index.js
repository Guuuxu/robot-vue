import request from "@/utils/request";

/**
 *  查询机器人当前任务状态
 * @param
 */
export const getTaskStatus = () => {
  return request({
    url: "/robot/control/queryTaskStatus",
    method: "post"
  });
};

/**
 *  巡检任务下发
 * @param list // 定点、定制巡检需要传入测点list
 * @param taskType // 1-全站巡检，2-定点巡检，3-定制巡检
 */
export const startStationTask = ({ list, taskType }) => {
  return request({
    url: "/robot/control/startStationTask",
    method: "post",
    data: {
      list,
      taskType
    }
  });
};

/**
 *  巡检记录
 * @param taskType 任务类型
 */
export const getInspectList = ({
  taskId,
  startTime,
  endTime,
  taskType,
  pageNum,
  pageSize
}) => {
  return request({
    url: "/inspect/result/list",
    method: "get",
    params: {
      taskId,
      startTime,
      endTime,
      taskType,
      pageNum,
      pageSize
    }
  });
};

/**
 *  巡检详情接口
 * @param taskId
 */
export const getInspectionDetail = taskId => {
  return request({
    url: "/inspect/result/inspectionDetail",
    method: "post",
    data: { taskId }
  });
};

/**
 *  删除巡检
 * @param id
 */
export const getInspectionDelete = id => {
  return request({
    url: "/inspect/result/" + id,
    method: "DELETE"
  });
};

/**
 *  巡检报告下载
 * @param taskId
 */
export const getInspectionExport = taskId => {
  return request({
    url: "/inspect/result/export?taskId=" + taskId,
    method: "get"
  });
};

/**
 *  巡检明细结果翻页
 * @param taskId //必输，任务编号
 */
export const getInspectionDetailList = ({
  taskId,
  sensorId,
  pageNum,
  pageSize
}) => {
  return request({
    url: "/inspect/result/inspectionDetailList",
    method: "get",
    params: {
      taskId,
      sensorId,
      pageNum,
      pageSize
    }
  });
};

/**
 *  测点历史记录曲线数据
 * @param startTime
 */
export const getInspectionSensorHistory = ({
  startTime,
  endTime,
  sensorId
}) => {
  return request({
    url: "/inspect/result/inspectionSensorHistory",
    method: "post",
    data: {
      startTime,
      endTime,
      sensorId
    }
  });
};

/**
 *  智能巡检配置列表
 * @param startTime
 */
export const getInspectionList = taskType => {
  return request({
    url: `/robot/inspection/listNotPage?taskType=${taskType}`,
    method: "get"
  });
};
