import request from "@/utils/request";

// 快速新增测点
export const addSensorFast = query => {
  return request({
    url: "/robot/fast",
    method: "post",
    data: {
      ...query
    }
  });
};

// 编辑快速测点
export const updateSensorFast = query => {
  return request({
    url: "/robot/fast",
    method: "put",
    data: {
      ...query
    }
  });
};

// 快速测点列表接口
export const getSensorFastList = () => {
  return request({
    url: "/robot/fast/list",
    method: "get"
  });
};

// 删除测点
export const deleteSensor = id => {
  return request({
    url: "/robot/fast/" + id,
    method: "DELETE"
  });
};
