<template>
  <transition name="viewer-fade">
    <div tabindex="-1" ref="el-image-viewer__wrapper" class="el-image-viewer__wrapper" :style="{ 'z-index': zIndex }">
      <div class="el-image-viewer__mask"></div>
      <!-- CLOSE -->
      <span class="el-image-viewer__btn el-image-viewer__close" @click="hide">
        <i class="el-icon-circle-close"></i>
      </span>
      <!-- ACTIONS -->
      <div class="el-image-viewer__btn el-image-viewer__actions">
        <div class="el-image-viewer__actions__inner">
          <i class="el-icon-zoom-out" @click="handleActions('zoomOut')"></i>
          <i class="el-icon-zoom-in" @click="handleActions('zoomIn')"></i>
        </div>
      </div>
      <!-- CANVAS -->
      <div class="el-image-viewer__canvas">
        <div :style="[{ width: width + 'px', height: height + 'px' }, imgStyle]" id="site-plan" class="station-content" ref="siteplan">
          <canvas :style="{ width: width + 'px', height: height + 'px' }" id="plan-canvas" ref="planCanvas" @mousedown="handleMouseDown"></canvas>
        </div>

        <!-- <img ref="mapImg" :style="imgStyle" :src="imgUrl" /> -->
      </div>
    </div>
  </transition>
</template>

<script>
import paintRos from '@/plugins/map-ros'
import { on, off } from '@/utils/dom'
import { rafThrottle, isFirefox } from '@/utils'
import MapDrawer from '@/plugins/map-drawer/js/mapdrawer'
import storage from '@/utils/storage'

const Mode = {
  CONTAIN: {
    name: 'contain',
    icon: 'el-icon-full-screen'
  },
  ORIGINAL: {
    name: 'original',
    icon: 'el-icon-c-scale-to-original'
  }
}

const mousewheelEventName = 'mousewheel'

export default {
  name: 'ViewSitePlan',

  props: {
    urlList: {
      type: Array,
      default: () => []
    },
    zIndex: {
      type: Number,
      default: 2000
    },
    onSwitch: {
      type: Function,
      default: () => {}
    },
    onClose: {
      type: Function,
      default: () => {}
    },
    initialIndex: {
      type: Number,
      default: 0
    },
    coordinate: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      index: this.initialIndex,
      isShow: false,
      imgUrl: '',
      infinite: true,
      loading: false,
      mode: Mode.CONTAIN,
      transform: {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false
      },
      mapDrawer: null,
      width: 500,
      height: 300
    }
  },
  computed: {
    imgStyle() {
      const { scale, deg, offsetX, offsetY, enableTransition } = this.transform
      const style = {
        // transform: `scale(${scale}) rotate(${deg}deg)`,
        transition: enableTransition ? 'transform .3s' : '',
        'margin-left': `${offsetX}px`,
        'margin-top': `${offsetY}px`
      }
      if (this.mode === Mode.CONTAIN) {
        style.maxWidth = style.maxHeight = '100%'
      }
      return style
    },
    coordinateView() {
      return this.coordinate
    }
  },
  watch: {
    index: {
      handler: function (val) {
        this.reset()
        this.onSwitch(val)
      }
    },
    currentImg(val) {
      this.$nextTick(_ => {
        const $img = this.$refs.img[0]
        if (!$img.complete) {
          this.loading = true
        }
      })
    },
    coordinate: {
      handler(newV) {
        this.updateStatus()
      },
      deep: true
    }
  },
  mounted() {
    this.deviceSupportInstall()
    // add tabindex then wrapper can be focusable via Javascript
    // focus wrapper so arrow key can't cause inner scroll behavior underneath
    this.$refs['el-image-viewer__wrapper'].focus()
    this.init()
  },
  methods: {
    hide() {
      this.deviceSupportUninstall()
      this.onClose()
    },
    deviceSupportInstall() {
      this._keyDownHandler = rafThrottle(e => {
        const keyCode = e.keyCode
        switch (keyCode) {
          // ESC
          case 27:
            this.hide()
            break
          // SPACE
          case 32:
            this.toggleMode()
            break
          // LEFT_ARROW
          case 37:
            this.prev()
            break
          // UP_ARROW
          case 38:
            this.handleActions('zoomIn')
            break
          // RIGHT_ARROW
          case 39:
            this.next()
            break
          // DOWN_ARROW
          case 40:
            this.handleActions('zoomOut')
            break
        }
      })
      // 滚轮事件
      this._mouseWheelHandler = rafThrottle(e => {
        const delta = e.wheelDelta ? e.wheelDelta : -e.detail
        if (delta > 0) {
          this.handleActions('zoomIn', {
            zoomRate: 0.2,
            enableTransition: false
          })
        } else {
          this.handleActions('zoomOut', {
            zoomRate: 0.2,
            enableTransition: false
          })
        }
      })
      on(document, 'keydown', this._keyDownHandler)
      on(document, mousewheelEventName, this._mouseWheelHandler)
    },
    deviceSupportUninstall() {
      off(document, 'keydown', this._keyDownHandler)
      off(document, mousewheelEventName, this._mouseWheelHandler)
      this._keyDownHandler = null
      this._mouseWheelHandler = null
    },
    handleImgLoad(e) {
      this.loading = false
    },
    handleImgError(e) {
      this.loading = false
      e.target.alt = '加载失败'
    },
    handleMouseDown(e) {
      if (this.loading || e.button !== 0) return
      const { offsetX, offsetY } = this.transform
      const startX = e.pageX
      const startY = e.pageY
      this._dragHandler = rafThrottle(ev => {
        this.transform.offsetX = offsetX + ev.pageX - startX
        this.transform.offsetY = offsetY + ev.pageY - startY
      })
      on(document, 'mousemove', this._dragHandler)
      on(document, 'mouseup', ev => {
        off(document, 'mousemove', this._dragHandler)
      })

      e.preventDefault()
    },
    reset() {
      this.transform = {
        scale: 1,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false
      }
    },
    toggleMode() {
      if (this.loading) return

      const modeNames = Object.keys(Mode)
      const modeValues = Object.values(Mode)
      const index = modeValues.indexOf(this.mode)
      const nextIndex = (index + 1) % modeNames.length
      this.mode = Mode[modeNames[nextIndex]]
      this.reset()
    },
    handleActions(action, options = {}) {
      if (this.loading) return
      const { zoomRate, rotateDeg, enableTransition } = {
        zoomRate: 0.2,
        rotateDeg: 90,
        enableTransition: true,
        ...options
      }
      const { transform } = this
      switch (action) {
        case 'zoomOut':
          if (transform.scale > 0.2) {
            transform.scale = parseFloat((transform.scale - zoomRate).toFixed(3))
            this.mapDrawer.imgScale = transform.scale
            const parent = document.getElementById('site-plan')
            const child = parent.getElementsByTagName('div')
            this.width = storage.$instance.getItem('rosMapWidth') * transform.scale
            this.height = storage.$instance.getItem('rosMapHeight') * transform.scale
            for (var i = child.length - 1; i >= 0; i--) {
              parent.removeChild(child[i])
            }
            this.mapDrawer.loadStationMapInfo()
          }
          break
        case 'zoomIn':
          transform.scale = parseFloat((transform.scale + zoomRate).toFixed(3))
          console.log(transform.scale)
          this.mapDrawer.imgScale = transform.scale
          const parent = document.getElementById('site-plan')
          const child = parent.getElementsByTagName('div')
          this.width = storage.$instance.getItem('rosMapWidth') * transform.scale
          this.height = storage.$instance.getItem('rosMapHeight') * transform.scale
          for (var i = child.length - 1; i >= 0; i--) {
            parent.removeChild(child[i])
          }
          this.mapDrawer.loadStationMapInfo()
          break
        case 'clocelise':
          transform.deg += rotateDeg
          break
        case 'anticlocelise':
          transform.deg -= rotateDeg
          break
      }
      transform.enableTransition = enableTransition
    },
    init() {
      Promise.all([paintRos.load(), paintRos.loadDocumentList($('#site-plan'), true)]).then(() => {
        this.loadMapDrawer()
        this.height = storage.$instance.getItem('rosMapHeight')
        this.width = storage.$instance.getItem('rosMapWidth')
      })
      // paintRos.load();
      // paintRos.loadDocumentList($("#site-plan"), true);
      // setTimeout(() => {
      //   this.loadMapDrawer();
      //   this.height = storage.$instance.getItem("rosMapHeight");
      //   this.width = storage.$instance.getItem("rosMapWidth");
      // }, 1500);
    },
    loadMapDrawer() {
      var mapDrawer = null
      mapDrawer = new MapDrawer()
      mapDrawer.bindToHasDiv($('#site-plan'))
      mapDrawer.loadStationMapInfo().then(() => {
        this.updateStatus()
      })
      //机器人操作事件
      mapDrawer.onRobotMove = function (domRobot) {
        //更新状态显示栏位置
        var robotDivLeft = parseInt(domRobot.offset().left)
        var robotDivTop = parseInt(domRobot.offset().top)
        var robotDivWidth = parseInt(domRobot.css('width').replace('px', ''))
        var robotDivHeight = parseInt(domRobot.css('height').replace('px', ''))
      }

      this.mapDrawer = mapDrawer
      // 机器人实时显示

      // var mycans = document.getElementById("plan-canvas");
    },
    updateStatus() {
      if (!this.mapDrawer?.pathNodes?.length) {
        this.mapDrawer.showRobotStatus(false)
      } else {
        this.mapDrawer.showRobotStatus(true, this.coordinateView)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-image-viewer__actions {
  @include fb(center);
}
.el-icon-circle-close {
  color: #ffffff;
}
</style>
