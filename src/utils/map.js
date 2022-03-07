/**
 * 交互式地图 leaflet
 */

import "leaflet/dist/leaflet.css";
import $L from "leaflet";

//创建地图
const createMap = (divId, options) => {
  let map = $L.map(divId, options);
  return map;
};

export default { createMap };
