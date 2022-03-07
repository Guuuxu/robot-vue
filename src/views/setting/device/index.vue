<template>
  <div class="device app-container" ref="midCard">
    <el-row class="device-row" :gutter="10">
      <el-col :span="5" class="monitoring-col">
        <el-card class="monitoring-card">
          <div slot="header" class="clearfix">
            <span>测点列表</span>
          </div>
          <div class="monitoring-body custom-scrollbar" ref="monitoring" :style="{ height: monitoringHeight }">
            <el-switch v-model="checkStrictly"></el-switch>
            <span class="switch-text ml10">{{ !checkStrictly ? "开启" : "关闭" }}子目录全选功能</span>
            <el-tree
              :data="cabinetOptions"
              ref="tree"
              :props="defaultProps"
              class="mt10"
              show-checkbox
              highlight-current
              :expand-on-click-node="false"
              :check-strictly="!checkStrictly"
              :render-content="renderContent"
              @check="handleCheck"
              @check-change="checkChange"
              @node-click="handleNodeClick"
              @node-contextmenu="handleNodeRightClick"
            />
            <!-- 右击柜体对话框 -->
            <ul v-show="isShowMenu" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
              <li>
                <el-button type="primary" size="mini" @click="editSelectedDevice()">编辑</el-button>
              </li>
              <li>
                <el-button type="primary" size="mini" @click="handleDeleteDevice('single')">删除</el-button>
              </li>
              <li v-show="currentObj.sensorLevel === '1'">
                <el-button type="primary" size="mini" @click="navigateToSelectedDevice()">导航</el-button>
              </li>
            </ul>
          </div>
          <div class="monitoring-footer" ref="monitoringFooter">
            <el-button class="monitoring-add-btn" type="primary" size="mini" icon="el-icon-plus" @click="handleAdd">新建柜体</el-button>
            <el-button class="monitoring-add-btn" type="info" size="mini" icon="el-icon-upload2" @click="handleUploadSensor">模板导入</el-button>
            <el-button class="monitoring-add-btn" type="warning" size="mini" icon="el-icon-download" @click="handleDownloadSensor">测点导出</el-button>
            <el-button class="monitoring-add-btn" type="warning" size="mini" icon="el-icon-download" @click="handleDownload">图片下载</el-button>
            <el-button
              class="monitoring-add-btn"
              type="danger"
              size="mini"
              icon="el-icon-delete"
              :disabled="!checkedNodes.length"
              @click="handleDeleteDevice('multi')"
            >删除</el-button>
          </div>
        </el-card>
      </el-col>
      <!-- 中间 -->
      <el-col :span="10" class="middle-col">
        <middle-card
          ref="middleCard"
          :isAbort.sync="isAbort"
          :checkedNodes.sync="checkedNodes"
          @onUpdateTaskStatus="updateTaskStatus"
          @onPostSecondStatus="getSecondStatus"
        />
      </el-col>
      <!-- 右边 -->
      <el-col :span="9" class="middle-col">
        <right-card
          ref="rightCard"
          :visibleVideo.sync="visibleVideo"
          :checkedNodes.sync="checkedNodes"
          @onPostFirstStatus="getFirstStatus"
        />
      </el-col>
    </el-row>
    <!-- 添加、编辑柜体弹窗 -->
    <add-or-update-cabinet-dialog :title="title" :isVisible.sync="isShowAddCabinet" :row.sync="detail" @onUpdate="updateList" />
    <!-- 新增、编辑测点对话框 -->
    <add-or-update-sensor-dialog
      :title="sensorTitle"
      :isVisible.sync="isShowAddSensor"
      :visibleVideo.sync="visibleVideo"
      :row.sync="detail"
      :firstStatus.sync="firstStatus"
      :secondStatus.sync="secondStatus"
      @onUpdate="updateList"
    />
    <!-- 新增、编辑组合测点对话框 -->
    <add-or-update-group-sensor-dialog
      :title="sensorTitle"
      :isVisible.sync="isShowGroupSensor"
      :visibleVideo.sync="visibleVideo"
      :row.sync="detail"
      :firstStatus.sync="firstStatus"
      :secondStatus.sync="secondStatus"
      :parentData="parentData"
      @onUpdate="updateList"
    />
    <!-- 用户导入对话框 -->
    <upload-sensor-dialog :isVisible.sync="isShowUpload" />
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import AddOrUpdateCabinetDialog from './components/AddOrUpdateCabinetDialog'
import MiddleCard from './components/MiddleCard'
import RightCard from './components/RightCard'
import UploadSensorDialog from './components/UploadSensorDialog'
import AddOrUpdateSensorDialog from './components/AddOrUpdateSensorDialog'
import AddOrUpdateGroupSensorDialog from './components/AddOrUpdateGroupSensorDialog'
import { downLoadZip } from '@/utils/zipdownload'
import { getTaskStatus } from '@/api/inspect'
import { getSensorDetail, getParentSensorDetail, getSensorDelete, getSensorExport, navigationToSensor } from '@/api/setting/sensor'
import { getLightCameraQuery, getRobotToPosition } from '@/api/setting/device/control'
import { getDeviceTreeList, getDeviceDetail, deleteDevice } from '@/api/setting/device'

export default {
  name: 'Device',
  components: {
    AddOrUpdateCabinetDialog,
    MiddleCard,
    RightCard,
    AddOrUpdateSensorDialog,
    AddOrUpdateGroupSensorDialog,
    UploadSensorDialog
  },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 测点树选项
      cabinetOptions: undefined,
      checkStrictly: 0,
      title: '',
      isShowAddCabinet: false,
      isShowMenu: false,
      left: 0,
      top: 0,
      detail: {},
      currentDeviceId: 0,
      currentObj: {}, // 当前节点所对应的对象
      isShowAddSensor: false,
      isShowGroupSensor: false,
      isShowUpload: false,
      sensorTitle: '',
      currentStatus: {}, // 机器人当前状态
      robotStatus: {}, // 传值到弹出框
      row: {},
      parentData: {}, // 新增测点父级数据
      firstStatus: {}, // 全景图参数信息
      secondStatus: {}, // 设备抓图参数信息
      visibleVideo: true, // 视频显示状态
      monitoringHeight: 0, //测点树高度
      ids: [], // 选中id数组
      sensorLevels: [], // 选中数组层级
      checkedNodes: [], //当前勾选的测点
      isAbort: false // 是否中断请求
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
  created() {
    this.loadDeviceTreeList()
  },
  mounted() {},
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.isAbort = false
    })
  },
  beforeRouteLeave(to, from, next) {
    this.isAbort = true
    this.$nextTick(() => {
      next()
    }, 100)
  },
  methods: {
    async loadDeviceTreeList() {
      const res = await getDeviceTreeList()
      this.cabinetOptions = res.data
      this.monitoringHeight = this.$refs?.midCard?.clientHeight - 40 - 114 - 30 - 10 - this.$refs?.monitoringFooter?.clientHeight + 'px'
    },
    // 勾选操作
    async handleCheck(data, Obj) {
      this.ids = []
      this.sensorLevels = []
      if (Obj.checkedNodes.length) {
        for (const key in Obj.checkedNodes) {
          if (Obj.checkedNodes[key].sensorLevel === '0') {
            if (!Obj.checkedNodes[key].children.length) {
              this.sensorLevels.push(0)
              this.ids.push(Obj.checkedNodes[key].id)
            }
          } else if (Obj.checkedNodes[key].sensorLevel === '1') {
            if (!Obj.checkedNodes[key].children.length) {
              this.sensorLevels.push(1)
              this.ids.push(Obj.checkedNodes[key].id)
            }
          } else {
            this.sensorLevels.push(2)
            this.ids.push(Obj.checkedNodes[key].id)
          }
        }
      }
      this.checkedNodes = Obj.checkedNodes
    },
    // 勾选改变
    async checkChange(obj, check, node) {
      if (obj.sensorLevel === '1' && check) {
        // 组测点
        const res = await getParentSensorDetail(obj.id)
        //显示已选全景图
        const relativeImgUrl = '/profile' + res.data.rspdi.imageUrl.split('profile')[1]
        this.$refs.middleCard.setOverImgPath(res.data.rspdi.imageUrl, relativeImgUrl)
        this.$refs.rightCard.setOverImgPath(res.data.rspdi.ovImageUrl)
      }
    },
    renderContent(h, { node, data, store }) {
      if (data.sensorLevel === '2') {
        return (
          <span class="el-tree-node__label custom-tree">
            <span class="is-collected">{node.label}</span>
          </span>
        )
      } else {
        if (data.isCollected == 1) {
          return (
            <span class="el-tree-node__label ">
              <span class="is-collected">{node.label}</span>
            </span>
          )
        } else {
          return (
            <span class="el-tree-node__label custom-tree">
              <span class="is-collected2">{node.label}</span>
            </span>
          )
        }
      }
    },
    // 点击节点操作
    handleNodeClick(obj, Node, comp) {
      this.isShowMenu = false
      this.parentData = obj.pid === '0' ? obj : {}
    },
    // 右击操作
    handleNodeRightClick(e, obj, node) {
      this.isShowMenu = true
      this.left = this.$refs.monitoring.clientWidth
      this.top = e.clientY
      this.currentDeviceId = obj.id
      this.currentObj = obj
      console.log(obj)
    },
    // 关闭右键菜单
    closeMenu() {
      this.isShowMenu = false
    },
    // 新增柜机操作
    handleAdd() {
      this.reset()
      this.title = '新增柜体'
      this.isShowAddCabinet = true
    },
    // 获取机器人状态信息
    updateTaskStatus(status) {
      this.currentStatus = status
    },
    getFirstStatus(status) {
      this.firstStatus = {
        ...status,
        steelNo: this.currentStatus.steelNo, //全景图编码

        steelOffset: this.currentStatus.offset, //全景图偏移量

        leftUdangle: this.currentStatus.leftAngle, //全景图左俯仰角度

        rightUdangle: this.currentStatus.rightAngle, //全景图右俯仰角度

        liftHeight: this.currentStatus.height, //全景图升降高度

        rotationAngle: this.currentStatus.bodyAngle //全景图旋转角度
      }
    },
    getSecondStatus(status) {
      this.secondStatus = {
        ...status,
        steelNo: this.currentStatus.steelNo, //编码

        steelOffset: this.currentStatus.offset, //偏移量

        leftUdangle: this.currentStatus.leftAngle, //左俯仰角度

        rightUdangle: this.currentStatus.rightAngle, //右俯仰角度

        liftHeight: this.currentStatus.height, //升降高度

        rotationAngle: this.currentStatus.bodyAngle //旋转角度
      }
    },
    // 新增测点操作
    async handleAddSensor() {
      this.reset()
      if (!this.parentData?.id) {
        this.$message.warning('请选择机柜！')
        return
      }
      if (!this.firstStatus.ovImageUrl) {
        this.$confirm('确认不需要二次对焦吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const res = await getLightCameraQuery()
          const resTask = await getTaskStatus()
          this.secondStatus.zoomVal = res.data.zoomVal
          this.secondStatus.focusVal = res.data.focusVal
          this.secondStatus.exposureVal = res.data.exposureVal
          this.secondStatus.focusMode = res.data.focusMode
          this.secondStatus = {
            ...this.secondStatus,
            steelNo: resTask.data.steelNo, //编码

            steelOffset: resTask.data.offset, //偏移量

            leftUdangle: resTask.data.leftAngle, //左俯仰角度

            rightUdangle: resTask.data.rightAngle, //右俯仰角度

            liftHeight: resTask.data.height, //升降高度

            rotationAngle: resTask.data.bodyAngle //旋转角度
            // imageUrl: require("@/assets/image/device/deletion.jpg")
          }
          this.sensorTitle = '新增测点'
          this.isShowAddSensor = true
          this.visibleVideo = false
        })
      } else {
        const res = await getLightCameraQuery()
        this.secondStatus.zoomVal = res.data.zoomVal
        this.secondStatus.focusVal = res.data.focusVal
        this.secondStatus.exposureVal = res.data.exposureVal
        this.secondStatus.focusMode = res.data.focusMode
        this.sensorTitle = '新增测点'
        this.isShowAddSensor = true
        this.visibleVideo = false
      }
    },
    // 编辑操作
    async editSelectedDevice() {
      this.reset()
      // 机柜
      if (this.currentObj.sensorLevel === '0') {
        const res = await getDeviceDetail(this.currentObj.id)
        this.detail = res.data
        this.isShowAddCabinet = true
        this.title = '编辑柜体'
      } else if (this.currentObj.sensorLevel === '1') {
        // 组测点
        const res = await getParentSensorDetail(this.currentObj.id)
        this.detail = res.data
        this.isShowGroupSensor = true
        this.sensorTitle = '编辑二级测点'
        this.visibleVideo = false
      } else {
        // 测点
        const res = await getSensorDetail(this.currentObj.id)
        this.detail = res.data
        this.sensorTitle = '编辑测点'
        this.isShowAddSensor = true
        this.visibleVideo = false
      }
    },
    // 导航去地图点
    async navigateToSelectedDevice() {
      await navigationToSensor(this.currentObj.deviceId)
    },
    /** 下载操作 */
    handleDownload(row) {
      downLoadZip('/robot/upload/downloadBatch')
    },
    // 删除操作
    handleDeleteDevice(type) {
      const label = type === 'single' ? `是否确认删除"${this.currentObj.label}"柜体` : '是否确认删除'
      this.$confirm(label, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async (resolve, reject) => {
          if (type === 'single') {
            if (!this.currentObj.children.length) {
              const sensorLevels = this.currentObj.sensorLevel
              await deleteDevice(this.currentObj.id, sensorLevels)
            } else {
              this.$myMessage.warning('请先删除子目录！')
              reject()
            }
          } else {
            if (!this.ids.length) {
              this.$myMessage.warning('请勾选测点！')
              reject()
            }
            const ids = this.ids.join(',')
            const sensorLevels = this.sensorLevels.join(',')
            await deleteDevice(ids, sensorLevels)
          }
        })
        .then(() => {
          this.updateList()
          this.msgSuccess('删除成功')
          this.currentObj = {}
          this.ids = []
        })
        .catch(() => {
          console.log('error')
        })
    },
    // 导入
    handleUploadSensor() {
      this.isShowUpload = true
    },
    // 测点导出
    async handleDownloadSensor() {
      const res = await getSensorExport()
      this.download(res.msg)
    },
    updateList() {
      this.loadDeviceTreeList()
      this.secondStatus = {}
    },
    // 表单重置
    reset() {
      this.detail = {}
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep {
  .is-collected {
    color: #1890ff;
  }
  .is-collected2 {
    color: #fa541c;
  }
}
.device {
  min-height: calc(100vh - 84px);
  .device-row {
    height: 100%;
    min-height: calc(100vh - 124px);
    .monitoring-col {
      min-height: calc(100vh - 124px);
      position: relative;
    }
    .monitoring-card {
      min-height: calc(100vh - 124px);
      ::v-deep .el-card__body {
        padding: 15px;
      }
      .monitoring-body {
        position: relative;
        margin-bottom: 10px;
        overflow-y: auto;
        ::v-deep .el-tree-node__content {
          height: auto;
          & > .el-tree-node__expand-icon {
            padding: 4px;
          }
          .el-tree-node__label {
            font-size: 12px;
          }
        }
        .switch-text {
          font-size: 13px;
          color: #909399;
        }
      }
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
      .monitoring-footer {
        position: absolute;
        padding: 0 15px;
        bottom: 30px;
        left: 0;
        right: 0;
        margin-bottom: -10px;
        @include fb(flex-start, center, column);
        flex-wrap: wrap;
        .monitoring-add-btn {
          margin-bottom: 10px;
          margin-left: 0;
        }
      }
    }
  }
  ::v-deep .el-card {
    overflow: auto;
  }
}
</style>
