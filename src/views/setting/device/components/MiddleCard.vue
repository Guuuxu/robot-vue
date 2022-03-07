<template>
  <div class="middle-card">
    <el-card class="full-view">
      <div slot="header">
        <span>全景图</span>
      </div>
      <div class="cropper-content" ref="cropperContent" :style="{ height: cropperH + 'px' }">
        <el-row :gutter="10" class="mt10" type="flex" justify="space-between" style="height:100%">
          <el-col :span="24">
            <vueCropper
              ref="cropper"
              :img="option.overImgPath"
              :outputSize="option.outputSize"
              :outputType="option.outputType"
              :info="true"
              :full="option.full"
              :canMove="option.canMove"
              :canMoveBox="option.canMoveBox"
              :canScale="option.canScale"
              :original="option.original"
              :autoCrop="option.autoCrop"
              :fixed="option.fixed"
              :fixedNumber="option.fixedNumber"
              :centerBox="option.centerBox"
              :infoTrue="option.infoTrue"
              :fixedBox="option.fixedBox"
              mode="100% auto"
              @realTime="realTime"
            ></vueCropper>
          </el-col>
        </el-row>
        <div class="dashedLine" style="z-index:3;position:absolute;border-left: 1px dashed red;height:100%;left:20%;top:0"></div>
        <div class="dashedLine" style="z-index:3;position:absolute;border-left: 1px dashed red;height:100%;right:20%;top:0"></div>
        <div class="dashedLine" style="z-index:3;position:absolute;border-bottom: 1px dashed red;width:60%;left:20%;top:8%"></div>
        <div class="dashedLine" style="z-index:3;position:absolute;border-bottom: 1px dashed red;width:60%;right:20%;bottom:8%"></div>
      </div>

      <div class="col-action mt10">
        <el-cascader
          v-model="checkType"
          :props="{ value: 'deviceId' }"
          v-show="checkedNodes[0] && cropW > 0"
          size="mini"
          :options="checkTypeOption"
        ></el-cascader>
        <el-button
          v-show="
            checkedNodes[0] &&
              checkedNodes[0].children &&
              previewData.length !== checkedNodes[0].children.length
          "
          size="mini"
          type="primary"
          plain
          @click="handleNext"
        >下一张</el-button>
        <transition mode="out-in">
          <el-button
            v-show="
              previewData.length &&
                checkedNodes[0].children &&
                previewData.length === checkedNodes[0].children.length
            "
            size="mini"
            type="primary"
            :loading="loading"
            @click="handleSave"
          >保 存</el-button>
        </transition>
      </div>
    </el-card>
    <el-card class="state-card custom-scrollbar mt10">
      <div slot="header">
        <div class="head-tab">
          <span :class="{ active: tab === '0' }" @click="tabClick('0')">控制</span>
          <el-divider direction="vertical"></el-divider>
          <span :class="{ active: tab === '1' }" @click="tabClick('1')">状态</span>
        </div>
      </div>
      <div class="state-body">
        <div class="l" v-show="tab === '0'">
          <div class="state-body-row speedMode">
            <span class="demonstration mr10">前进速度</span>
            <el-slider
              class="speedMode-slider"
              v-model="rTPInfo.speedMode"
              :step="1"
              :max="2"
              height="8px"
              show-stops
              :marks="marks"
              @change="handleSetSpeedMode(0)"
            ></el-slider>
          </div>
          <!-- <div class="state-body-row speedMode">
            <span class="demonstration">角速度</span>
            <el-slider
              class="speedMode-slider"
              v-model="taskStatus.aSpeed"
              :step="1"
              :max="2"
              height="8px"
              show-stops
              :marks="marks"
              @change="handleSetSpeedMode"
            >
            </el-slider>
          </div>-->
          <div class="state-body-row speedMode">
            <span class="demonstration mr10">云台速度</span>
            <el-slider
              class="speedMode-slider"
              v-model="rTPInfo.ptzSpeedMode"
              :step="1"
              :max="2"
              height="8px"
              show-stops
              :marks="marks"
              @change="handleSetSpeedMode(1)"
            ></el-slider>
          </div>
          <div class="state-body-row mt10">
            <span class="state-label">水平角度</span>
            <span class="state-value">{{ cameraData.fPan }}</span>
            <el-popover v-model="visible3" trigger="manual" width="160">
              <p>确定更改水平角度吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="cancelPtzRotation">取消</el-button>
                <el-button type="primary" size="mini" @click="confirmRobotToPosition(4)">确定</el-button>
              </div>
              <el-input-number
                class="state-input"
                :controls="false"
                size="mini"
                slot="reference"
                v-model="form.ptzRotation"
                @change="changeRobotToPosition(3)"
              />
            </el-popover>
          </div>
          <div class="state-body-row">
            <span class="state-label">垂直角度</span>
            <span class="state-value">{{ cameraData.fTilt }}</span>
            <el-popover v-model="visible4" trigger="manual" width="160">
              <p>确定更改垂直角度吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="cancelPtzUdangle">取消</el-button>
                <el-button type="primary" size="mini" @click="confirmRobotToPosition(3)">确定</el-button>
              </div>
              <el-input-number
                class="state-input"
                :controls="false"
                size="mini"
                slot="reference"
                v-model="form.ptzUdangle"
                @change="changeRobotToPosition(4)"
              />
            </el-popover>
          </div>
          <el-button type="primary" size="mini" @click="recoverRobot">云台复位</el-button>
        </div>
        <div class="l" v-show="tab === '1'">
          <div class="state-body-row">
            <span class="state-label">坐标X</span>
            <span class="state-value">{{ taskStatus.posX }}</span>
            <el-popover v-model="visible0" trigger="manual" width="160">
              <p>确定更改坐标X吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="cancelPosX">取消</el-button>
                <el-button type="primary" size="mini" @click="confirmRobotToPosition(1)">确定</el-button>
              </div>
              <el-input-number
                class="state-input"
                :controls="false"
                size="mini"
                slot="reference"
                v-model="form.positionX"
                @change="changeRobotToPosition(0)"
              />
            </el-popover>
          </div>
          <div class="state-body-row">
            <span class="state-label">坐标Y</span>
            <span class="state-value">{{ taskStatus.posY }}</span>
            <el-popover v-model="visible1" trigger="manual" width="160">
              <p>确定更改坐标Y吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="cancelPosY">取消</el-button>
                <el-button type="primary" size="mini" @click="confirmRobotToPosition(1)">确定</el-button>
              </div>
              <el-input-number
                class="state-input"
                :controls="false"
                size="mini"
                slot="reference"
                v-model="form.positionY"
                @change="changeRobotToPosition(1)"
              />
            </el-popover>
          </div>
          <div class="state-body-row">
            <span class="state-label">车身旋转</span>
            <span class="state-value">{{ taskStatus.bodyAngle }}</span>
            <el-popover v-model="visible2" trigger="manual" width="160">
              <p>确定更改旋转角度吗？</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="cancelRotationAngle">取消</el-button>
                <el-button type="primary" size="mini" @click="confirmRobotToPosition(2)">确定</el-button>
              </div>
              <el-input
                class="state-input"
                size="mini"
                slot="reference"
                v-model="form.rotationAngle"
                @change="changeRobotToPosition(2)"
                @input="parseInput($event, 'rotationAngle', 1)"
              />
            </el-popover>
          </div>
          <div class="state-body-row">
            <div class="state-label">避障</div>
            <div>
              <div class="setting-wrap">
                <el-switch
                  v-model="rTPInfo.coreLeftObstacleFlag"
                  inactive-value="0"
                  active-value="1"
                  size="mini"
                  @change="HandleRobotObstacleControlLeft"
                ></el-switch>
              </div>
            </div>
          </div>
        </div>
        <el-divider direction="vertical" class="line"></el-divider>
        <div class="r">
          <div class="robot-box">
            <!-- 小车行驶 -->
            <img src="@assets/image/device/robot.png" alt class="robot1" />
            <div class="lt direction forward" @mousedown="handleWalkMouseDown(0)" @mouseup="handleWalkMouseUp(0)">
              <img src="@assets/image/device/bottom-left.png" alt />
            </div>
            <div class="rt direction back" @mousedown="handleWalkMouseDown(1)" @mouseup="handleWalkMouseUp(1)">
              <img src="@assets/image/device/bottom-right.png" alt />
            </div>
            <!-- 小车旋转 -->
            <div class="turnR direction turnRDirection" @mousedown="handleTurnMouseDown(1)" @mouseup="handleTurnMouseUp(1)">
              <img src="@assets/image/device/center11.png" alt />
            </div>
            <div class="turnL direction turnLDirection" @mousedown="handleTurnMouseDown(0)" @mouseup="handleTurnMouseUp(0)">
              <img src="@assets/image/device/center21.png" alt />
            </div>
            <!-- 云台俯仰 -->
            <div class="ptzU direction ptzUp" @mousedown="handleUdangleMouseDown(0)" @mouseup="handleUdangleMouseUp(0)">
              <img src="@assets/image/device/ptz-top.png" alt />
            </div>
            <div class="ptzD direction ptzDown" @mousedown="handleUdangleMouseDown(1)" @mouseup="handleUdangleMouseUp(1)">
              <img src="@assets/image/device/ptz-bottom.png" alt />
            </div>
            <!-- 云台旋转 -->
            <div class="turnRP direction turnRPtz" @mousedown="handleTurnPtzMouseDown(1)" @mouseup="handleTurnPtMouseUp(1)">
              <img src="@assets/image/device/top-right1.png" alt />
            </div>
            <div class="turnLP direction turnLPtz" @mousedown="handleTurnPtzMouseDown(0)" @mouseup="handleTurnPtMouseUp(0)">
              <img src="@assets/image/device/top-left1.png" alt />
            </div>
          </div>
          <!-- 方向控制面板 -->
          <div class="control-panel">
            <div class="oricl front" @mousedown="handleWalkMouseDown(0)" @mouseup="handleWalkMouseUp(0)"></div>
            <!-- <div class="oricl leftFront" @mousedown="handleWalkMouseDown(2)" @mouseup="handleWalkMouseUp(2)"></div> -->
            <!-- 原地左转 -->
            <div class="oricl left" @mousedown="handleTurnMouseDown(0)" @mouseup="handleTurnMouseUp(0)"></div>
            <!-- <div class="oricl leftBack" @mousedown="handleWalkMouseDown(3)" @mouseup="handleWalkMouseUp(3)"></div> -->
            <div class="oricl back" @mousedown="handleWalkMouseDown(1)" @mouseup="handleWalkMouseUp(1)"></div>
            <!-- <div class="oricl rightFront" @mousedown="handleWalkMouseDown(4)" @mouseup="handleWalkMouseUp(4)"></div> -->
            <!-- 原地右转 -->
            <div class="oricl right" @mousedown="handleTurnMouseDown(1)" @mouseup="handleTurnMouseUp(1)"></div>
            <!-- <div class="oricl rightBack" @mousedown="handleWalkMouseDown(5)" @mouseup="handleWalkMouseUp(5)"></div> -->
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { VueCropper } from 'vue-cropper'
import {
  walkControl,
  rotateCarControl,
  rotateControl,
  udangleControl,
  moveCameraToSensor,
  getRobotToPosition,
  getRobotObstacleControl,
  speedModeControl,
  getRobotReset,
  getLightCameraQuery
} from '@/api/setting/device/control'
import { editBatchSensor, getSensorTreeList, cutPicture } from '@/api/setting/sensor'
import { getTaskStatus } from '@/api/inspect'
import { limitInput, debounce, accMul, accDiv } from '@/utils'
let timer
let timerCamera
export default {
  components: {
    VueCropper
  },
  props: {
    checkedNodes: {
      type: Array,
      default: () => []
    },
    isAbort: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tab: '1',
      marks: {
        0: '低',
        1: '中',
        2: '高'
      },
      cropperH: 200, // 截图父级框高度
      cropW: 0, // 截图框宽度
      checkType: [], // 全景图类型
      checkTypeOption: [], // 全景图类型选项
      checkList: [],
      checkStatus: [false, false, false],
      group: ['左侧避障', '右侧避障', '下侧避障'],

      // 裁剪组件的基础配置option
      option: {
        overImgPath: require('@assets/image/device/overImg.jpg'), // 默认裁剪图片的地址
        info: true, // 裁剪框的大小信息
        outputSize: 0.8, // 裁剪生成图片的质量
        outputType: 'jpeg', // 裁剪生成图片的格式
        canScale: false, // 图片是否允许滚轮缩放
        autoCrop: false, // 是否默认生成截图框
        // autoCropWidth: 300, // 默认生成截图框宽度
        // autoCropHeight: 200, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        fixed: false, // 是否开启截图框宽高固定比例
        full: true, // 是否输出原图比例的截图
        canMove: false, // 上传图片是否可以移动
        canMoveBox: true, // 截图框能否拖动
        original: false, // 上传图片按照原始比例渲染
        centerBox: false, // 截图框是否被限制在图片里面
        infoTrue: true // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
      },
      taskStatus: {},
      cameraData: {}, // 相机信息
      rTPInfo: {
        speedMode: null,
        ptzSpeedMode: null
      }, // 机器人实时信息
      theCircle: {
        startx: '',
        starty: '',
        width: '',
        height: ''
      },
      visible0: false,
      visible1: false,
      visible2: false,
      visible3: false,
      visible4: false,
      visibleNo: null,
      form: {
        // positionX: "", //定点
        // positionY: "", //偏移量
        // rotationAngle: "", //机器人旋转角度
        // ptzUdangle: "", //云台俯仰角度
        // ptzRotation: "", //云台旋转角度
        type: '', //1-定点 2-机器人旋转角度  3-云台俯仰角度 4-云台旋转角度
        speedMode: '' //速度必输 0-低 1-中 2-高
      },
      previewData: [], //测点图类型信息
      originPhoto: [2688, 1520], // 原始相机图片尺寸
      loading: false,
      path: '' // 设备图图相对路径
    }
  },
  watch: {
    checkedNodes(obj, old) {
      if (!obj.length) {
        this.previewData = []
        this.checkType = []
      }
    }
  },

  created() {
    console.log('created')
    this.init()
  },
  mounted() {
    // 全景成功抓图
    this.$eventBus.$on('onPostImg', overImgAbsolutePath => {
      // this.option.overImgPath = require("@assets/image/login-background.jpg");
      this.option.overImgPath = overImgAbsolutePath
    })
    // 设备抓图
    this.$eventBus.$on('onDevicePostImg', val => {
      const cropper = this.$refs.cropper
      if (cropper) {
        if (!!cropper?.cropW) {
          const loading = this.$loading({
            lock: true,
            text: '设备抓图中...',
            background: 'rgba(0, 0, 0, 0.6)'
          })
          const theCircle = {
            startx: cropper.getCropAxis().x1,
            starty: cropper.getCropAxis().y1,
            width: cropper.cropW, // 框的宽度
            height: cropper.cropH // 框的高度
          }
          const a = this.$refs.cropperContent.clientWidth / 2 //div图片显示宽度

          const b = this.$refs.cropperContent.clientHeight / 2 //图片显示高度

          const distance = val.distance

          // temPRobotPosition.distance = distance;

          const center = JSON.parse(this.$storage.getItem('lightLocation'))

          const xCenter = center[0] // 49.4542

          const yCenter = center[1] // 49.8963

          const hTargetDist = (xCenter * 2 * a) / 100 - theCircle.startx - theCircle.width / 2
          const vTargetDist = (yCenter * 2 * b) / 100 - theCircle.starty - theCircle.height / 2

          moveCameraToSensor({
            robot2Cabinet: distance, //   double  机器人到电器柜的距离
            hTargetDist: Math.round(hTargetDist), // int 目标中心到图像中心的水平距离
            vTargetDist: Math.round(vTargetDist), // int 目标中心到图像中心的垂直距离
            frameWidth: Math.round(theCircle.width), //  int 图框的高度
            frameHeight: Math.round(theCircle.height), // int 图框的高度
            imageWidth: Math.round(2 * 220), //  int 图像的宽度
            imageHeight: Math.round(2 * b), // int  图像的高度
            deviceName: `${val.deviceName}_${val.deviceId}`,
            sensorParentName: `${val.sensorParentName}_${val.sensorParentId}`,
            sensorName: `${val.sensorName}_${val.sensorId}`
          })
            .then(res => {
              this.$myMessage.success('抓图成功')
              loading.close()
              this.$eventBus.$emit('onPostSensorImg', {
                imageUrl: res.data.sensorImgAbsolutePath,
                ovImageSelectX: cropper.cropW, //  int 图框的高度
                ovImageSelectY: cropper.cropH, // int 图框的高度
                ovImageSelectWidth: Math.round(theCircle.width), //  全景选择框x坐标
                ovImageSelectHeight: Math.round(theCircle.height) // 全景选择框y坐标
              })

              this.$emit('onPostSecondStatus', {
                ...val,
                imageUrl: res.data.sensorImgAbsolutePath,
                ovImageSelectX: cropper.cropW, //  int 图框的高度
                ovImageSelectY: cropper.cropH, // int 图框的高度
                ovImageSelectWidth: Math.round(theCircle.width), //  全景选择框x坐标
                ovImageSelectHeight: Math.round(theCircle.height) // 全景选择框y坐标
              })
            })
            .catch(err => {
              console.log(err)
              loading.close()
            })
        } else {
          this.$message.warning('请框选测点')
        }
      }
    })

    // 开始截图
    this.$refs.cropper.startCrop()
    this.$once('hook:beforeDestroy', () => {
      clearInterval(timerCamera)
    })
    this.changeCropHeight()
    this.initListener()
    window.addEventListener('unload', e => {
      console.log('unload')
    })
  },
  methods: {
    async init() {
      await this.fetchTaskStatus()
      this.fetchLightCameraInfo()
      this.loopFetchLightCameraInfo()
      this.loadAlgOption()
    },
    // 获取算法类型
    async loadAlgOption() {
      const res = await getSensorTreeList()
      this.checkTypeOption = this.parseTreeList(res.data)
    },
    // 树形数据递归处理
    parseTreeList(data) {
      return data.map(item => {
        if (item.children.length) {
          this.parseTreeList(item.children)
          return item
        } else {
          delete item.children
          return item
        }
      })
    },
    // 实时状态信息
    async fetchTaskStatus() {
      try {
        const res = await getTaskStatus()
        this.rTPInfo = res.data.rTPInfo
        this.rTPInfo.ptzSpeedMode = +this.rTPInfo.ptzSpeedMode
        this.rTPInfo.speedMode = +this.rTPInfo.speedMode
        this.taskStatus = res.data
        this.$emit('onUpdateTaskStatus', this.taskStatus)

        if (!this.isAbort) {
          setTimeout(() => {
            this.fetchTaskStatus()
          }, 5000)
        }
      } catch (error) {}
    },
    // 获取相机信息
    async fetchLightCameraInfo() {
      try {
        const res = await getLightCameraQuery()
        this.cameraData = res.data
      } catch ({ msg }) {}
    },
    loopFetchLightCameraInfo() {
      timerCamera = setInterval(async () => {
        this.fetchLightCameraInfo()
      }, 6000)
    },
    // 显示全景图
    setOverImgPath(ovImg, imgUrl) {
      this.option.overImgPath = ovImg
      this.path = imgUrl
    },
    // 自适应高度
    changeCropHeight() {
      const cropperContent = this.$refs.cropperContent
      this.cropperH = cropperContent.clientWidth / (this.originPhoto[0] / this.originPhoto[1]) //1.76
    },
    // 窗口监听
    initListener() {
      window.addEventListener(
        'resize',
        debounce(() => {
          const cropperContent = this.$refs.cropperContent
          this.cropperH = cropperContent.clientWidth / (this.originPhoto[0] / this.originPhoto[1]) // 1.76
        }, 200)
      )
    },
    // 实时预览
    realTime(data) {
      // 2021.8.8
      // if (
      //   this.$refs.cropper.getCropAxis().x1 > 0 &&
      //   (this.$refs.cropper.getCropAxis().x1 <
      //     this.$refs.cropperContent.clientWidth / 4 ||
      //     this.$refs.cropper.getCropAxis().x1 + this.$refs.cropper.cropW >
      //       (3 * this.$refs.cropperContent.clientWidth) / 4)
      // ) {
      //   this.$myMessage.warning("超出有效识别区域识别会产生误差");
      // }
      this.cropW = this.$refs.cropper.cropW
    },
    // 下一个
    handleNext() {
      const cropper = this.$refs.cropper
      const calc = this.originPhoto[0] / this.$refs.cropperContent.clientWidth
      if (!this.checkType.length) {
        this.$message.warning('请选择类型')
        return
      } else {
        if (cropper.cropW) {
          const theCircle = {
            ovImageSelectX: accMul(calc, cropper.getCropAxis().x1),
            ovImageSelectY: accMul(calc, cropper.getCropAxis().y1),
            ovImageSelectWidth: accMul(calc, cropper.cropW), // 框的宽度
            ovImageSelectHeight: accMul(calc, cropper.cropH), // 框的高度
            algType: this.checkType[1]
          }
          this.previewData.push(theCircle)
          this.$refs.cropper.clearCrop()
        } else {
          this.$message.warning('请框选测点')
        }
      }
    },
    // 保存所有测点算法类型信息
    async handleSave() {
      this.checkedNodes[0].children.map((item, index) => {
        this.previewData[index].sensorId = item.deviceId
      })
      let picPath = ''
      this.loading = true
      try {
        for (let i = 0; i < this.previewData.length; i++) {
          const element = {
            ...this.previewData[i],
            path: picPath ? picPath : this.path
          }
          const res = await cutPicture(element)
          picPath = res.data.picPath
        }
        this.loading = false
        this.$message.success('已保存')
      } catch (error) {}
    },
    // 输入精确2位小数
    parseInput(value, name, precision) {
      console.log(value)
      const data = limitInput(value, precision)
      this.form[name] = data
    },
    // 控制切换
    tabClick(name) {
      this.tab = name
    },
    // 更改状态
    changeRobotToPosition(num) {
      this[`visible${num}`] = true
      this.visibleNo = num
    },
    // 更改速度
    async handleSetSpeedMode(type) {
      await speedModeControl({
        type,
        speedMode: type == 0 ? this.rTPInfo.speedMode : this.rTPInfo.ptzSpeedMode
      })
    },
    // 取消水平角度更改
    cancelPtzRotation() {
      this.visible3 = false
      this.form.ptzRotation = ''
    },
    // 取消垂直角度更改
    cancelPtzUdangle() {
      this.visible4 = false
      this.form.ptzUdangle = ''
    },
    // 取消坐标x更改x
    cancelPosX() {
      this.visible0 = false
      this.form.positionX = ''
    },
    // 取消坐标y更改
    cancelPosY() {
      this.visible1 = false
      this.form.positionX = ''
    },
    // 取消旋转角度更改
    cancelRotationAngle() {
      this.visible2 = false
      this.form.rotationAngle = ''
    },
    // 云台复位
    async recoverRobot() {
      await getRobotReset()
      this.$message.success('已复位')
    },
    // 机器人移动到具体位置
    async confirmRobotToPosition(type) {
      this.form.type = type
      this.form.speedMode = type == 1 || type == 2 ? this.rTPInfo.speedMode : this.rTPInfo.ptzSpeedMode
      try {
        await getRobotToPosition({
          ...this.form,
          positionX: this.form.positionX == '' ? this.taskStatus.posX : this.form.positionX, //定点
          positionY: this.form.positionY == '' ? this.taskStatus.posY : this.form.positionY //偏移量
        })
        this.$message.success('更改成功')
        this[`visible${this.visibleNo}`] = false
      } catch ({ msg }) {
        this[`visible${this.visibleNo}`] = false
      }
    },
    // 鼠标按下行走
    handleWalkMouseDown(direction) {
      this.controlWalk(direction, 0)
      timer = setInterval(() => {
        this.controlWalk(direction, 0)
      }, 200)
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
    // 鼠标松开--停止行走
    handleWalkMouseUp(direction) {
      clearInterval(timer)
      this.controlWalk(direction, 1)
      this.clearPendingFunc()
    },
    // 鼠标按下 -- 小车旋转
    async handleTurnMouseDown(direction) {
      await this.rotateCarControl(direction, 0)
      timer = setInterval(() => {
        this.rotateCarControl(direction, 0)
      }, 500)
    },
    // 小车旋转控制
    rotateCarControl(direction, buttonFlag) {
      try {
        rotateCarControl({
          direction,
          buttonFlag,
          speedMode: this.rTPInfo.speedMode
        })
      } catch (error) {
        clearInterval(timer)
      }
    },
    // 鼠标松开--旋转
    handleTurnMouseUp(direction) {
      clearInterval(timer)
      this.rotateCarControl(direction, 1)
      this.clearPendingFunc()
    },
    // 鼠标按下 -- 云台俯仰
    handleUdangleMouseDown(direction) {
      this.controlUdangle(direction, 0)
    },
    // 云台俯仰控制
    controlUdangle(direction, buttonFlag) {
      udangleControl({
        direction,
        buttonFlag,
        speedMode: this.rTPInfo.ptzSpeedMode
      })
    },
    // 鼠标松开 -- 云台俯仰
    handleUdangleMouseUp(direction) {
      this.controlUdangle(direction, 1)
      this.clearPendingFunc()
    },
    // 鼠标按下 -- 云台旋转
    handleTurnPtzMouseDown(direction) {
      this.rotatePtzControl(direction, 0)
    },
    // 云台旋转控制
    rotatePtzControl(direction, buttonFlag) {
      rotateControl({
        direction,
        buttonFlag,
        speedMode: this.rTPInfo.ptzSpeedMode
      })
    },
    // 鼠标松开 -- 云台旋转
    handleTurnPtMouseUp(direction) {
      this.rotatePtzControl(direction, 1)
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
    },
    // 左避障操作
    HandleRobotObstacleControlLeft(value) {
      this.handleRobotObstacleControl(value, 0)
    },
    // 避障处理
    async handleRobotObstacleControl(obstacleOpenFlag, obstacleType) {
      try {
        await getRobotObstacleControl({ obstacleOpenFlag, obstacleType })
        if (obstacleOpenFlag === '1') {
          this.msgSuccess('已开启')
        } else {
          this.msgSuccess('已关闭')
        }
      } catch (error) {}
    },
    changeAvoid(name, index) {
      if (this.checkList.includes(index)) {
        this.$confirm(`确定开启${name}?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.checkStatus[index] = true
          })
          .catch(() => {
            this.checkStatus[index] = false
            this.checkList.pop()
          })
      } else {
        this.$confirm(`确定关闭${name}?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.checkStatus[index] = false
          })
          .catch(() => {
            this.checkStatus[index] = true
            this.checkList.push(index)
          })
      }
    }
  },

  // 关闭定时器
  deactivated() {
    console.log('deactivated')
    window.onresize = null
    clearInterval(timerCamera)
  },
  //注销window.onresize事件
  destroyed() {
    window.onresize = null
    clearInterval(timerCamera)
  }
}
</script>

<style lang="scss" scoped>
.middle-card {
  min-height: calc(100vh - 124px);
  @include fb(space-between, space-between, column);
  .full-view {
    .full-body {
      position: relative;
      width: 100%;
      height: 200px;
      .full-img {
        width: 100%;
        height: 200px;
      }
    }
    .cropper-content {
      width: 100%;
      height: 200px;
      position: relative;
      .el-button {
        margin-left: 0;
      }
    }
    ::v-deep {
      .el-card__body {
        padding: 15px;
        cursor: url('~@assets/image/cursor2.png') 16 16, crosshair;
      }
    }
    .col-action {
      @include fb(space-between);
    }
  }
  .state-card {
    ::v-deep {
      .el-card__body {
        padding: 15px;
      }
    }
    .head-tab {
      @include fb(flex-start);
      span {
        &.active {
          color: $menuActiveText;
        }
      }
    }
    .state-body {
      @include fb();
      .l {
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
        .state-body-row {
          font-size: 12px;
          margin-bottom: 5px;
          &:last-child {
            margin-bottom: 0;
          }
          @include fb(flex-start);
          .state-label {
            width: 60px;
          }
          .state-value {
            width: 50px;
            text-align: center;
          }
          .state-input {
            width: 80px;
          }
          ::v-deep {
            .el-input--mini .el-input__inner {
              height: 24px;
              line-height: 24px;
            }
          }
          .setting-wrap {
            margin-bottom: 5px;
            padding: 0 10px;
            &:last-child {
              margin-bottom: 0;
            }
            & > label {
              margin-right: 10px;
              width: 60px;
              text-align: right;
              display: inline-block;
            }
          }
        }
      }
      .line {
        height: 180px;
      }
      .r {
        padding-top: 22px;
        @include fb();
        .robot-box {
          position: relative;
          left: -10px;
          .robot1 {
            width: 214px;
          }
          .direction {
            position: absolute;
            cursor: pointer;
          }
          .lt {
            width: 30px;
            bottom: 5px;
            left: 18%;
          }
          .rt {
            width: 30px;
            bottom: 5px;
            right: 20%;
          }
          .turnR {
            width: 55px;
            top: 96px;
            left: 59%;
            margin-left: -60px;
          }
          .turnL {
            width: 55px;
            top: 60px;
            left: 48%;
          }
          .ptzD {
            width: 23px;
            top: 25px;
            left: 45px;
          }
          .ptzU {
            width: 23px;
            top: 0px;
            left: 45px;
          }
          .turnLP {
            width: 23px;
            top: -25px;
            left: 79px;
          }
          .turnRP {
            width: 23px;
            top: -25px;
            right: 80px;
          }
          .toU {
            width: 14px;
            top: 53px;
            right: 137px;
            margin-left: 7px;
          }
          .toD {
            width: 14px;
            top: 54px;
            right: 65px;
            margin-left: 7px;
          }
        }
        .control-panel {
          width: 135px;
          height: 162px;
          background: url('~@/assets/image/device/direction.png') center no-repeat;
          background-size: contain;
          position: relative;
          .oricl {
            width: 48px;
            height: 0;
            border-width: 0 15px 37px 15px;
            border-style: none solid solid;
            border-color: transparent transparent transparent;
            position: absolute;
            cursor: pointer;
            &.front {
              top: 2px;
              left: 44px;
              transform: rotate(180deg);
            }
            &.leftFront {
              top: 26px;
              left: 10px;
              transform: rotate(140deg);
            }
            &.left {
              top: 62px;
              left: 0px;
              transform: rotate(90deg);
            }
            &.leftBack {
              top: 101px;
              left: 11px;
              transform: rotate(45deg);
            }
            &.back {
              bottom: 2px;
              left: 44px;
              transform: rotate(0deg);
            }
            &.rightBack {
              top: 101px;
              right: 11px;
              transform: rotate(-45deg);
            }
            &.right {
              top: 62px;
              right: 0px;
              transform: rotate(-90deg);
            }
            &.rightFront {
              top: 26px;
              right: 10px;
              transform: rotate(220deg);
            }
          }
        }
      }
    }
  }
  .canvasDiv {
    position: absolute;
    width: 100%;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    overflow: hidden;
  }
  .bg {
    position: absolute;
    width: 100%;
    height: 100%;
    background: black;
    opacity: 0.5;
    top: 0;
    left: 0;
    z-index: 2;
  }
  .img {
    position: absolute;
    width: 100%;
    height: 200px;
    top: 0;
    left: 0;
    z-index: 3;
    user-select: none;
  }
  .mouseDiv {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 10;
  }
  .canvas {
    width: 100%;
  }
  .vue-cropper {
    background: none;
  }
}
</style>
<style>
.cropper-crop {
  cursor: url('~@assets/image/cursor2.png') 16 16, crosshair !important;
}
</style>
