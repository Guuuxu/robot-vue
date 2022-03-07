<template>
  <div class="app-container home">
    <el-row :gutter="20" class="home-row">
      <el-col :xs="24" :sm="5" :md="5" :lg="5">
        <el-card class="robot-setting" shadow="hover">
          <div slot="header" class="clearfix">
            <span>机器人功能设置</span>
          </div>
          <div class="robot-setting-body">
            <div class="setting-wrap">
              <span>急停</span>
              <el-switch v-model="isStopFlag" active-value="1" inactive-value="0" @change="changeStopSetting"></el-switch>
            </div>
            <div class="setting-wrap">
              <span>避障</span>
              <el-switch
                v-model="rTPInfo.coreLeftObstacleFlag"
                inactive-value="0"
                active-value="1"
                @change="HandleRobotObstacleControlLeft"
              ></el-switch>
            </div>
            <!-- <div class="setting-wrap speedMode">
              <span>速度</span>
              <el-slider
                class="speedMode-slider"
                v-model="rTPInfo.speedMode"
                :step="1"
                :max="2"
                height="8px"
                show-stops
                :show-tooltip="false"
                :marks="marks"
                @change="handleSetSpeedMode"
              >
              </el-slider>
            </div>-->
            <div class="setting-wrap">
              <span>灯光</span>
              <el-switch v-model="rTPInfo.autoDarkLightSet" inactive-value="0" active-value="1" @change="HandleAutoDarkLight"></el-switch>
            </div>
            <div class="setting-wrap">
              <span>雨刷</span>
              <el-switch v-model="rTPInfo.isWiperOn" inactive-value="0" active-value="1" @change="HandleWiper"></el-switch>
            </div>
            <div class="setting-wrap">
              <!-- <span>导航</span>
              <el-switch
                v-model="rTPInfo.nav_status"
                inactive-value="0"
                active-value="1"
                @change="handleNavigate"
              >
              </el-switch>-->
            </div>
          </div>
        </el-card>
        <el-card class="robot-action" shadow="hover">
          <div class="body">
            <el-popconfirm class="pop-inspect" title="确定执行全站巡检吗？" @confirm="handleAllSpection">
              <el-button
                class="action-btn"
                slot="reference"
                :disabled="
                  taskStatus === '1' || taskStatus === '3' ? true : false
                "
              >
                <i class="icon-inspect-all-gray" v-if="taskStatus === '1' || taskStatus === '3'"></i>
                <i class="icon-inspect-all" v-else></i>
                <span class="ml5">全站巡检</span>
                <i
                  v-show="
                    taskName === '全站巡检' &&
                      taskStatus !== '4' &&
                      taskStatus !== '2'
                  "
                  class="el-icon-success el-icon--right"
                ></i>
              </el-button>
            </el-popconfirm>

            <el-button
              class="action-btn"
              :disabled="
                taskStatus === '1' || taskStatus === '3' ? true : false
              "
              @click="handleSpection('2', '定点巡检')"
            >
              <svg-icon icon-class="icon-inspect-point" class-name="card-panel-icon" />
              <span class="ml5">定点巡检</span>
              <i
                v-show="
                  taskName === '定点巡检' &&
                    taskStatus !== '4' &&
                    taskStatus !== '2'
                "
                class="el-icon-success el-icon--right"
              ></i>
            </el-button>
            <!-- <el-button
              class="action-btn"
              :disabled="taskStatus == '1' || taskStatus === '3' ? true : false"
              @click="handleSpection('3', '定制巡检')"
            >
              <svg-icon icon-class="icon-inspect" class-name="card-panel-icon" />
              <span class="ml5">定制巡检</span>
              <i
                v-show="
                  taskName === '定制巡检' &&
                    taskStatus !== '4' &&
                    taskStatus !== '2'
                "
                class="el-icon-success el-icon--right"
              ></i>
            </el-button>-->
            <el-button class="action-btn" @click="handlePauseMission(1)" v-show="taskStatus === '1'">
              <svg-icon icon-class="icon-pause"></svg-icon>
              <span class="ml5">暂停任务</span>
            </el-button>
            <el-button v-show="taskStatus === '3'" class="action-btn" @click="handlePauseMission(0)">
              <svg-icon icon-class="icon-inspect-start" />
              <span class="ml5">开始任务</span>
            </el-button>
            <el-button class="action-btn" @click="handleBreakMission">
              <svg-icon icon-class="icon-inspect-stop" />
              <span class="ml5">终止任务</span>
            </el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="13" :md="13" :lg="13">
        <el-card class="site-plan" shadow="hover">
          <div slot="header" class="clearfix">
            <span>站所平面图</span>
          </div>
          <div class="site-plan-body" ref="siteBody">
            <div ref="site-top">
              <div id="inspectionMap" class="station-content">
                <canvas id="canvas" ref="canvas" width="100" height="100" @dblclick="handleDblclick">您的浏览器不支持 canvas 标签</canvas>
              </div>
              <div class="task-wrap mt10">
                当前任务状态:
                <b>{{ taskStatusName }}</b>
                <el-progress :text-inside="true" :stroke-width="16" :percentage="taskPercent" class="task-progress"></el-progress>
              </div>

              <el-divider></el-divider>
            </div>
            <el-table highlight-current-row :data="taskList" class="task-table" :height="tbHeight" style="z-index:99">
              <el-table-column label="序号" type="index" align="center" prop="index" width="50" />
              <el-table-column label="设备名称" align="center" prop="deviceName" />
              <el-table-column label="检测内容" align="center" prop="sensorName" :show-overflow-tooltip="true" />
              <el-table-column label="结果" align="center" prop="result" />
              <el-table-column label="巡检结果" align="center" prop="judgment" />
              <el-table-column label="巡检时间" align="center" prop="checkTime" width="155" />
              <el-table-column label="状态" align="center" prop="status" width="70" />
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <el-card class="robot-video" shadow="hover">
          <div slot="header" class="clearfix">
            <span>机器人视频</span>
          </div>
          <div class="robot-video-body">
            <!-- 可见光 -->
            <!-- <h-k-v /> -->
            <iframe id="dialogFrame" frameborder="0" scrolling="no" class="hk-iframe" :src="hkvLightSrc"></iframe>
          </div>
        </el-card>
        <el-card class="robot-video device-wrap" shadow="hover">
          <div slot="header" class="clearfix">
            <span>红外视频</span>
          </div>
          <div class="robot-video-body">
            <iframe id="hkRedFrame" frameborder="0" scrolling="no" class="hk-iframe" :src="hkvSrc"></iframe>
            <!-- <iframe id="dialogFrame" frameborder="0" scrolling="no" class="hk-iframe" src="/hkvRed"></iframe> -->
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 选择定点、定制巡检对话框 -->
    <select-sensor-dialog
      ref="selectSensorDialog"
      :title="title"
      :taskActionFlag.sync="taskActionFlag"
      :isVisible.sync="isVisibleSelectSensorDialog"
      @onUpdate="startTaskStatus"
    />
    <!-- 站所平面图预览 -->
    <view-site-plan ref="viewSitePlan" :z-index="2000" v-if="showViewer" :coordinate.sync="coordinate" :on-close="closeViewer" />
  </div>
</template>

<script>
import { getTaskStatus, startStationTask } from '@/api/inspect'
import { getRobotMapData } from '@/api/map'
import {
  stopFlagControl,
  getRobotObstacleControl,
  speedModeControl,
  robotLightOffOnControl,
  robotWiperControl
} from '@/api/setting/device/control'
import SelectSensorDialog from './components/SelectSensorDialog'
import MapDrawer from '@/plugins/map-drawer/js/mapdrawer'
import paintRos from '@/plugins/map-ros'
// import HKV from '../setting/device/components/HKV'
import ViewSitePlan from './components/ViewSitePlan'
export default {
  components: { SelectSensorDialog, ViewSitePlan },
  name: 'inspect',
  data() {
    return {
      value1: 0,
      marks: {
        0: '低',
        1: '中',
        2: '高'
      },
      isStopFlag: '0',
      taskList: [],
      rTPInfo: {
        coreRightObstacleFlag: '',
        coreBelowObstacleFlag: ''
      }, // 功能设置信息
      taskOption: [],
      isdisabled: false,
      taskStatus: '', //当前任务状态 1进行中 2异常 3暂停 4完成
      taskName: '', //当前任务巡检名称
      taskStatusName: '',
      taskPercent: 0, // 任务完成百分比
      isVisibleSelectSensorDialog: false,
      title: '',
      taskActionFlag: '', // 任务执行那个动作标记
      mapDrawer: null,
      hkvLightSrc: '/video.html?hkvType=0',
      hkvSrc: '/video.html?hkvType=1',
      tbHeight: 250, // 任务表格高度
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        fileName: undefined,
        fileType: 2
      },
      showViewer: false,
      coordinate: {
        xCoordinate: '',
        yCoordinate: ''
      },
      isAbort: false,
      objectHIK: {
        szIP: '10.9.162.188',
        szPort: '80',
        szUsername: 'admin',
        szPassword: 'Admin123',
        iStreamType: 1,
        iWndIndex: 0,
        iChannelID: 1
      },
      realPlayGroup: [] // 预览成功的摄像头
    }
  },
  watch: {
    taskStatus(val) {
      if (val == '3') {
        this.isStopFlag = '1'
      } else {
        this.isStopFlag = '0'
      }
      this.taskStatusName = this.taskOption.length && this.taskOption.find(t => t.dictValue == val).dictLabel
    }
  },
  activated() {
    $('.station-content').css({
      width: this.$refs.siteBody.clientWidth - 9 + 'px'
    })
    this.$nextTick(() => {
      this.tbHeight = this.$refs.siteBody.clientHeight - this.$refs['site-top'].clientHeight - 24
    })
    this.init()
    this.$nextTick(() => {
      this.$refs?.hVP?.clickInitPlugin(1)
    })
  },
  created() {
    this.loadDicts()
  },
  mounted() {
    // $('.station-content').css({
    //   width: this.$refs.siteBody.clientWidth - 9 + 'px'
    // })
    // this.$nextTick(() => {
    //   this.tbHeight = this.$refs.siteBody.clientHeight - this.$refs['site-top'].clientHeight - 24
    // })
    // this.init()
  },
  methods: {
    init() {
      Promise.all([paintRos.load(), paintRos.loadDocumentList($('#inspectionMap'), true)]).then(() => {
        this.loadMapDrawer()
        this.fetchTaskStatus()
      })
      // paintRos.load()
      // paintRos.loadDocumentList($('#inspectionMap'), true)
      // setTimeout(() => {
      //   this.loadMapDrawer()
      // }, 1500)
    },
    loadMapDrawer() {
      var mapDrawer = null
      mapDrawer = new MapDrawer()
      mapDrawer.bindToHasDiv($('#inspectionMap'))
      mapDrawer.loadStationMapInfo()
      this.mapDrawer = mapDrawer
    },
    async loadDicts() {
      const res = await this.getDicts('robot_task_status')
      this.taskOption = res.data
    },
    // 实时状态
    async fetchTaskStatus() {
      try {
        const res = await getTaskStatus()

        this.taskList = res.data.modelList
        this.rTPInfo = res.data.rTPInfo
        this.rTPInfo.speedMode = +this.rTPInfo.speedMode
        this.taskStatus = res.data.taskStatus
        this.taskPercent = res.data.taskPercent
        this.taskName = res.data.taskName
        // 实时坐标
        this.coordinate.xCoordinate = res.data.posX
        this.coordinate.yCoordinate = res.data.posY
        if (!this.mapDrawer?.pathNodes?.length) {
          this.mapDrawer.showRobotStatus(false)
        } else {
          this.mapDrawer.showRobotStatus(true, this.coordinate)
        }
        // 巡检完成
        if (res.data.taskStatus !== '4' || res.data.taskStatus !== '2') {
          // 请求是否中断
          if (!this.isAbort) {
            // 请求完成5s后再执行
            setTimeout(() => {
              this.fetchTaskStatus()
            }, 5000)
          }
        }
      } catch (error) {}
    },
    showRobotStatus() {
      if (!this.mapDrawer?.pathNodes?.length) {
        this.mapDrawer.showRobotStatus(false)
      } else {
        this.mapDrawer.showRobotStatus(true, coordinate)
      }
    },
    // 获取平面图
    async loadRobotMapData() {
      await getRobotMapData()
    },
    // 急停操作
    changeStopSetting(value) {
      this.handlePauseMission(value)
    },
    // 左避障操作
    HandleRobotObstacleControlLeft(value) {
      this.handleRobotObstacleControl(value, 0)
    },
    // 右避障操作
    HandleRobotObstacleControlRight(value) {
      this.handleRobotObstacleControl(value, 1)
    },
    // 下避障操作
    HandleRobotObstacleControlBottom(value) {
      this.handleRobotObstacleControl(value, 2)
    },
    // 避障处理
    async handleRobotObstacleControl(obstacleOpenFlag, obstacleType) {
      await getRobotObstacleControl({ obstacleOpenFlag, obstacleType })
      if (obstacleOpenFlag === '1') {
        this.msgSuccess('已开启')
      } else {
        this.msgSuccess('已关闭')
      }
    },
    // 速度控制
    async handleSetSpeedMode(speedMode) {
      await speedModeControl(speedMode)
      this.msgSuccess('设置成功')
    },
    // 灯光开启关闭
    async HandleAutoDarkLight(value) {
      await robotLightOffOnControl(value)
    },
    // 雨刷设置
    async HandleWiper(value) {
      await robotWiperControl(value)
    },

    // 全站巡检操作
    async handleAllSpection() {
      await startStationTask({
        list: '',
        taskType: 1
      })
      this.taskStatus = '1'
      this.fetchTaskStatus()
    },
    // 定点巡检
    handleSpection(type, title) {
      this.isVisibleSelectSensorDialog = true
      this.title = title
      this.$refs.selectSensorDialog && this.$refs['selectSensorDialog'].handleSetSpectionType(type)
    },
    // 机器人启停
    async handlePauseMission(stopFlag) {
      try {
        await stopFlagControl(stopFlag)
        this.isStopFlag = stopFlag
        if (stopFlag == '1') {
          this.fetchTaskStatus()
          this.isAbort = true
          this.msgSuccess('已暂停')
        } else {
          this.fetchTaskStatus()
          this.msgSuccess('已关闭')
        }
      } catch (error) {
        if (stopFlag) {
          this.isStopFlag = 0
        } else {
          this.isStopFlag = 1
        }
      }
    },
    // 终止任务
    async handleBreakMission() {
      await stopFlagControl(2)
      this.msgSuccess('已终止')
      this.fetchTaskStatus()
      this.isAbort = true
    },
    // 双击平面图
    handleDblclick() {
      this.showViewer = true
      console.log(this.$refs.canvas.clientWidth)
    },
    closeViewer() {
      this.showViewer = false
    },
    // 从子组件接收预览成功的摄像头信息
    pvS(IPS) {
      this.realPlayGroup[this.realPlayGroup.length] = IPS
      console.log('realPlayGroup:' + JSON.stringify(this.realPlayGroup))
    },
    // 预览
    test() {
      const objectAbc = Object.assign({}, this.objectHIK)
      console.log('objectAbc.iWndIndex:' + objectAbc.iWndIndex)
      this.$refs.hVP.clickLogin(objectAbc)
    },
    stopRealPlay() {
      for (const camera of this.realPlayGroup) {
        this.$refs.hVP.clickStopRealPlay(camera)
      }
    },
    startTaskStatus() {
      this.fetchTaskStatus()
    }
  },

  beforeDestroy() {
    this.stopRealPlay()
  },
  //注销
  destroyed() {
    console.log('mmmmm')
    this.isAbort = true
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.isAbort = false
    })
  },
  beforeRouteLeave(to, from, next) {
    this.isAbort = true
    this.stopRealPlay()
    this.$nextTick(() => {
      next()
    }, 100)
  }
}
</script>

<style scoped lang="scss">
@import url('~@/plugins/map-drawer/css/mapdrawer.css');
.home {
  height: calc(100vh - 84px);
  .home-row {
    height: 100%;
    .el-col {
      height: 100%;
    }
  }
  ::v-deep {
    .el-icon-my-pause {
      background: url('~@assets/image/index/pause.png') center no-repeat;
      /* background-size: cover;*/
    }
    .el-icon-my-break {
      background: url('~@assets/image/index/break.png') center no-repeat;
    }
    .el-icon-my-clear {
      background: url('~@assets/image/index/clear.png') center no-repeat;
    }
    .el-icon-my-pause:before,
    .el-icon-my-break:before {
      content: ' ';
      font-size: 16px;
      visibility: hidden;
    }
    .el-icon-my-break:before {
      font-size: 14px;
    }
    .el-icon-my-pause {
      font-size: 16px;
    }
    .el-icon-my-break {
      font-size: 15px;
    }
    .el-icon-my-clear {
      font-size: 14px;
    }
    .el-icon-my-pause:before,
    .el-icon-my-break::before,
    .el-icon-my-clear::before {
      content: '\e611';
    }
    .action-btn {
      width: 140px;
      & > span {
        i {
          display: inline-block;
          width: 14px;
          height: 14px;
        }
        @include fb(center);
        .icon-inspect-all {
          background: url('~@assets/image/inspect/icon-inspect-all.png') center no-repeat;
          background-size: contain;
        }
        .icon-inspect-all-gray {
          background: url('~@assets/image/inspect/icon-inspect-all-gray.png') center no-repeat;
          background-size: contain;
        }
      }
    }
    .el-button.is-disabled .gray {
      color: #c0c4cc;
    }
  }
  .robot-setting {
    .robot-setting-body {
      display: table;
      margin: auto;
      .setting-wrap {
        margin-bottom: 10px;
        &:last-child {
          margin-bottom: 0;
        }
        & > span {
          margin-right: 10px;
          text-align: right;
          // width: 60px;
          display: inline-block;
        }
      }
      .speedMode {
        @include fb(center);
        .speedMode-slider {
          width: 90px;
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
  }
  .robot-action {
    margin-top: 20px;
    @include fb(center, center, column);
    .body {
      @include fb(center, center, column);
      .pop-inspect {
        margin-bottom: 10px;
      }
      .icon-inspect-all {
        color: #ffffff;
      }
      .el-icon-success {
        color: $green;
      }
      ::v-deep {
        .el-button + .el-button {
          margin-left: 0;
        }
        .el-button {
          margin-bottom: 10px;
          &:last-child {
            margin-bottom: 0px;
          }
        }
      }
    }
  }
  .site-plan {
    height: 100%;
    ::v-deep .el-card__body {
      height: calc(100% - 35px);
    }
    .site-plan-body {
      height: 100%;
      .station-content {
        height: 200px;
        overflow: auto;
        max-width: 549px;
      }
      .task-wrap {
        @include fb();
        b {
          margin: 0 20px;
        }
        .task-progress {
          flex: 1;
          ::v-deep {
            .el-progress-bar__inner {
              @include fb(flex-end);
            }
          }
        }
      }
    }
  }
  .robot-video {
    .robot-video-body {
      width: 100%;
      height: 160px;
    }
    .hk-iframe {
      width: 100%;
      height: 100%;
    }
  }
  .device-wrap {
    margin-top: 20px;
  }
}
</style>
