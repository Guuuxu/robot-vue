<template>
  <el-dialog
    class="setting-repair-area-dialog"
    :title="title"
    :visible.sync="isVisible"
    width="80%"
    append-to-body
    :close-on-click-modal="false"
    :before-close="cancel"
  >
    <div class="canvas canvas-repair" id="repairMap" ref="repairMap">
      <canvas class="canvas-body" id="repairCanvas" ref="repairCanvas">您的电脑不支持canvas.请升级浏览器或使用谷歌浏览器！</canvas>
    </div>
    <div class="dialog-footer mt10">
      <el-button type="primary" @click="onConfirm" :loading="loading">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
      <el-button @click="handleClear" type="danger">清 空</el-button>
    </div>
  </el-dialog>
</template>

<script>
import MapBuilder from '@/plugins/map/mapbuilder'
import shape from '@/plugins/map/shape'
import paintRos from '@/plugins/map-ros'
import MapBuilderConstant from '@/plugins/map/mapbuilder-constant'
import { fileUploadPgm } from '@/api/document'
import { removeCheckPgm } from '@/api/map'
export default {
  name: 'SettingRepairAreaDialog',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '设置检修区'
    }
  },
  watch: {
    isVisible(val) {
      if (val) {
        this.$nextTick(() => {
          this.init()
          this.bindEvent()
          // 每次打开清空矩形框
          const parent = this.$refs.repairMap
          const child = parent.getElementsByTagName('div')
          if (child.length) {
            for (var i = child.length - 1; i >= 0; i--) {
              parent.removeChild(child[i])
            }
          }
        })
      }
    }
  },
  data() {
    return {
      mapBuilder: null,
      loading: false
    }
  },
  methods: {
    init() {
      paintRos.load()
      paintRos.loadDocumentList($('#repairMap'))
    },
    bindEvent() {
      // 开始画图
      const self = this
      var canvas = document.getElementById('repairCanvas')
      var xp = $('.xp')[0]
      var cobj = canvas.getContext('2d')
      var mapBuilder = null
      mapBuilder = new MapBuilder()
      mapBuilder.bindToRepairDiv($('.canvas-repair'), true)
      var MapBuilderM = mapBuilder

      // var obj = new shape(mapBuilder, false);
      // this.obj = obj;
      this.mapBuilder = MapBuilderM
      // 默认选中指针工具
      MapBuilderM.setTool(MapBuilderConstant.TOOL_SELECT)
      MapBuilderM.setToolMode(MapBuilderConstant.TOOL_SELECT_MODE_DEFAULT)
      mapBuilder.onSelectedPropertyChanged = function (mb) {
        self.updatePropertiesBox(mb)
      }
      // const canvas = document.getElementById('repairMap')
      // canvas.addEventListener('mousedown', e => {
      //   //计算鼠标位置
      //   const clientX = parseInt(e.pageX - mapBuilder.dom.offset().left + mapBuilder.dom.scrollLeft())
      //   const clientY = parseInt(e.pageY - mapBuilder.dom.offset().top + mapBuilder.dom.scrollTop())
      //   var curPointPos = {
      //     x: e.clientX,
      //     y: e.clientY
      //   }
      // })
    },
    async onConfirm() {
      const selectRects = this.mapBuilder.selectRects
      if (!selectRects.length) {
        this.$myMessage.warning('请框选检修区域!')
        return
      }
      this.loading = true
      try {
        await fileUploadPgm(selectRects)
        this.mapBuilder.selectRects = []
        this.loading = false
        this.cancel()
      } catch (error) {
        this.loading = false
      }
    },
    async handleClear() {
      await removeCheckPgm()
      this.$myMessage.success('已清除检修区域')
      this.init()
    },
    cancel() {
      this.$emit('update:isVisible', false)
      this.resetForm('nodeForm')
      this.$emit('onUpdate')
    }
  }
}
</script>

<style lang="scss" scoped>
.setting-repair-area-dialog {
  ::v-deep {
    .el-dialog {
      max-height: 94vh;
      .el-dialog__body {
        max-height: calc(94vh - 54px - 60px);
      }
      .canvas-repair {
        width: 100%;
        max-height: calc(94vh - 54px - 60px - 60px - 36px);
        overflow: scroll;
      }
    }
  }
}
</style>
