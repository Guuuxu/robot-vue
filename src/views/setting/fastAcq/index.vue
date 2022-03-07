<template>
  <div class="fastAcq">
    <el-row :gutter="10">
      <el-col :span="4">
        <div class="left-board-fast">
          <el-card value="2" class="prop-card mapList-card">
            <div slot="header" class="clearfix">
              <span>地图点列表</span>
            </div>
            <div class="monitoring-body" ref="monitoring">
              <el-tree
                ref="nodeTree"
                :data="nodeTreeData"
                node-key="id"
                show-checkbox
                check-strictly
                highlight-current
                default-expand-all
                :props="nodeProps"
                @check-change="handleNodeClick"
                @node-contextmenu="handleNodeRightClick"
              ></el-tree>
              <!-- 右击柜体对话框 -->
              <ul v-show="isShowMenu" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
                <li>
                  <el-button type="primary" size="mini" @click="navigateToSelectedSensor()">导航</el-button>
                </li>
                <li>
                  <el-button type="danger" size="mini" @click="handleDelete()">删除</el-button>
                </li>
              </ul>
            </div>
          </el-card>

          <el-card class="prop-card mt10">
            <div slot="header" class="clearfix">
              <span>属性</span>
            </div>
            <el-form :model="currentObject" :label-width="labelWidth">
              <el-form-item label="X:" prop="positionX">
                <el-input size="mini" class="steelNo" v-model="currentObject.positionX"></el-input>
              </el-form-item>
              <el-form-item label="Y:" prop="positionY">
                <el-input size="mini" class="steelNo" v-model="currentObject.positionY"></el-input>
              </el-form-item>
              <el-form-item label="Z:" prop="carAngle">
                <el-input size="mini" class="angle" v-model="currentObject.carAngle" />
              </el-form-item>
              <el-form-item label="排序:" prop="sort">
                <el-input class="value" size="mini" v-model="currentObject.sort"></el-input>
              </el-form-item>
              <div class="text-center mt10">
                <el-button size="mini" type="primary" @click="save">保存</el-button>
              </div>
            </el-form>
          </el-card>
        </div>
      </el-col>
      <el-col :span="15">
        <div class="center-board-fast">
          <!-- <div class="canvas" id="inspectionMap">
            <canvas class="canvas-body" id="canvas">您的电脑不支持canvas.请升级浏览器或使用谷歌浏览器！</canvas>
          </div>-->
          <leaf ref="leaf" />
        </div>
      </el-col>
      <el-col :span="5">
        <div class="right-board-fast no_touch">
          <el-card class="action-wrap">
            <!-- 全屏 -->
            <screenfull v-if="isMobile || clientWidth <= 1024" id="screenfull" class="right-menu-item hover-effect mb20" />
            <el-button size="mini" type="primary" @click="handleAddSensorFast" :loading="addLoading">录入</el-button>
            <el-button size="mini" type="danger" @click="handleDelete" :loading="deleteLoading">删除</el-button>
          </el-card>
          <el-card class="mt10 car-wrap">
            <div class="state-body-row">
              <span class="demonstration mr10 pb5">线速度</span>
              <el-input-number
                class
                size="mini"
                :min="0"
                :max="1"
                :step="0.05"
                :precision="2"
                v-model="rTPInfo.speedMode"
                @change="changeSpeed(0,rTPInfo.speedMode)"
              ></el-input-number>
            </div>
            <div class="state-body-row">
              <span class="demonstration mr10 pb5">角速度</span>
              <el-input-number
                class
                size="mini"
                :min="0"
                :max="0.6"
                :step="0.05"
                :precision="2"
                v-model="rTPInfo.speed"
                @change="changeSpeed(2,rTPInfo.speed)"
              ></el-input-number>
            </div>
            <!-- 移动端 -->
            <div class="control-wrap" v-if="isMobile || clientWidth <= 1024">
              <el-button
                type="primary"
                class="icon-top"
                icon="el-icon-top"
                circle
                @touchstart.native.prevent="handleWalkMouseDown(0)"
                @touchend.native.prevent="handleWalkMouseUp(0)"
              ></el-button>
              <el-button
                type="primary"
                class="icon-right"
                icon="el-icon-right"
                circle
                @touchstart.native.prevent="handleTurnMouseDown(1)"
                @touchend.native.prevent="handleTurnMouseUp(1)"
              ></el-button>
              <!-- 后退 -->
              <el-button
                type="primary"
                class="icon-bottom"
                icon="el-icon-bottom"
                circle
                @touchstart.native.prevent="handleWalkMouseDown(1)"
                @touchend.native.prevent="handleWalkMouseUp(1)"
              ></el-button>
              <!-- 左转 -->
              <el-button
                type="primary"
                class="icon-back"
                icon="el-icon-back"
                circle
                @touchstart.native.prevent="handleTurnMouseDown(0)"
                @touchend.native.prevent="handleTurnMouseUp(0)"
              ></el-button>
            </div>
            <!-- pc端 -->
            <div class="control-wrap" v-else>
              <el-button
                type="primary"
                class="icon-top"
                icon="el-icon-top"
                circle
                @mousedown.native="handleWalkMouseDown(0)"
                @mouseup.native="handleWalkMouseUp(0)"
              ></el-button>
              <!-- 右转 -->
              <el-button
                type="primary"
                class="icon-right"
                icon="el-icon-right"
                circle
                @mousedown.native="handleTurnMouseDown(1)"
                @mouseup.native="handleTurnMouseUp(1)"
              ></el-button>
              <!-- 后退 -->
              <el-button
                type="primary"
                class="icon-bottom"
                icon="el-icon-bottom"
                circle
                @mousedown.native="handleWalkMouseDown(1)"
                @mouseup.native="handleWalkMouseUp(1)"
              ></el-button>
              <!-- 左转 -->
              <el-button
                type="primary"
                class="icon-back"
                icon="el-icon-back"
                circle
                @mousedown.native="handleTurnMouseDown(0)"
                @mouseup.native="handleTurnMouseUp(0)"
              ></el-button>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
let timer

import Screenfull from '@/components/Screenfull'
import leaf from '@/views/setting/map/leaf'
import { walkControl, speedModeControl, rotateCarControl } from '@/api/setting/device/control'
import { getSensorFastList, updateSensorFast, addSensorFast, deleteSensor } from '@/api/setting/fastAcq'
import { getSiteIsUsing } from '@/api/setting/site'
import { getTaskStatus } from '@/api/inspect'
import axios from 'axios'
import { debounce } from '@/utils'
export default {
  components: {
    Screenfull,
    leaf
  },
  data() {
    return {
      marks: {
        0: '低',
        1: '中',
        2: '高'
      },
      currentObject: {},
      // 节点列表
      nodeTreeData: [
        {
          name: this.$store.state.robot.stationName,
          disabled: true,
          children: []
        }
      ],
      nodeProps: {
        children: 'children',
        label: (data, node) => {
          if (!data.type) {
            return data.name
          } else {
            if (data.type === 1) return '地图点 ' + data.idx
            if (data.type === 2) return '虚拟点 ' + data.idx
            if (data.type === 3) return '充电点 ' + data.idx
            if (data.type === 5) return '辅助点 ' + data.idx
          }
        }
      },
      mapBuilder: null,
      selectedObject: null,
      obj: null,
      rTPInfo: {
        speedMode: 0,
        ptzSpeedMode: 0,
        speed: 0
      }, // 机器人实时信息
      taskStatus: {},
      addLoading: false,
      deleteLoading: false,
      isShowMenu: false,
      left: 0,
      top: 0,
      currentId: 0,
      labelWidth: '80px',
      clientWidth: 0,
      clientHeight: 0,
      isMobile: false
    }
  },
  watch: {
    isShowMenu(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  computed: {},
  created() {
    this.loadSite()
    this.fetchTaskStatus()
    // 判断设备类型
    this.isMobile = navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    )
  },
  mounted() {
    this.loadMapFastData()
    const clientWidth = document.documentElement.clientWidth
    const clientHeight = document.documentElement.clientHeight
    this.clientWidth = clientWidth
    this.clientHeight = clientHeight

    if (clientWidth <= 1024) {
      // matePad
      this.labelWidth = '46px'
    } else {
      this.labelWidth = '80px'
    }
    //阻止默认长按出现菜单
    window.ontouchstart = function (e) {
      e.preventDefault()
    }
  },
  methods: {
    async loadMapFastData() {
      const res = await getSensorFastList()
      // this.pathNodeList = res.rows
      const treeList = res.rows
      treeList.map((item, index) => {
        item.idx = index + 1
      })
      this.nodeTreeData[0].children.push(...treeList)
    },
    // 实时状态信息
    async fetchTaskStatus() {
      try {
        const res = await getTaskStatus()
        this.rTPInfo = res.data.rTPInfo
        this.rTPInfo.ptzSpeedMode = +this.rTPInfo.ptzSpeedMode
        this.rTPInfo.speedMode = +this.rTPInfo.speedMode
        this.rTPInfo.speed = +this.rTPInfo.speed
        this.taskStatus = res.data
      } catch (error) {}
    },
    async loadSite() {
      const res = await getSiteIsUsing()
      const originPoint = [res.data[0].originX, res.data[0].originY]
      const originZeroPoint = [res.data[0].originZeroX, res.data[0].originZeroY]
      this.$storage.setItem('scaling', JSON.stringify(res.data[0].scaling))
      this.$storage.setItem('originPoint', JSON.stringify(originPoint))
      this.$storage.setItem('originZeroPoint', JSON.stringify(originZeroPoint))
      this.$storage.setItem('pxToPos', JSON.stringify(res.data[0].resolution))
    },
    // 更改速度
    changeSpeed(type, speed) {
      const fn = debounce(async () => {
        await speedModeControl({
          type,
          speedMode: speed
        })
      }, 1000)
      fn()
    },
    // 轨道节点点击
    handleNodeClick(data, checked, node) {
      this.isShowMenu = false
      if (checked) {
        this.$refs.nodeTree.setCheckedNodes([data])
        this.currentObject = data
        this.$refs.leaf.redraw(data)
      }
    },
    // 右击操作
    handleNodeRightClick(e, obj, node) {
      this.isShowMenu = true
      this.left = this.$refs.monitoring.clientWidth
      this.top = e.clientY
      this.currentId = obj.id
    },
    // 关闭右键菜单
    closeMenu() {
      this.isShowMenu = false
    },
    // 导航
    navigateToSelectedSensor() {
      axios({
        method: 'post',
        url: process.env.VUE_APP_BASE_C_API,
        data: {
          MSG_TYPE: '9996',
          MSG_DATA: {
            id: this.currentId
          }
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      })
        .then(res => {})
        .catch(function (err) {
          console.log(err)
        })
    },
    // 新增
    async handleAddSensorFast() {
      this.addLoading = true
      const res = await getTaskStatus()
      try {
        await addSensorFast({
          sensorLevel: '2',
          robotSensorInfo: {
            positionX: res.data.posX,
            positionY: res.data.posY,
            carAngle: res.data.bodyAngle,
            type: 1,
            sort: 0
          }
        })
        this.$myMessage.success('已添加')
        this.addLoading = false
        this.nodeTreeData[0].children = []
        this.init()
      } catch (error) {
        this.addLoading = false
      }
    },
    // 删除
    async handleDelete() {
      this.deleteLoading = true
      await deleteSensor(this.currentObject.id)
      this.$myMessage.success('已删除')
      this.deleteLoading = false
      this.nodeTreeData[0].children = []
      this.init()
    },
    // 编辑
    async save() {
      if (!this?.currentObject?.id) {
        this.$myMessage.warning('请选择一个地图点')
        return
      }
      await updateSensorFast({
        id: this.currentObject.id,
        positionX: this.currentObject.positionX,
        positionY: this.currentObject.positionY,
        carAngle: this.currentObject.carAngle,
        type: this.currentObject.type,
        sort: this.currentObject.sort
      })
      this.$myMessage.success('保存成功')
      this.nodeTreeData[0].children = []
      this.init()
    },
    // 行走控制
    controlWalk(direction, buttonFlag) {
      try {
        walkControl({
          direction,
          buttonFlag,
          speedMode: this.rTPInfo.speedMode
        })
      } catch (error) {
        clearInterval(timer)
      }
    },
    // 鼠标按下行走
    handleWalkMouseDown(direction) {
      if (timer) clearInterval(timer)
      this.controlWalk(direction, 0)
      timer = setInterval(() => {
        this.controlWalk(direction, 0)
      }, 200)
    },
    // 鼠标松开--停止行走
    handleWalkMouseUp(direction) {
      clearInterval(timer)
      this.controlWalk(direction, 1)
      this.clearPendingFunc()
    },
    // 小车旋转控制
    controlRotateCar(direction, buttonFlag) {
      try {
        rotateCarControl({
          direction,
          buttonFlag,
          speedMode: this.rTPInfo.speed
        })
      } catch (error) {
        clearInterval(timer)
      }
    },
    // 鼠标按下 -- 小车旋转
    handleTurnMouseDown(direction) {
      if (timer) clearInterval(timer)
      this.controlRotateCar(direction, 0)
      timer = setInterval(() => {
        this.controlRotateCar(direction, 0)
      }, 500)
    },
    // 鼠标松开--旋转
    handleTurnMouseUp(direction) {
      clearInterval(timer)
      this.controlRotateCar(direction, 1)
      this.clearPendingFunc()
    },
    // 取消请求中的接口
    clearPendingFunc() {
      //遍历数组中的接口，删除请求
      try {
        window._axiosPromiseArr.forEach((ele, index) => {
          ele.cancel() // 路由跳转之前，清空（终止）上一个页面正在请求的内容
          // 清空请求的参数 清空请求的参数
          delete window._axiosPromiseArr[index]
        })
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@assets/styles/css/canvas.css';
@import '~@assets/styles/css/mapbuilder.css';
* {
  /*ios，如果不行可以加一个透明遮罩层*/
  -webkit-touch-callout: none;
  touch-callout: none;

  /*安卓*/
  -webkit-user-select: none;
  user-select: none;
  /*阻止默认点击出现阴影*/
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  // touch-action: none;
}
.fastAcq {
  padding: 20px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  .left-board-fast {
    height: calc(100vh - 40px);
    @include fb(space-between);
    flex-direction: column;

    .prop-card {
      height: 40%;
      width: 100%;
      ::v-deep {
        .el-form-item {
          margin-bottom: 0;
        }
        .el-card__body {
          height: calc(100% - 39px);
          overflow-y: scroll;
        }
        .el-radio {
          margin-right: 20px;
          &:last-child {
            margin-right: 0;
          }
        }
        .el-input-number {
          width: 100%;
        }
        .mini-input {
          width: 120px;
        }
      }
      .prop-card-body {
        .prop-item {
          @include fb(center);
          .label {
            width: 100px;
            display: inline-block;
            text-align: right;
          }
        }
      }
      .monitoring-body {
        position: relative;
        .contextmenu {
          margin: 0;
          background: #fff;
          z-index: 3000;
          position: fixed;
          list-style-type: none;
          padding: 5px 0;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 400;
          color: #333;
          box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
          li {
            margin: 0;
            padding: 7px 16px;
            cursor: pointer;
          }
        }
      }
    }
    .mapList-card {
      height: 55%;
    }
  }
  .center-board-fast {
    height: calc(100vh - 40px);
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    .action-wrap {
      margin-bottom: -10px;
      button {
        margin-bottom: 10px;
      }
    }
    .canvas {
      width: 100%;
      float: left;
      height: 100%;
      overflow: auto;
      .canvas-body {
        width: 100%;
        // height: 438px;
      }
    }
  }
  .right-board-fast {
    height: calc(100vh - 40px);
    @include fb(space-between);
    flex-direction: column;
    right: 20px;
    top: 20px;
    .action-wrap {
      width: 100%;
    }
    .car-wrap {
      width: 100%;
      .state-body-row {
        font-size: 12px;
        margin-bottom: 5px;
        @include fb(flex-start);
        &:last-child {
          margin-bottom: 0;
        }
        .demonstration {
          width: 50px;
        }
      }
      .control-wrap {
        position: relative;
        margin: 20px auto 0;
        height: 110px;
        width: 110px;
        button {
          position: absolute;
          margin-left: 0;
        }
        .icon-top {
          left: 50%;
          top: 0;
          transform: translateX(-50%);
        }
        .icon-right {
          top: 37px;
          right: 0;
        }
        .icon-bottom {
          left: 50%;
          transform: translateX(-50%);
          bottom: 0;
        }
        .icon-back {
          left: 0;
          top: 37px;
        }
      }
    }

    .speedMode {
      @include fb(center);
      .speedMode-slider {
        width: 60px;
        display: inline-block;
        margin-left: 10px;
      }
      ::v-deep {
        .el-slider__bar {
          background-color: #dfe4ed;
        }
        .el-slider__stop {
          border: 1px solid #dfe4ed;
          width: 8px;
          height: 8px;
        }
        .el-slider__runway {
          height: 8px;
        }
      }
    }
  }
  /** 平板 */
  @media screen and (max-width: 1024px) {
    .prop-card {
      ::v-deep {
        .el-card__header {
          font-size: 15px;
        }
        .el-card__body {
          padding: 10px;
        }
        .el-form-item__label {
          font-size: 12px;
          line-height: 30px;
        }
        .el-form-item__content {
          line-height: 30px;
        }
      }
    }
    .action-wrap {
      ::v-deep {
        .el-card__body {
          @include fb(center, center, column);
          .el-button + .el-button {
            margin-left: 0;
            margin-top: 20px;
          }
        }
      }
    }

    .right-board-fast {
      .car-wrap {
        .state-body-row {
          @include fb(flex-start, center, column);
          .demonstration {
            width: 100%;
          }
        }
        .control-wrap {
          width: 150px;
          height: 150px;
          ::v-deep {
            .el-button--medium.is-circle {
              padding: 20px;
            }
          }
          .icon-right {
            top: 47px;
            right: 0;
          }
          .icon-bottom {
            bottom: 0;
          }
          .icon-back {
            top: 47px;
          }
        }
      }
    }
  }
  .no_touch {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
}
</style>