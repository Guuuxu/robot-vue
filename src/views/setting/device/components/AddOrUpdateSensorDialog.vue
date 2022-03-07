<template>
  <el-dialog
    class="add-sensor-dialog"
    :title="title"
    :visible.sync="isVisible"
    width="80%"
    append-to-body
    :close-on-click-modal="false"
    :before-close="cancel"
  >
    <el-row :gutter="10" type="flex">
      <el-col :span="24">
        <el-card class="sensor-info-card">
          <div slot="header" class="clearfix">
            <span>测点信息录入</span>
          </div>
          <el-form ref="sensorForm" :model="sensorForm" label-width="80px" inline :rules="sensorRules">
            <div class="base-info">
              <el-form-item label="站所ID:">{{ sensorForm.stationId }}</el-form-item>
              <el-form-item label="机柜名称:">{{ sensorForm.deviceName }}</el-form-item>
            </div>

            <el-form-item label="巡检顺序" prop="checkOrder">
              <el-input class="common-input" v-model="sensorForm.checkOrder" />
            </el-form-item>
            <el-form-item label="测点名称" prop="sensorName">
              <el-input class="common-input" v-model="sensorForm.sensorName" />
            </el-form-item>
            <el-form-item label="测点类型" prop="sensorTypeArr">
              <el-cascader :props="props" v-model="sensorForm.sensorTypeArr"></el-cascader>
            </el-form-item>
            <el-form-item label="算法类型" prop="checkTypeArr">
              <el-cascader :props="{ value: 'deviceId' }" v-model="sensorForm.checkTypeArr" :options="checkTypeOption"></el-cascader>
            </el-form-item>
            <el-form-item label="单位名称" prop="unit">
              <el-input class="common-input" v-model="sensorForm.unit" />
            </el-form-item>
            <el-form-item label="量程">
              <el-input class="number-input" v-model="sensorForm.minValue" placeholder="最小值"></el-input>-
              <el-input class="number-input" v-model="sensorForm.maxValue" placeholder="最大值"></el-input>
            </el-form-item>
            <el-form-item label="刻度间隔" prop="intervalVal">
              <el-input class="number-input" v-model="sensorForm.intervalVal" />
            </el-form-item>
          </el-form>
          <div class="compare">
            <el-checkbox v-model="checked">与上次巡检作比较</el-checkbox>
          </div>
          <div class="warning-wrap mt10">
            <el-form :model="warningForm" ref="warningForm" label-width="80px">
              <el-form-item label="告警级别" prop="warningLevel" :rules="warningRules">
                <el-select class="common-input" v-model="warningForm.warningLevel">
                  <el-option v-for="dict in warningOption" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item class="range-item" label="仪表量程" prop="warningLessVal" :rules="warningLessValRules">
                <el-input class="common-input" v-model="warningForm.warningLessVal" placeholder="最小值" />
              </el-form-item>
              <el-form-item class="range-split">|</el-form-item>
              <el-form-item prop="warningGreatVal" :rules="warningGreatValRules">
                <el-input class="common-input" v-model="warningForm.warningGreatVal" placeholder="最大值" />
              </el-form-item>
              <el-form-item label="整定值" prop="setting">
                <el-input class="common-input" v-model="warningForm.setting" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleAddWarning" size="mini">添加</el-button>
              </el-form-item>
            </el-form>
            <el-divider direction="vertical" class="line" />
            <el-table :data="warningData" class="warning-table">
              <el-table-column
                label="告警级别"
                align="center"
                prop="warningLevel"
                :formatter="warningLevelFormat"
                :show-overflow-tooltip="true"
              />
              <el-table-column label="仪表量程" align="center" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                  {{ scope.row.warningLessVal }} ~
                  {{ scope.row.warningGreatVal }}
                </template>
              </el-table-column>
              <el-table-column label="整定值" align="center" prop="setting" :show-overflow-tooltip="true" />
              <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                  <el-popconfirm class="icon-delete-pop" title="确定删除这条告警吗？" @confirm="handleDelete(scope.row)">
                    <el-button size="mini" type="text" icon="el-icon-delete" slot="reference"></el-button>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>
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
import { mapGetters } from 'vuex'
import { getTaskStatus } from '@/api/inspect'
import { getSensorTypeList, getSensorAdd, getSensorUpdate, getSensorTreeList } from '@/api/setting/sensor'
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
      this.warningForm = {}
      this.warningData = []
      this.sensorForm = {}
      if (val) {
        const row = JSON.parse(JSON.stringify(this.row))
        if (row?.rsi) {
          this.sensorForm = row.rsi
          this.sensorForm.sensorTypeArr = [row.rsi.sensorType, row.rsi.sensorTypeDetail]
          this.sensorForm.checkTypeArr = [row.rsi.objectParent, row.rsi.algType]
          this.warningOption.forEach((element, index) => {
            this.warningData.push({
              warningLevel: index + 1,
              warningLessVal: row.rdi[`warning${index + 1}LessVal`],
              warningGreatVal: row.rdi[`warning${index + 1}GreatVal`],
              settingVal: row.rdi[`setting${index + 1}Val`]
            })
          })
          this.robotSensorDetailInfo = row.rdi
          this.imageUrl = this.robotSensorDetailInfo.imageUrl
            ? this.robotSensorDetailInfo.imageUrl
            : this.robotSensorDetailInfo.ovImageUrl
            ? this.robotSensorDetailInfo.ovImageUrl
            : this.defaultImgUrl
          // 将当前位置信息更新给当前测点
          if (this.isUpdateSensor) {
            // 设备抓图
            if (this?.secondStatus?.sensorId) {
              for (const key in this.secondStatus) {
                this.robotSensorDetailInfo[key] = this.secondStatus[key]
              }
            } else {
              // 只全景抓图
              for (const key in this.firstStatus) {
                this.robotSensorDetailInfo[key] = this.firstStatus[key]
              }
            }
          }
        } else {
          this.robotSensorDetailInfo = this.secondStatus
          // 设备抓图
          if (this?.secondStatus?.sensorId) {
            this.robotSensorDetailInfo = this.secondStatus
          } else {
            // 只全景抓图
            this.robotSensorDetailInfo = this.firstStatus
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
    const validateRange = (rule, value, callback) => {
      if (this.sensorForm.sensorType == 1 || this.sensorForm.sensorType == 2 || this.sensorForm.sensorType == 3) {
        if (!this.sensorForm.minValue) {
          callback(new Error('请输入量程最小值'))
        } else if (!this.sensorForm.maxValue) {
          callback(new Error('请输入量程最大值'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const validateWarning = (rule, value, callback) => {
      if (this.sensorForm.sensorType == 1 || this.sensorForm.sensorType == 2 || this.sensorForm.sensorType == 3) {
        if (!this.warningData.length) {
          callback(new Error('请添加告警信息'))
        } else {
          if (this.warningData.findIndex(item => item.warningLevel === '1') < 0) {
            callback(new Error('请添加普通告警'))
          } else if (this.warningData.findIndex(item => item.warningLevel === '2') < 0) {
            callback(new Error('请添加严重告警'))
          } else if (this.warningData.findIndex(item => item.warningLevel === '3') < 0) {
            callback(new Error('请添加紧急告警'))
          } else {
            callback()
          }
        }
      }

      callback()
    }
    const validateWarningLessVal = (rule, value, callback) => {
      if (!value) {
        if (this.sensorForm.sensorType == 1 || this.sensorForm.sensorType == 2 || this.sensorForm.sensorType == 3) {
          callback(new Error('请输入最小量程值'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const validateWarningGreatVal = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入最大量程值'))
      } else {
        callback()
      }
    }
    return {
      // 选择框动态加载测点类型
      props: {
        lazy: true,
        async lazyLoad(node, resolve) {
          const { level } = node
          const res = await getSensorTypeList(node.data ? node.data.value : 0)
          let nodes = res.data.map(item => {
            return {
              value: item.sensorTypeId,
              label: item.sensorTypeName,
              leaf: level >= 1
            }
          })
          // 通过调用resolve将子节点数据返回，通知组件数据加载完成
          resolve(nodes)
        }
      },
      imageUrl: '', //测点图片
      defaultImgUrl: require('@/assets/image/device/deletion.jpg'), // 测点默认图
      sensorForm: {
        deviceId: '',
        deviceName: ''
      },
      checkTypeOption: [], // 算法类型选项
      sensorRules: {
        checkOrder: [{ required: true, message: '请输入测点顺序', trigger: 'blur' }],
        sensorName: [{ required: true, message: '请输入测点名称', trigger: 'blur' }],
        sensorTypeArr: [{ required: true, message: '请选择测点类型', trigger: 'change' }],
        checkTypeArr: [{ required: true, message: '请选择算法类型', trigger: 'change' }],
        unit: [{ required: true, message: '请输入单位名称', trigger: 'blur' }],
        range: [{ validator: validateRange, trigger: 'blur', required: true }]
      },
      loading: false,
      checked: false,
      warningForm: {},
      robotSensorDetailInfo: {},
      sensorTypeList: [],
      warningOption: [],
      warningData: [],
      warningRules: [{ trigger: 'blur', validator: validateWarning }],
      warningLessValRules: [{ trigger: 'blur', validator: validateWarningLessVal }],
      warningGreatValRules: [{ trigger: 'blur', validator: validateWarningGreatVal }],
      lightCameraInfo: {},
      focusModeloptions: [],
      isUpdateSensor: false // 是否更新测点实时信息
    }
  },
  created() {
    this.loadSensorTypeList()
    this.loadDicts()
  },
  mounted() {
    this.loadAlgOption()
    // 可见光相机信息
    this.$eventBus.$on('onPostLightCamera', val => {
      this.lightCameraInfo = val
      this.isUpdateSensor = true
    })
  },
  methods: {
    // 获取测点类型
    async loadSensorTypeList() {
      const res = await getSensorTypeList()
      this.sensorTypeList = res.data
    },
    // 字典查询
    async loadDicts() {
      this.getDicts('robot_warning_level').then(response => {
        this.warningOption = response.data
      })
      const res = await this.getDicts('robot_focus_mode')
      this.focusModeloptions = res.data
    },
    // 获取实时状态
    // async fetchTaskStatus() {
    //   const res = await getTaskStatus();
    //   this.robotSensorDetailInfo = res.data.rTPInfo;
    //   this.robotSensorDetailInfo.zoomVal = this.lightCameraInfo.zoomVal;
    //   this.robotSensorDetailInfo.focusVal = this.lightCameraInfo.focusVal;
    //   this.robotSensorDetailInfo.exposureVal = this.lightCameraInfo.exposureVal;
    //   this.robotSensorDetailInfo.focusMode = this.lightCameraInfo.focusMode;
    // },
    // 告警等级字典翻译
    warningLevelFormat(row, column) {
      return this.selectDictLabel(this.warningOption, row.warningLevel)
    },
    // 对焦模式字典翻译
    focusModelFormat(model) {
      return this.selectDictLabel(this.focusModeloptions, model)
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
    // 添加告警操作
    handleAddWarning() {
      const row = JSON.parse(JSON.stringify(this.warningForm))
      const index = this.warningData.findIndex(item => item.warningLevel === row.warningLevel)
      if (index > -1) {
        this.warningData.splice(index, 1, row)
      } else {
        if (row.warningGreatVal && row.warningLessVal) {
          //执行校验成功的相关操作
          this.warningData.push(row)
        } else {
          this.$refs.warningForm.validateField(['warningGreatVal', 'warningLessVal'])
        }
      }
    },
    // 删除告警
    handleDelete(row) {
      const index = this.warningData.findIndex(w => w.warningLevel === row.warningLevel)
      this.warningData.splice(index, 1)
    },
    // 提交
    submit() {
      const warningObj = {}
      this.warningData.map(item => {
        warningObj[`warning${item.warningLevel}LessVal`] = item.warningLessVal
        warningObj[`warning${item.warningLevel}GreatVal`] = item.warningGreatVal
      })

      this.$refs['sensorForm'].validate(valid => {
        if (valid) {
          this.sensorForm.sensorType = this.sensorForm.sensorTypeArr[0]
          this.sensorForm.sensorTypeDetail = this.sensorForm.sensorTypeArr[1]
          this.sensorForm.algType = this.sensorForm.checkTypeArr[1]
          if (this.sensorForm.sensorType == 1 || this.sensorForm.sensorType == 2 || this.sensorForm.sensorType == 3) {
            if (this.warningData.length === this.warningOption.length) {
              this.handleSubmit()
            } else {
              this.$refs['warningForm'].validateField('warningLevel')
            }
          } else {
            this.handleSubmit()
          }
        }
      })
    },
    async handleSubmit() {
      this.loading = true
      const form = {}
      const warningObj = {}

      form.sensorLevel = 2
      form.robotSensorInfo = {
        ...this.sensorForm
      }
      this.warningData.map(item => {
        warningObj[`warning${item.warningLevel}LessVal`] = item.warningLessVal
        warningObj[`warning${item.warningLevel}GreatVal`] = item.warningGreatVal
      })
      let imageUrl
      if (this.robotSensorDetailInfo.imageUrl && this.robotSensorDetailInfo.imageUrl != '') {
        imageUrl = this.robotSensorDetailInfo.imageUrl.split('/')
        imageUrl.splice(0, 3)
      } else {
        imageUrl = ''
      }

      const imageUrl_new = imageUrl ? '/' + imageUrl.join('/') : ''
      form.robotSensorDetailInfo = {
        ...this.robotSensorDetailInfo,
        ...warningObj,
        zoomVal: this.robotSensorDetailInfo.id ? this.robotSensorDetailInfo.zoomVal : this.secondStatus.zoomVal, //相机倍率值
        focusVal: this.robotSensorDetailInfo.id ? this.robotSensorDetailInfo.focusVal : this.secondStatus.focusVal, //相机焦距值
        exposureVal: this.robotSensorDetailInfo.id ? this.robotSensorDetailInfo.exposureVal : this.secondStatus.exposureVal, //相机曝光增益
        focusMode: this.robotSensorDetailInfo.id ? this.robotSensorDetailInfo.focusMode : this.secondStatus.exposureVal, //对焦模式
        imageUrl: imageUrl_new, //设备拍图url
        ovSteelOffset: this.robotSensorDetailInfo.id ? this.robotSensorDetailInfo.ovSteelOffset : this.firstStatus.steelOffset, //全景图磁钢片号
        ovLiftHeight: this.robotSensorDetailInfo.id ? this.robotSensorDetailInfo.ovLiftHeight : this.firstStatus.liftHeight, //ovLiftHeight
        ovLeftUdangle: this.robotSensorDetailInfo.id ? this.robotSensorDetailInfo.ovLeftUdangle : this.firstStatus.leftUdangle, //全景图左臂俯仰角度
        ovRightUdangle: this.robotSensorDetailInfo.id ? this.robotSensorDetailInfo.ovRightUdangle : this.firstStatus.rightUdangle, //全景图右臂俯仰角度
        ovRotationAngle: this.robotSensorDetailInfo.id ? this.robotSensorDetailInfo.ovRotationAngle : this.firstStatus.rotationAngle, //全景图旋转角度
        ovZoomVal: this.robotSensorDetailInfo.id ? this.robotSensorDetailInfo.ovZoomVal : this.firstStatus.zoomVal, //全景图相机倍率值
        ovFocusVal: this.robotSensorDetailInfo.id ? this.robotSensorDetailInfo.ovFocusVal : this.firstStatus.focusVal, //全景图相机焦距值
        ovImageUrl: this.robotSensorDetailInfo.id ? this.robotSensorDetailInfo.ovImageUrl : this.firstStatus.ovImageUrl, //全景图图片url
        distance: this.robotSensorDetailInfo.id ? this.robotSensorDetailInfo.distance : this.secondStatus.distance, //机器人到柜体距离全景图图片url全景图相机焦距值
        ovImageSelectX: this.robotSensorDetailInfo.id ? this.robotSensorDetailInfo.ovImageSelectX : this.secondStatus.ovImageSelectX, //全景选择框的x坐标
        ovImageSelectY: this.robotSensorDetailInfo.id ? this.robotSensorDetailInfo.ovImageSelectY : this.secondStatus.ovImageSelectY, //全景选择框的y坐标
        ovImageSelectWidth: this.robotSensorDetailInfo.id
          ? this.robotSensorDetailInfo.ovImageSelectWidth
          : this.secondStatus.ovImageSelectWidth, //全景选择框的宽度
        ovImageSelectHeight: this.robotSensorDetailInfo.id
          ? this.robotSensorDetailInfo.ovImageSelectHeight
          : this.secondStatus.ovImageSelectHeight //全景选择框的高度
      }
      if (!this.sensorForm?.id) {
        await getSensorAdd(form)
        this.loading = false
        this.msgSuccess('添加测点成功')
      } else {
        await getSensorUpdate(form)
        this.loading = false
        this.msgSuccess('编辑测点成功')
        this.isUpdateSensor = false
      }
      this.$emit('update:isVisible', false)
      this.$emit('update:visibleVideo', true)
      this.resetForm('sensorForm')
      this.resetForm('warningForm')
      this.$emit('onUpdate')
    },
    cancel() {
      this.$emit('update:isVisible', false)
      this.$emit('update:visibleVideo', true)
      this.resetForm('sensorForm')
      this.warningData = []
      this.resetForm('warningForm')
    }
  }
}
</script>

<style lang="scss" scoped>
.add-sensor-dialog {
  .el-row {
    align-items: stretch;
    min-height: 570px;
    height: 570px;
    flex-wrap: wrap;
  }
  .el-col {
    height: 100%;
  }
  .sensor-info-card {
    height: 100%;
    overflow-y: auto;
    .base-info {
      .el-form-item {
        margin-bottom: 10px;
      }
    }
    ::v-deep {
      .el-card__body {
        padding: 10px;
      }
      .el-form-item {
        margin-bottom: 18px;
      }
      .el-form-item__label {
        width: 80px;
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
    .common-input {
      width: 160px;
    }
    .number-input {
      width: 100px;
    }
    .compare {
      @include fb(center);
    }
    .warning-wrap {
      @include fb();
      .line {
        height: 180px;
      }
      .range-item.el-form-item {
        margin-bottom: 0;
      }
      .range-split {
        text-align: center;
        &.el-form-item {
          margin-bottom: 0;
        }
      }
      .warning-table {
        flex: 1;
        flex-grow: 1;
      }
      .common-input {
        width: 120px;
      }
    }
  }
  .dialog-footer {
    text-align: center;
    padding-top: 20px;
  }
  .sensor-status-card {
    height: 100%;
  }
  .right-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .sensor-pic-card {
    .sensorImg {
      height: 180px;
      width: 100%;
    }
  }
}
</style>
