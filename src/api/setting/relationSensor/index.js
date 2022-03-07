import request from "@/utils/request";

/**
 * 关联测点新增
 * @param {*} reName 关联测点名称
 * @param {*} validMonth 有效月
 * @returns
 */
export const addRelationSensor = ({ reName, validMonth }) => {
  return request({
    url: "/robot/relationSensor",
    method: "post",
    data: {
      reName,
      validMonth
    }
  });
};

/**
 * 关联测点列表
 * @returns
 */
export const getListNotPage = () => {
  return request({
    url: "/robot/relationSensor/listNotPage",
    method: "get"
  });
};

/**
 * 巡检测点目录树接口
 * @returns
 */
export const getTreeListForRelSensorSelect = () => {
  return request({
    url: "/robot/device/treeListForRelSensorSelect",
    method: "get"
  });
};

/**
 *  关联测点删除
 * @returns
 */
export const deleteRelationSensor = id => {
  return request({
    url: `/robot/relationSensor/${id}`,
    method: "DELETE"
  });
};

/**
 *  关联测点根据id查询
 * @returns
 */
export const getRelationSensor = id => {
  return request({
    url: `/robot/relationSensor/${id}`,
    method: "get"
  });
};

/**
 *  关联测点修改
 * @param {*} reName 关联测点名称
 * @param {*} validMonth 有效月
 * @returns
 */
export const updateRelationSensor = ({ id, reName, validMonth }) => {
  return request({
    url: `/robot/relationSensor`,
    method: "put",
    data: {
      id,
      reName,
      validMonth
    }
  });
};

/**
 *  关联关系新增保存
 * @param {*} sensorId    子测点编号
 * @param {*} relogicName
 * @param {*} reId        关联测点id
 * @param {*} relation    中文表达式
 * @param {*} relationType 关联关系类型
 * @param {*} warnValue   警告内容
 * @param {*} relationExp 英文关联表达式
 * @returns
 */
export const getRelationLogic = ({
  sensorId,
  relogicName,
  reId,
  relation,
  relationType,
  warnValue,
  relationExp
}) => {
  return request({
    url: `/robot/relationLogic`,
    method: "post",
    data: {
      sensorId,
      relogicName,
      reId,
      relation,
      relationType,
      warnValue,
      relationExp
    }
  });
};

/**
 *  关联关系校验
 * @param {*} relationExp
 * @returns
 */
export const checkRelationExp = relationExp => {
  return request({
    url: "/robot/relationLogic/checkExp",
    method: "post",
    data: {
      relationExp
    }
  });
};

/**
 *  关联测点子测点保存和关联关系中间表保存
 * @param {*}
 * @returns
 */
export const insertRelationLogic = ({
  robotRelationMethod,
  robotResensorRelation
}) => {
  return request({
    url: "/robot/relationLogic/insert",
    method: "post",
    data: {
      robotRelationMethod,
      robotResensorRelation
    }
  });
};

/**
 *  关联测点巡检结果列表
 * @param {*} taskId
 * @returns
 */
export const getResultList = taskId => {
  return request({
    url: "/robot/result/list",
    method: "get",
    params: {
      taskId
    }
  });
};

/**
 *  关联测点巡检结果详情
 * @param {*} id
 * @returns
 */
export const getResultInspectionDetail = id => {
  return request({
    url: "/robot/result/getInspectionDetail",
    method: "post",
    data: {
      id
    }
  });
};
