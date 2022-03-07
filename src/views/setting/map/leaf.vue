<template>
  <div class="leaf-wrap">
    <div class="canvas mt20" id="inspectionMap" style="display:none">
      <canvas class="canvas-body" id="canvas">您的电脑不支持canvas.请升级浏览器或使用谷歌浏览器！</canvas>
    </div>
    <div class="map-container" id="map-container"></div>

    <!-- <div ref="button" @click="rotate" style="position:absolute;top:360px">旋转</div> -->
  </div>
</template>

<script>
import L from 'leaflet'
import { debounce } from '@/utils'
import paintRos from '@/plugins/map-ros'
import { accAdd, accSub, accDiv, accMul } from '@/utils'
import storage from '@/utils/storage'
import { getSensorFastList } from '@/api/setting/fastAcq'
export default {
  name: 'leaf',
  data() {
    return {
      url: require('@/assets/image/login-background.jpg'),
      zoom: -1,
      markers: [47.31322, -1.319482],
      options: {
        radius: 2,
        color: 'red', //'#1890ff',
        weight: 1,
        fill: true,
        fillColor: '#fff',
        fillOpacity: 1,
        pane: 'shadowPane'
      },
      mapScale: 1, // 地图缩放
      polyline: {
        // 折线
        latlngs: [],
        options: {
          color: '#000',
          weight: 1
        }
      },
      imageLay: null,
      circleObj: [],
      pathNodeList: [],
      pxToPos: 0,
      originZeroPoint: [0, 0],
      lastSelectMarker: {}
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      Promise.all([paintRos.load(), paintRos.loadDocumentList($('#inspectionMap'))]).then(res => {
        // mapBuilder.mapController.redrawPath()
        // var canvas = document.getElementsByTagName('canvas')[0]
        // var img = this.$refs.img
        // img.src = canvas.toDataURL('image/png')
        this.url = res[1].toDataURL('image/png')
        this.loadMap()
      })
    },
    loadMap() {
      var map = L.map('map-container', {
        center: [0, 0],
        zoom: this.zoom,
        minZoom: -2,
        maxZoom: 2,
        crs: L.CRS.Simple,
        attributionControl: false
      })
      // 图片尺寸
      var w = storage.$instance.getItem('rosMapWidth'),
        h = storage.$instance.getItem('rosMapHeight')
      // calculate the edges of the image, in coordinate space
      var southWest = map.unproject([0, h], 1)
      var northEast = map.unproject([w, 0], 1)
      var bounds = new L.LatLngBounds(southWest, northEast)
      // add the image overlay,
      // so that it covers the entire map
      this.imageLay = L.imageOverlay(this.url, bounds).addTo(map)
      // tell leaflet that the map is exactly as big as the image
      map.setMaxBounds(bounds)
      this.mapObject = map
      this.debouncedMoveEndHandler = debounce(this.moveEndHandler, 100)
      this.mapObject.on('moveend', this.debouncedMoveEndHandler)
      this.loadMapData()
    },
    async loadMapData() {
      const res = await getSensorFastList()
      this.pathNodeList = res.rows
      this.pxToPos = JSON.parse(storage.$instance.getItem('pxToPos'))
      this.originZeroPoint = JSON.parse(storage.$instance.getItem('originZeroPoint'))
      this.draw()
    },
    draw(selectedObj) {
      for (let item of this.pathNodeList) {
        // ros坐标点转换像素点位置
        const mapNodeX = accAdd(this.originZeroPoint[0], accDiv(accMul(item.positionX, this.mapScale), this.pxToPos))
        const mapNodeY = accSub(this.originZeroPoint[1], accDiv(accMul(item.positionY, this.mapScale), this.pxToPos))
        // 计算地图坐标点
        const latlng = this.mapObject.unproject([mapNodeX, mapNodeY], 1)
        this.polyline.latlngs.push(latlng)
        this.circleObj.push({
          id: item.id,
          markerInstance: L.circleMarker(latlng, {
            ...this.options,
            fillColor: item.id === selectedObj?.id ? 'red' : this.options.fillColor
          }).addTo(this.mapObject)
        })
      }
      console.log(this.polyline)
      // 地图折线
      this.polylineObj = L.polyline(this.polyline.latlngs, this.polyline.options).addTo(this.mapObject)
      //缩放地图视角到该Polyline上
      //   this.mapObject.fitBounds(polyline.getBounds())
    },
    moveEndHandler() {
      const zoom = this.mapObject.getZoom()
      this.zoom = zoom
    },
    redraw(selectedObj) {
      if (Object.keys(this.lastSelectMarker).length !== 0) {
        const _latlng = this.lastSelectMarker._latlng
        this.mapObject.removeLayer(this.lastSelectMarker)
        L.circleMarker(_latlng, this.options).addTo(this.mapObject)
      }
      for (const item of this.circleObj) {
        if (item.id === selectedObj.id) {
          console.log(item.markerInstance)
          this.lastSelectMarker = item.markerInstance
          const _latlng = item.markerInstance._latlng
          this.mapObject.removeLayer(item.markerInstance)
          L.circleMarker(_latlng, {
            ...this.options,
            fillColor: 'red'
          }).addTo(this.mapObject)
          break
        }
      }

      //   this.draw(selectedObj)
    },
    rotate() {
      //   var sel = document.querySelector('.leaflet-map-pane')
      //   console.log(sel.style.transform)
      //   const trans = sel.style.transform
      //   sel.style.transformOrigin = '1192px 0'
      //   sel.style.transform = `${trans} rotateZ(90deg)`
    }
  },
  beforeDestroy() {
    this.mapObject.off('moveend', this.debouncedMoveEndHandler)
  }
}
</script>

<style>
.leaf-wrap {
  width: 100%;
  position: relative;
  height: 100%;
}
.map-container {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>