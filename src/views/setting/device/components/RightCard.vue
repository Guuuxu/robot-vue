<template>
  <div>
    <el-card class="right-card">
      <div class="right-tab">
        <span :class="{ active: tab === '0' }" @click="tabClick('0')">可见光视角</span>
        <el-divider direction="vertical"></el-divider>
        <span :class="{ active: tab === '1' }" @click="tabClick('1')">红外视角</span>
      </div>
      <div class="camera-wrap" ref="cameraWrap">
        <iframe id="dialogFrame" frameborder="0" scrolling="no" class="hk-iframe" :src="hkvSrc" :style="{ height: hkvHeight + 'px' }"></iframe>
        <!-- <h-k-v :tab.sync="tab" v-show="visibleVideo" /> -->
        <!-- <h-k-red-v v-show="tab === '1'" ref="HKRedV" /> -->
      </div>

      <div label="可见光视角" name="light" v-if="tab === '0'">
        <div class="camera-action">
          <div>
            <el-button
              type="primary"
              size="mini"
              @click="handleTakePhoto(1)"
              :disabled="checkedNodes.length != 1 || checkedNodes[0].sensorLevel !== '1'"
            >全景图抓图</el-button>
            <!-- <el-button
              type="primary"
              size="mini"
              @click="handleDeviceTakePhoto"
              :disabled="
                checkedNodes.length != 1 ||
                  (checkedNodes[0] && checkedNodes[0].sensorLevel !== '1')
              "
            >设备抓图</el-button>-->
          </div>
        </div>
        <div class="light-ctrl">
          <h4>可见光相机控制</h4>
          <el-form label-width="80px" labelPosition="right" class="light-ctrl-form">
            <el-form-item label="倍率" prop="zoomVal">
              <el-popover v-model="visible" trigger="manual" width="160">
                <p>确定更改倍率吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="visible = false">取消</el-button>
                  <el-button type="primary" size="mini" @click="confirmZoomVal">确定</el-button>
                </div>

                <el-input-number
                  class="common"
                  v-model="zoomVal"
                  size="mini"
                  :min="0"
                  :max="32"
                  :controls="false"
                  :precision="2"
                  slot="reference"
                  @input="numberChange(arguments[0], 32)"
                  @change="changeZoomVal"
                ></el-input-number>
                <!-- <el-input
                  v-model="zoomVal"
                  size="mini"
                  min="0"
                  max="32"
                  @input="numberChange(arguments[0], 32)"
                  class="common"
                  slot="reference"
                  @change="changeZoomVal"
                ></el-input>-->
              </el-popover>
              <el-button
                class="icon-minus"
                icon="el-icon-minus"
                type="primary"
                circle
                size="mini"
                @mousedown.native="handlePlusLightControl(0, 0, 0)"
                @mouseup.native="handleMinusLightControl(0, 0, 1)"
              ></el-button>
              <el-button
                icon="el-icon-plus"
                type="primary"
                circle
                size="mini"
                @mousedown.native="handlePlusLightControl(0, 1, 0)"
                @mouseup.native="handleMinusLightControl(0, 1, 1)"
              ></el-button>
            </el-form-item>
            <el-form-item label="焦距">
              <el-popover v-model="visibleFocus" trigger="manual" width="160">
                <p>确定更改焦距吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="visibleFocus = false">取消</el-button>
                  <el-button type="primary" size="mini" @click="confirmFocusVal">确定</el-button>
                </div>
                <el-input v-model="focusVal" :min="0" size="mini" class="common" slot="reference" @change="changeFocusVal"></el-input>
              </el-popover>
              <el-button
                class="icon-minus"
                icon="el-icon-minus"
                type="primary"
                circle
                size="mini"
                @mousedown.native="handlePlusLightControl(1, 0, 0)"
                @mouseup.native="handleMinusLightControl(1, 0, 1)"
              ></el-button>
              <el-button
                icon="el-icon-plus"
                type="primary"
                circle
                size="mini"
                @mousedown.native="handlePlusLightControl(1, 1, 0)"
                @mouseup.native="handleMinusLightControl(1, 1, 1)"
              ></el-button>
            </el-form-item>

            <el-form-item label="曝光模式" placeholder="请选择">
              <el-select label="自动对焦" v-model="exposure" size="mini" class="common" @change="changeFocusMode">
                <el-option v-for="item in options" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="曝光增益" v-show="exposure == 0">
              <el-slider
                v-model="gain"
                :show-tooltip="false"
                show-input
                :show-input-controls="false"
                input-size="mini"
                @change="changeGain"
              ></el-slider>
            </el-form-item>
            <el-form-item label="快门" placeholder="请选择" v-show="exposure == 0">
              <el-select v-model="shutter" size="mini" class="common" @change="changeShutter">
                <el-option v-for="item in shutterOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="光圈" v-show="exposure == 0">
              <el-select v-model="aperture" size="mini" class="common" @change="changeAperture">
                <el-option v-for="item in apertureOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div label="红外视角" name="red" v-if="tab === '1'">
        <div class="camera-action">
          <div>
            <el-button type="primary" size="mini" @click="handleCameraTemperature">获取温度</el-button>
          </div>
          <div>当前温度：{{ cameraTemperature }}</div>
        </div>
      </div>

      <div class="footer-wrap">
        <el-button type="primary" size="mini" @click="fetchLightCameraInfo">获取相机信息</el-button>
        <el-button
          :loading="loadingNew"
          type="primary"
          size="mini"
          :disabled="
            checkedNodes.length != 1 ||
              (checkedNodes[0] && checkedNodes[0].sensorLevel !== '1')
          "
          @click="createSensor"
        >测点录入</el-button>
        <el-button
          :loading="loading"
          type="primary"
          size="mini"
          :disabled="
            checkedNodes.length != 1 ||
              (checkedNodes[0] && checkedNodes[0].sensorLevel !== '1')
          "
          @click="updateSensor"
        >更新测点</el-button>
        <el-button
          :loading="loadingPos"
          type="primary"
          size="mini"
          :disabled="
            checkedNodes.length != 1 ||
              (checkedNodes[0] && checkedNodes[0].sensorLevel !== '1')
          "
          @click="updateSensorPosition"
        >更新相机位置</el-button>
        <!-- <el-button type="primary" size="mini" @click="recoverRobot">
          机器人复位
        </el-button>-->
        <!-- <el-button type="primary" size="mini" @click="returnOrigin">
          一键返航
        </el-button>-->
        <!-- <el-button type="primary" size="mini">抓图导出</el-button>
        <el-button type="primary" size="mini">标定文件导入</el-button>-->
      </div>
    </el-card>
    <el-card class="global-action mt10">
      <div slot="header" class="clearfix">
        <span>全局操作</span>
      </div>
      <div class="global-body">
        <el-button size="mini" @click="returnOrigin">返回充电</el-button>
        <transition name="no-mode-fade" mode="out-in">
          <el-button @click="handleNavigate('1')" v-if="nav_status === '0'" size="mini">开启导航</el-button>
          <el-button v-else @click="handleNavigate('0')" size="mini">关闭导航</el-button>
        </transition>

        <!-- <el-upload
          :action="upload.url"
          :data="upload.data"
          :on-success="handleUploadSuccess"
          :before-upload="handleBeforeUpload"
          :on-error="handleUploadError"
          name="file"
          :show-file-list="false"
          :headers="upload.headers"
        >
          <el-button size="mini" type="primary">激光上传</el-button>
          
        </el-upload>-->
        <el-button size="mini" type="primary" @click="handleBuildRos">激光建图</el-button>

        <!-- <el-button size="mini" @click="handleCapture">抓图</el-button> -->
        <el-button size="mini" type="info" @click="navigateToFast">快速采集</el-button>
        <a class="target" ref="target" href target="_blank"></a>
      </div>
    </el-card>
  </div>
</template>

<script>
let timer
import {
  getLightCameraControl,
  getLightCameraRelative,
  getTakePhoto,
  getLightCameraQuery,
  getRobotToWatch,
  queryCameraTemperature,
  getRobotReset,
  moveCameraToSensor
} from '@/api/setting/device/control'
import { getSensorDetail, getParentSensorDetail, getSensorTypeList, getSensorUpdate, navigationOpen } from '@/api/setting/sensor'
import { generateMap } from '@/api/map'
import { getTaskStatus } from '@/api/inspect'
import { getToken } from '@/utils/auth'
import HKV from './HKV.vue'
import axios from 'axios'
export default {
  name: 'RightCard',
  components: { HKV },
  props: {
    visibleVideo: {
      type: Boolean,
      default: true
    },
    checkedNodes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tab: '0',
      hkvSrc: '/video.html?hkvType=0',
      exposure: '1',
      zoomVal: '',
      focusVal: '',
      shutter: '', // 快门
      fPan: '', // 云台水平角度
      fTilt: '', // 云台垂直角度
      aperture: 0, // 光圈
      gain: 0, // 增益
      fillLight: 0, // 补光灯
      options: [], //曝光模式下拉选项
      shutterOptions: [], //曝光模式下拉选项
      apertureOptions: [], // 光圈拉选项
      isJufang: false, // 是否是局放
      isInfrared: false, // 是否是红外
      infraredFocalLength: '', // 红外焦距
      cameraTemperature: 0, // 相机温度
      visible: false,
      visibleFocus: false,
      distance: 0.3,
      form: {
        exposure: '', //相机曝光增益
        zoomVal: '', //相机倍率值
        focusVal: '', //相机焦距值
        controlMode: '',
        shutter: '', // 快门
        aperture: 0, // 光圈
        gain: 0 // 增益
      },
      overImgPath: '', // 全景图
      firstStatus: {}, // 全景实时状态
      getPictureByCameraIMG: '', // 相机图
      sensorTypeList: [],
      loading: false,
      loadingPos: false,
      loadingNew: false,
      uploadLoading: null,
      secondCaptureData: {}, // 二次抓拍参数
      // 激光上传参数
      upload: {
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/robot/upload/fileUpload',
        // 上传时附带的额外参数
        data: {
          fileType: 2
        }
      },
      isShowRos: false,
      nav_status: '0',
      scale: 1.76,
      hkvHeight: 200
    }
  },
  watch: {
    async checkedNodes(nodes) {
      if (nodes.length === 1 && nodes[0].sensorLevel === '2') {
        const res = await getSensorDetail(this.checkedNodes[0].id)
        const actions = []
        Object.keys(this.sensorTypeList).some(key => {
          if (this.sensorTypeList[key].sensorTypeId == '' + res.data.rsi.sensorType) {
            actions.push(this.sensorTypeList[key].sensorTypeName)
            return true
          }
        })
        const sensorTypeName = actions.join('')
        this.isJufang = sensorTypeName === '局放'
        this.isInfrared = sensorTypeName === '温度'
      }
      if (nodes.length === 1 && nodes[0].sensorLevel === '1') {
      }
    }
  },
  created() {
    this.loadAperture()
    this.loadShutter()
    this.loadFocusMode()
    this.fetchLightCameraInfo()
    this.loadSensorTypeList()
  },
  mounted() {
    this.$eventBus.$on('onPostSensorImg', data => {
      this.secondCaptureData = data
    })
    console.log(this.$refs.cameraWrap.clientWidth)
    this.hkvHeight = this.$refs.cameraWrap.clientWidth / this.scale
  },
  methods: {
    // 获取测点类型
    async loadSensorTypeList() {
      const res = await getSensorTypeList()
      this.sensorTypeList = res.data
    },
    // 曝光模式
    async loadFocusMode() {
      const res = await this.getDicts('robot_exposure_mode')
      this.options = res.data
    },
    // 获取快门
    async loadShutter() {
      const res = await this.getDicts('robot_shutter_option')
      this.shutterOptions = res.data
    },
    // 获取光圈
    async loadAperture() {
      const res = await this.getDicts('robot_aperture_option')
      this.apertureOptions = res.data
    },
    setOverImgPath(ovImg) {
      this.overImgPath = ovImg
    },
    // 全景图抓图
    async handleTakePhoto(type) {
      if (!this.checkedNodes.length) {
        this.$message.warning('请勾选一个测点！')
        return
      }
      // if (this.form.zoomVal != 0) {
      //   this.$message.warning("全景抓图倍率必须为0");
      //   return;
      // }
      let detail
      if (this.checkedNodes[0].sensorLevel === '1') {
        detail = await getParentSensorDetail(this.checkedNodes[0].id)
      } else {
        detail = await getSensorDetail(this.checkedNodes[0].id)
      }
      const res = await getTakePhoto({
        type,
        sensorParentName: `${detail.data.rspi.sensorParentName}_${detail.data.rspi.sensorParentId}`
      })
      // 获取云台位置
      const resCamera = await getLightCameraQuery()

      const resStatus = await getTaskStatus()
      this.firstStatus = {
        ...resStatus.data,
        fPan: resCamera.data.fPan,
        fTilt: resCamera.data.fTilt
      }
      this.overImgPath = res.data.overImgRelativePath
      this.$eventBus.$emit('onPostImg', res.data.overImgAbsolutePath)
      this.$emit('onPostFirstStatus', {
        ...this.form,
        ovImageUrl: res.data.overImgRelativePath,
        overImgAbsolutePath: res.data.overImgAbsolutePath
      })
    },
    // 设备抓图
    async handleDeviceTakePhoto() {
      if (this.overImgPath) {
        const loading = this.$loading({
          lock: true,
          text: '设备抓图中...',
          background: 'rgba(0, 0, 0, 0.6)'
        })
        try {
          const res = await moveCameraToSensor()
          this.secondCaptureData.imageUrl = res.data.picDevicePath
          this.$myMessage.success('抓图成功')
          loading.close()
        } catch (error) {
          loading.close()
        }
        // 2022.1.7
        // this.$eventBus.$emit('onDevicePostImg', {
        //   ...this.form,
        //   ...res.data.rsi
        // })
      } else {
        this.$message.warning('请抓取全景图')
      }
    },
    // 相机切换
    tabClick(name) {
      this.tab = name
      this.hkvSrc = `/video.html?hkvType=${name}`
    },
    numberChange(val, maxNum) {
      //转换数字类型
      // const value = val.replace(/[^0-9.]/g, '')
      this.zoomVal = Number(val)
      //重新渲染
      this.$nextTick(() => {
        //比较输入的值和最大值，返回小的
        let num = Math.min(Number(val), maxNum)
        if (isNaN(num)) {
          this.zoomVal = ''
          return
        }
        //输入负值的情况下， = 0（可根据实际需求更该）
        if (num < 0) {
          this.zoomVal = 0
        } else {
          //反之
          this.zoomVal = num
        }
      })
    },

    // 获取相机信息
    async fetchLightCameraInfo() {
      try {
        const res = await getLightCameraQuery()
        this.form = { ...res.data }
        this.zoomVal = res.data.fZoom
        this.focusVal = res.data.dwFocus
        this.exposure = res.data.exposure
        this.aperture = res.data.aperture / 100 + '.0'
        this.shutter = res.data.shutter
        this.gain = parseInt(res.data.gain)
        this.$eventBus.$emit('onPostLightCamera', this.form)
      } catch ({ msg }) {}
    },
    // 机器人复位
    async recoverRobot() {
      await getRobotReset()
      this.$message.success('已复位')
    },
    // 一键返航
    async returnOrigin() {
      await getRobotToWatch()
      this.$message.success('已返航')
    },
    // 导航开启
    handleNavigate(value) {
      this.nav_status = value
      navigationOpen(this.nav_status)
    },
    // 更新相机位置
    async updateSensorPosition() {
      this.loadingPos = true
      const form = {
        sensorLevel: this.checkedNodes[0].sensorLevel
      }
      const res = await getParentSensorDetail(this.checkedNodes[0].id)
      const robotSensorInfo = res.data.rspi
      const resStatus = await getTaskStatus()
      const robotSensorDetailInfo = {
        ...res.data.rspdi,
        imageUrl: this.secondCaptureData.imageUrl,
        ptzRotation: this.firstStatus.fPan,
        ptzUdangle: this.firstStatus.fTilt,
        zoomVal: this.zoomVal, //相机倍率值
        focusVal: this.focusVal, //相机焦距值
        ovImageUrl: this.overImgPath,
        ovPtzRotation: this.firstStatus.fPan,
        ovPtzUdangle: this.firstStatus.fTilt,
        ovZoomVal: this.zoomVal,
        ovFocusVal: this.focusVal
      }
      form.robotSensorParentInfo = robotSensorInfo
      form.robotSensorParentDetailInfo = robotSensorDetailInfo

      try {
        await getSensorUpdate(form)
        this.$myMessage.success('更新成功')
        this.loadingPos = false
      } catch (error) {
        this.loadingPos = false
      }
    },
    // 测点录入
    async createSensor() {
      let res
      let robotSensorInfo
      // 组测点
      var actions = []
      if (this.checkedNodes[0].sensorLevel === '1') {
        res = await getParentSensorDetail(this.checkedNodes[0].id)
        robotSensorInfo = res.data.rspi
        Object.keys(this.sensorTypeList).some(key => {
          if (this.sensorTypeList[key].sensorTypeId == '' + res.data.rspi.sensorType) {
            actions.push(this.sensorTypeList[key].sensorTypeName)
            return true
          }
        })
      } else {
        // 子测点
        res = await getSensorDetail(this.checkedNodes[0].id)
        robotSensorInfo = res.data.rsi
      }
      const form = {
        sensorLevel: this.checkedNodes[0].sensorLevel
      }
      const sensorTypeName = actions.join('')
      if (!this.overImgPath) {
        this.$myMessage.warning('请抓取全景图')
        return
      } else {
        this.loadingNew = true
        const resStatus = await getTaskStatus()
        const robotSensorDetailInfo = {
          ...res.data.rspdi,
          imageUrl: this.secondCaptureData.imageUrl,
          positionX: resStatus.data.fastX,
          positionY: resStatus.data.fastY,
          rotationAngle: resStatus.data.fastZ,
          ptzRotation: this.firstStatus.fPan,
          ptzUdangle: this.firstStatus.fTilt,
          zoomVal: this.zoomVal, //相机倍率值
          focusVal: this.focusVal, //相机焦距值
          ovPositionX: resStatus.data.fastX,
          ovPositionY: resStatus.data.fastY,
          ovRotationAngle: this.firstStatus.fastZ,
          ovPtzRotation: this.firstStatus.fPan,
          ovPtzUdangle: this.firstStatus.fTilt,
          ovImageUrl: this.overImgPath,
          ovZoomVal: this.zoomVal,
          ovFocusVal: this.focusVal
        }
        console.log(robotSensorDetailInfo)
        return
        if (this.checkedNodes[0].sensorLevel === '1') {
          form.robotSensorParentInfo = robotSensorInfo
          form.robotSensorParentDetailInfo = robotSensorDetailInfo
        } else {
          form.robotSensorInfo = robotSensorInfo
          form.robotSensorDetailInfo = robotSensorDetailInfo
        }
        await getSensorUpdate(form)
        this.loadingNew = false
        this.$myMessage.success('录入成功')
      }
      // 无需设备抓图
      // if (sensorTypeName === '其他' || sensorTypeName === '温度') {
      // } else {
      //   // 需要二次设备抓图
      //   console.log(sensorTypeName)
      //   if (!this.secondCaptureData.imageUrl && sensorTypeName !== '局放') {
      //     this.$myMessage.warning('请进行设备抓图')
      //     return
      //   } else {
      //     this.loading = true
      //     const resCamera = await this.fetchLightCameraInfo()
      //     const resStatus = await getTaskStatus()
      //     let imageUrl_new
      //     if (sensorTypeName === '局放') {
      //       imageUrl_new = ''
      //     } else {
      //       const imageUrl = this.secondCaptureData.imageUrl.split('/')
      //       imageUrl.splice(0, 3)
      //       imageUrl_new = '/' + imageUrl.join('/')
      //     }
      //     const robotSensorDetailInfo = {
      //       ...res.data.rspdi,
      //       ...this.secondCaptureData,
      //       imageUrl: imageUrl_new, //设备拍图url
      //       positionX: resStatus.data.fastX,
      //       positionY: resStatus.data.fastY,
      //       rotationAngle: resStatus.data.fastZ,
      //       ptzRotation: this.firstStatus.fPan,
      //       ptzUdangle: this.firstStatus.fTilt,
      //       zoomVal: this.zoomVal, //相机倍率值
      //       focusVal: this.focusVal, //相机焦距值
      //       ovPositionX: sensorTypeName == '局放' ? resStatus.data.fastX : this.firstStatus.fastX,
      //       ovPositionY: sensorTypeName == '局放' ? resStatus.data.fastY : this.firstStatus.fastY,
      //       ovRotationAngle: sensorTypeName == '局放' ? resStatus.data.fastZ : this.firstStatus.fastZ,
      //       ovPtzRotation: sensorTypeName == '局放' ? resCamera.data.fPan : this.firstStatus.fPan,
      //       ovPtzUdangle: sensorTypeName == '局放' ? resCamera.data.fTilt : this.firstStatus.fTilt,
      //       ovImageUrl: this.overImgPath,
      //       ovZoomVal: this.zoomVal,
      //       ovFocusVal: this.focusVal
      //     }
      //     if (this.checkedNodes[0].sensorLevel === '1') {
      //       form.robotSensorParentInfo = robotSensorInfo
      //       form.robotSensorParentDetailInfo = robotSensorDetailInfo
      //     } else {
      //       form.robotSensorInfo = robotSensorInfo
      //       form.robotSensorDetailInfo = robotSensorDetailInfo
      //     }
      //     try {
      //       await getSensorUpdate(form)
      //       this.loading = false
      //       this.$myMessage.success('更新成功')
      //     } catch (error) {
      //       this.loading = false
      //     }
      //   }
      // }
    },
    // 测点更新(只更新xyz坐标)
    async updateSensor() {
      console.log(this.secondCaptureData)
      let res
      let robotSensorInfo
      // 组测点
      var actions = []
      if (this.checkedNodes[0].sensorLevel === '1') {
        res = await getParentSensorDetail(this.checkedNodes[0].id)
        robotSensorInfo = res.data.rspi
        Object.keys(this.sensorTypeList).some(key => {
          if (this.sensorTypeList[key].sensorTypeId == '' + res.data.rspi.sensorType) {
            actions.push(this.sensorTypeList[key].sensorTypeName)
            return true
          }
        })
      } else {
        // 子测点
        res = await getSensorDetail(this.checkedNodes[0].id)
        robotSensorInfo = res.data.rsi
      }
      const form = {
        sensorLevel: this.checkedNodes[0].sensorLevel
      }
      if (!this.overImgPath) {
        this.$myMessage.warning('请抓取全景图')
        return
      } else {
        this.loading = true
        const resStatus = await getTaskStatus()
        const robotSensorDetailInfo = {
          ...res.data.rspdi,
          imageUrl: this.overImgPath,
          positionX: resStatus.data.posX,
          positionY: resStatus.data.posY,
          rotationAngle: resStatus.data.bodyAngle,
          ovPositionX: resStatus.data.posX,
          ovPositionY: resStatus.data.posY,
          ovRotationAngle: resStatus.data.bodyAngle
        }
        if (this.checkedNodes[0].sensorLevel === '1') {
          form.robotSensorParentInfo = robotSensorInfo
          form.robotSensorParentDetailInfo = robotSensorDetailInfo
        } else {
          form.robotSensorInfo = robotSensorInfo
          form.robotSensorDetailInfo = robotSensorDetailInfo
        }
        await getSensorUpdate(form)
        this.loading = false
        this.$myMessage.success('更新成功')
      }
    },
    // 更改倍率
    changeZoomVal() {
      this.visible = true
    },
    // 倍率确认
    async confirmZoomVal() {
      this.form.zoomVal = this.zoomVal
      this.form.controlMode = 2
      await this.sumitLightCameraControl()
      this.visible = false
    },
    changeFocusVal() {
      this.visibleFocus = true
    },
    // 焦距确认
    async confirmFocusVal() {
      this.form.controlMode = 1
      this.form.focusVal = this.focusVal
      await this.sumitLightCameraControl()
      this.visibleFocus = false
    },
    // 按钮调整倍率、焦距
    handlePlusLightControl(cmdType, paramType, buttonFlag) {
      getLightCameraRelative({
        cmdType, //0 变倍 1 变焦
        paramType, //0 调小 1 调大
        buttonFlag //0 按下 1 松开
      })
      timer = setInterval(() => {
        getLightCameraRelative({
          cmdType, //0 变倍 1 变焦
          paramType, //0 调小 1 调大
          buttonFlag //0 按下 1 松开
        })
      }, 500)
    },
    handleMinusLightControl(cmdType, paramType, buttonFlag) {
      getLightCameraRelative({
        cmdType, //0 变倍 1 变焦
        paramType, //0 调小 1 调大
        buttonFlag //0 按下 1 松开
      })
      clearInterval(timer)
    },
    // 更改对焦模式
    changeFocusMode(val) {
      this.form.controlMode = 5
      this.form.exposure = val
      this.sumitLightCameraControl()
    },
    // 更改增益
    changeGain(val) {
      this.form.controlMode = 6
      this.form.gain = val
      this.sumitLightCameraControl()
    },
    // 更改快门
    changeShutter(val) {
      this.form.controlMode = 4
      this.form.shutter = val
      this.sumitLightCameraControl()
    },
    // 更改光圈
    changeAperture(val) {
      this.form.controlMode = 3
      this.form.aperture = val
      this.sumitLightCameraControl()
    },
    // 可见光相机提交
    async sumitLightCameraControl() {
      const res = await getTaskStatus()
      this.form.speedMode = res.data.rTPInfo.speedMode
      await getLightCameraControl(this.form)
      this.$eventBus.$emit('onPostLightCamera', this.form)
    },
    // 获取红外温度
    async handleCameraTemperature() {
      const res = await queryCameraTemperature()
      this.cameraTemperature = res.data.temperature
    },
    handleUploadSuccess(res) {
      this.uploadLoading.close()
    },
    handleBeforeUpload() {
      this.uploadLoading = this.$loading({
        lock: true,
        text: '上传中',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    handleUploadError() {
      this.$message({
        type: 'error',
        message: '上传失败'
      })
      this.uploadLoading.close()
    },
    // 激光建图
    handleBuildRos() {
      generateMap()
    },
    // 图像识别拍照
    handleCapture() {
      axios({
        method: 'post',
        url: process.env.VUE_APP_BASE_C_API,
        data: {
          MSG_TYPE: '9999',
          MSG_DATA: {}
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      })
        .then(res => {
          console.log(res)
          // const aLink = document.createElement('a')
          // aLink.href = 'http://10.9.162.199:8081' + res.data.data.filepath
          // aLink.setAttribute('download', 1) // 设置下载文件名称
          // document.body.appendChild(aLink)
          // aLink.click()
          var timestamp = new Date().getTime()
          let image = new Image()
          image.setAttribute('crossOrigin', 'anonymous')
          image.src = 'http://10.9.162.199:8081' + res.data.data.filepath
          image.onload = () => {
            let canvas = document.createElement('canvas')
            canvas.width = image.width
            canvas.height = image.height
            let ctx = canvas.getContext('2d')
            ctx.drawImage(image, 0, 0, image.width, image.height)
            canvas.toBlob(blob => {
              let url = URL.createObjectURL(blob)
              const aLink = document.createElement('a')
              aLink.href = url
              aLink.setAttribute('download', timestamp) // 设置下载文件名称
              document.body.appendChild(aLink)
              aLink.click()
              // 用完释放URL对象
              URL.revokeObjectURL(url)
            })
          }
        })
        .catch(function (err) {
          console.log(err)
        })
    },
    navigateToFast() {
      let target = this.$refs.target
      target.setAttribute('href', window.location.origin + '/fastAcq')
      target.click()
      // this.$router.push('/fastAcq')
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
    }
  }
}
</script>

<style lang="scss" scoped>
.right-card {
  min-height: calc(100vh - 124px - 113px - 10px);
  .camera-tab {
    min-height: calc(100vh - 124px);
  }
  .right-tab {
    @include fb(flex-start);
    padding-bottom: 7px;
    span {
      cursor: pointer;
      &.active {
        color: $menuActiveText;
      }
    }
  }
  .camera-wrap {
    width: 100%;
    // height: 200px;
    margin-bottom: 30px;
    @include fb();
    .cameraImg {
      width: 100%;
      height: 100%;
    }
    .hk-iframe {
      width: 100%;
    }
  }
  .camera-action {
    margin-top: 10px;
    @include fb();
    .distance {
      color: #606266;
      font-size: 12px;
      @include fb();
      .number-input {
        width: 50px;
      }
    }
  }
  .light-ctrl {
    @include fb(center, center, column);
    h4 {
      text-align: center;
      margin: 10px 0;
    }
    .light-ctrl-form {
      margin: auto;
      @include fb(center, center, column);
      .common {
        width: 130px;
      }
      .icon-minus {
        margin-left: 10px;
      }
      ::v-deep {
        .el-form-item {
          margin-bottom: 2px;
          width: 100%;
        }
        .el-form-item__label {
          font-size: 12px;
        }
        .el-slider__input {
          width: 60px;
        }
        .el-slider__runway.show-input {
          margin-right: 65px;
        }
        .el-input-number {
          .el-input__inner {
            text-align: left;
          }
        }
      }
    }
  }
  .footer-wrap {
    @include fb(space-around);
    flex-wrap: wrap;
    margin-bottom: -10px;
    margin-top: 10px;
    button {
      margin-bottom: 10px;
    }
  }
}
.global-action {
  .global-body {
    @include fb();
  }
}
</style>
