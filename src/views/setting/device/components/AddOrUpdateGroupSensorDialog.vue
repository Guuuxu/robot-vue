<template>
  <el-dialog
    class="group-sensor-dialog"
    :title="title"
    :visible.sync="isVisible"
    width="750px"
    append-to-body
    :close-on-click-modal="false"
    :before-close="cancel"
  >
    <el-row :gutter="10" type="flex">
      <el-col :xs="24" :sm="24" :md="11" :lg="12" class="left-col">
        <el-card class="sensor-info-card">
          <div slot="header" class="clearfix">
            <span>测点信息录入</span>
          </div>
          <el-form ref="sensorForm" :model="sensorForm" label-width="80px" inline :rules="sensorRules">
            <el-form-item label="站所ID:">{{ sensorForm.stationId }}</el-form-item>
            <el-form-item label="测点名称" prop="sensorParentName">
              <el-input v-model="sensorForm.sensorParentName" />
            </el-form-item>
          </el-form>
        </el-card>
        <el-card class="sensor-status-card mt10">
          <div slot="header" class="clearfix">
            <span>实时状态显示</span>
          </div>
          <el-form :model="robotSensorParentDetailInfo">
            <el-form-item label="坐标X" prop="positionX">{{ robotSensorParentDetailInfo.positionX || 0 }}</el-form-item>
            <el-form-item label="坐标Y" prop="positionY">{{ robotSensorParentDetailInfo.positionY || 0 }}</el-form-item>
            <el-form-item label="水平角度" prop="ptzRotation">{{ robotSensorParentDetailInfo.ovPtzRotation || 0 }}</el-form-item>
            <el-form-item label="垂直角度" prop="ptzUdangle">{{ robotSensorParentDetailInfo.ovPtzUdangle || 0 }}</el-form-item>
            <el-form-item label="旋转角度" prop="rotationAngle">{{ robotSensorParentDetailInfo.rotationAngle || 0 }}</el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" class="right-col">
        <el-card class="sensor-pic-card">
          <div slot="header" class="clearfix">
            <span>测点图片</span>
          </div>
          <div class="sensor-pic-body">
            <img :src="imageUrl" class="sensorImg" />
          </div>
        </el-card>
        <el-card class="sensor-light-camera mt10">
          <div slot="header" class="clearfix">
            <span>可见光相机</span>
          </div>
          <div class="sensor-light-body">
            <el-form>
              <el-form-item label="倍率:" prop="zoomVal">{{ robotSensorParentDetailInfo.zoomVal }}</el-form-item>
              <el-form-item label="焦距:" prop="lightCameraIp">{{ robotSensorParentDetailInfo.focusVal }}</el-form-item>

              <el-form-item label="补光灯">
                <el-switch v-model="sensorForm.isExposure" active-color="#13ce66" active-value="1" inactive-value="0"></el-switch>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="dialog-footer">
      <el-button type="primary" @click="submit" :loading="loading">保 存</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
let id = 0
import { mapGetters } from 'vuex'
import { getTaskStatus } from '@/api/inspect'
import { getSensorTypeList, getSensorAdd, getSensorUpdate } from '@/api/setting/sensor'
export default {
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    visibleVideo: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    row: {
      type: Object,
      default: () => {}
    },
    parentData: {
      type: Object,
      default: () => {}
    },
    firstStatus: {
      type: Object,
      default: () => {}
    },
    secondStatus: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    ...mapGetters(['stationId'])
  },
  watch: {
    isVisible(val) {
      this.sensorForm = {}
      if (val) {
        const row = JSON.parse(JSON.stringify(this.row))
        if (row?.rspdi) {
          this.sensorForm = row.rspi
          this.robotSensorParentDetailInfo = row.rspdi
          this.imageUrl = this.robotSensorParentDetailInfo.imageUrl
            ? this.robotSensorParentDetailInfo.imageUrl
            : this.robotSensorParentDetailInfo.ovImageUrl
            ? this.robotSensorParentDetailInfo.ovImageUrl
            : this.defaultImgUrl
          // 将当前位置信息更新给当前测点
          if (this.isUpdateSensor) {
            // 设备抓图
            if (this?.secondStatus?.sensorId) {
              for (const key in this.secondStatus) {
                this.robotSensorParentDetailInfo[key] = this.secondStatus[key]
              }
            } else {
              // 只全景抓图
              for (const key in this.firstStatus) {
                this.robotSensorParentDetailInfo[key] = this.firstStatus[key]
              }
            }
          }
        } else {
          this.robotSensorParentDetailInfo = this.secondStatus
          // 设备抓图
          if (this?.secondStatus?.sensorId) {
            this.robotSensorParentDetailInfo = this.secondStatus
          } else {
            // 只全景抓图
            this.robotSensorParentDetailInfo = this.firstStatus
          }
          this.imageUrl = this.secondStatus.imageUrl
            ? this.secondStatus.imageUrl
            : this.firstStatus.overImgAbsolutePath
            ? this.firstStatus.overImgAbsolutePath
            : this.defaultImgUrl
          this.sensorForm.deviceId = this.parentData.deviceId
          this.sensorForm.deviceName = this.parentData.lable
        }
        this.sensorForm.stationId = this.stationId
      }
    }
  },
  data() {
    return {
      imageUrl: '', //测点图片
      defaultImgUrl: require('@/assets/image/device/deletion.jpg'), // 测点默认图
      sensorForm: {
        deviceId: '',
        deviceName: ''
      },
      sensorRules: {
        checkOrder: [{ required: true, message: '请输入测点顺序', trigger: 'blur' }],
        sensorName: [{ required: true, message: '请输入测点名称', trigger: 'blur' }]
      },
      loading: false,
      checked: false,
      robotSensorParentDetailInfo: {},
      lightCameraInfo: {},
      focusModeloptions: [],
      isUpdateSensor: false // 是否更新测点实时信息
    }
  },
  created() {
    this.loadDicts()
  },
  mounted() {
    // 可见光相机信息
    this.$eventBus.$on('onPostLightCamera', val => {
      this.lightCameraInfo = val
      this.isUpdateSensor = true
    })
  },
  methods: {
    // 字典查询
    async loadDicts() {
      const res = await this.getDicts('robot_focus_mode')
      this.focusModeloptions = res.data
    },
    // 对焦模式字典翻译
    focusModelFormat(model) {
      return this.selectDictLabel(this.focusModeloptions, model)
    },
    // 提交
    submit() {
      this.$refs['sensorForm'].validate(valid => {
        if (valid) {
          this.handleSubmit()
        }
      })
    },
    async handleSubmit() {
      this.loading = true
      const form = {}
      form.sensorLevel = 1
      form.robotSensorParentInfo = {
        ...this.sensorForm
      }
      let imageUrl
      if (this.robotSensorParentDetailInfo.imageUrl && this.robotSensorParentDetailInfo.imageUrl != '') {
        imageUrl = this.robotSensorParentDetailInfo.imageUrl.split('/')
        imageUrl.splice(0, 3)
      } else {
        imageUrl = ''
      }

      const imageUrl_new = imageUrl ? '/' + imageUrl.join('/') : ''
      form.robotSensorParentDetailInfo = {
        ...this.robotSensorParentDetailInfo,
        zoomVal: this.robotSensorParentDetailInfo.id ? this.robotSensorParentDetailInfo.zoomVal : this.secondStatus.zoomVal, //相机倍率值
        focusVal: this.robotSensorParentDetailInfo.id ? this.robotSensorParentDetailInfo.focusVal : this.secondStatus.focusVal, //相机焦距值
        exposureVal: this.robotSensorParentDetailInfo.id ? this.robotSensorParentDetailInfo.exposureVal : this.secondStatus.exposureVal, //相机曝光增益
        focusMode: this.robotSensorParentDetailInfo.id ? this.robotSensorParentDetailInfo.focusMode : this.secondStatus.exposureVal, //对焦模式
        imageUrl: imageUrl_new, //设备拍图url
        ovLiftHeight: this.robotSensorParentDetailInfo.id ? this.robotSensorParentDetailInfo.ovLiftHeight : this.firstStatus.liftHeight, //ovLiftHeight
        ovLeftUdangle: this.robotSensorParentDetailInfo.id ? this.robotSensorParentDetailInfo.ovLeftUdangle : this.firstStatus.leftUdangle, //全景图左臂俯仰角度
        ovRightUdangle: this.robotSensorParentDetailInfo.id
          ? this.robotSensorParentDetailInfo.ovRightUdangle
          : this.firstStatus.rightUdangle, //全景图右臂俯仰角度
        ovRotationAngle: this.robotSensorParentDetailInfo.id
          ? this.robotSensorParentDetailInfo.ovRotationAngle
          : this.firstStatus.rotationAngle, //全景图旋转角度
        ovZoomVal: this.robotSensorParentDetailInfo.id ? this.robotSensorParentDetailInfo.ovZoomVal : this.firstStatus.zoomVal, //全景图相机倍率值
        ovFocusVal: this.robotSensorParentDetailInfo.id ? this.robotSensorParentDetailInfo.ovFocusVal : this.firstStatus.focusVal, //全景图相机焦距值
        ovImageUrl: this.robotSensorParentDetailInfo.id ? this.robotSensorParentDetailInfo.ovImageUrl : this.firstStatus.ovImageUrl, //全景图图片url
        distance: this.robotSensorParentDetailInfo.id ? this.robotSensorParentDetailInfo.distance : this.secondStatus.distance, //机器人到柜体距离全景图图片url全景图相机焦距值
        ovImageSelectX: this.robotSensorParentDetailInfo.id
          ? this.robotSensorParentDetailInfo.ovImageSelectX
          : this.secondStatus.ovImageSelectX, //全景选择框的x坐标
        ovImageSelectY: this.robotSensorParentDetailInfo.id
          ? this.robotSensorParentDetailInfo.ovImageSelectY
          : this.secondStatus.ovImageSelectY, //全景选择框的y坐标
        ovImageSelectWidth: this.robotSensorParentDetailInfo.id
          ? this.robotSensorParentDetailInfo.ovImageSelectWidth
          : this.secondStatus.ovImageSelectWidth, //全景选择框的宽度
        ovImageSelectHeight: this.robotSensorParentDetailInfo.id
          ? this.robotSensorParentDetailInfo.ovImageSelectHeight
          : this.secondStatus.ovImageSelectHeight //全景选择框的高度
      }
      if (!this.sensorForm?.id) {
        try {
          await getSensorAdd(form)
          this.loading = false
          this.msgSuccess('添加测点成功')
        } catch (error) {
          this.loading = false
        }
      } else {
        try {
          await getSensorUpdate(form)
          this.loading = false
          this.msgSuccess('编辑测点成功')
          this.isUpdateSensor = false
        } catch (error) {
          this.loading = false
        }
      }
      this.$emit('update:isVisible', false)
      this.$emit('update:visibleVideo', true)

      this.$emit('onUpdate')
    },
    cancel() {
      this.$emit('update:isVisible', false)
      this.$emit('update:visibleVideo', true)
      this.resetForm('sensorForm')
    }
  }
}
</script>

<style lang="scss" scoped>
.group-sensor-dialog {
  .el-row {
    align-items: stretch;
    min-height: 490px;
    height: 490px;
    flex-wrap: wrap;
    justify-content: space-around;
    ::v-deep {
      .el-card__body {
        padding: 10px;
      }
      .el-form-item {
        margin-bottom: 10px;
      }
      .el-form-item__label {
        width: 90px;
        line-height: 30px;
      }
      .el-form-item__content {
        line-height: 30px;
      }
      .el-input__inner {
        height: 30px;
        line-height: 30px;
      }
    }

    .el-col {
      height: 100%;
    }
    .left-col {
      overflow-y: auto;
      .sensor-info-card {
        .el-form-item {
          margin-bottom: 20px;
        }
      }
    }
  }
  .dialog-footer {
    text-align: center;
    padding-top: 20px;
  }
  .right-col {
    display: flex;
    flex-direction: column;
  }
  .sensor-pic-card {
    .sensorImg {
      height: 180px;
      width: 100%;
    }
  }
}
</style>
