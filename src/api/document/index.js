import request from "@/utils/request";

/**
 * 查询文档列表
 * @param {*} fileType
 */
export const getDocumentList = query => {
  return request({
    url: "/robot/upload/list",
    method: "get",
    params: query
  });
};

/**
 * 文档查询
 * @param {*} fileName
 */
export const getDocumentDetail = query => {
  return request({
    url: "/robot/upload",
    method: "get",
    params: query
  });
};

/**
 * 文件删除
 * @param {*} id
 */
export const deleteDocument = id => {
  return request({
    url: "/robot/upload/" + id,
    method: "DELETE"
  });
};

/**
 * 文件上传
 * @param {*} file MultipartFile类型文件
 * @param {*} fileType //0-插件 1-文档
 */
export const uploadDocument = formData => {
  return request({
    url: "/robot/upload/fileUpload",
    method: "POST",
    data: formData
  });
};

/**
 * 文件下载
 * @param {*} id
 */
export const downloadDocument = id => {
  return request({
    url: "/robot/upload/download",
    method: "POST",
    data: {
      id
    }
  });
};

/**
 * 检修区域设置
 * @param {*} "originX":"1","originY":"1","width":"123","height":"234"
 */
export const fileUploadPgm = selectRecs => {
  return request({
    url: "/robot/upload/fileUploadPgm",
    method: "POST",
    data: {
      selectRecs
    }
  });
};
