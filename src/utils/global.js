const pxToPos = 0.01; // 1px =0.01m [-2.25579,-3.7296]
// const originPoint = [-225.57, -1487.04]; // 导航地图中心点相对图片位置 (北郡)
// const mapScale = 0.524659; // 导航地图缩放比例
// const originPoint = [288.01, 93.02]; // 导航地图中心点相对图片位置 （实验室）
// const mapScale = 0.894454; // 导航地图缩放比例

// ros
const RosConf = "ws://10.9.162.199:9090";

const global = {
  // mapScale,
  // originPoint,
  pxToPos,
  RosConf
};
export default global;
