import axios from "axios";
import { Notification, MessageBox, Message } from "element-ui";
import store from "@/store";
import { getToken } from "@/utils/auth";
import errorCode from "@/utils/errorCode";

window._axiosPromiseArr = [];

// 是否显示重新登录
let isReloginShow;
axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: process.env.VUE_APP_BASE_API,
  // 超时
  timeout: 20000
});
// request拦截器
service.interceptors.request.use(
  config => {
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false;
    if (getToken() && !isToken) {
      config.headers["Authorization"] = "Bearer " + getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    // 将请求的接口添加到数组中
    config.cancelToken = new axios.CancelToken(cancel => {
      window._axiosPromiseArr.push({ cancel, id: config.id });
    });
    return config;
  },
  error => {
    console.log(error);
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  res => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode["default"];
    if (code === 401) {
      if (!isReloginShow) {
        isReloginShow = true;
        MessageBox.confirm(
          "登录状态已过期，您可以继续留在该页面，或者重新登录",
          "系统提示",
          {
            confirmButtonText: "重新登录",
            cancelButtonText: "取消",
            type: "warning"
          }
        )
          .then(() => {
            isReloginShow = false;
            store.dispatch("LogOut").then(() => {
              // 如果是登录页面不需要重新加载
              if (window.location.hash.indexOf("#/login") != 0) {
                location.href = "/index";
              }
            });
          })
          .catch(() => {
            isReloginShow = false;
          });
      }
      return Promise.reject("无效的会话，或者会话已过期，请重新登录。");
    } else if (code === 500) {
      Message({
        message: msg,
        type: "error"
      });
      return Promise.reject(new Error(msg));
    } else if (code !== 200) {
      Notification.error({
        title: msg
      });
      return Promise.reject("error");
    } else {
      return res.data;
    }
  },
  error => {
    let { message } = error;
    if (message == "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    Message({
      message: message,
      type: "error",
      duration: 5 * 1000
    });
    return Promise.reject(error);
  }
);

export default service;
