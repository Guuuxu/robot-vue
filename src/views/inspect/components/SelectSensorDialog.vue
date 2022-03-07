<template>
  <el-dialog
    class="select-sensor-dialog"
    :title="title"
    :visible.sync="isVisible"
    width="70%"
    append-to-body
    :close-on-click-modal="false"
    :before-close="cancel"
  >
    <el-form :model="form" ref="form" label-width="100px" :rules="rules">
      <el-form-item label="定点巡检" prop="fixedSensor" v-show="inspectionType === '2'">
        <!-- 定点巡检选择框 -->
        <el-cascader v-model="form.fixedSensor" class="ml10 cascader" :options="treeList" :props="props" collapse-tags clearable></el-cascader>
      </el-form-item>
      <el-form-item label="定制巡检" prop="sensorType" v-show="inspectionType === '3'">
        <!-- 定制巡检选择框 -->
        <el-cascader
          v-model="form.sensorType"
          class="ml10 cascader"
          :options="sensorTypeList"
          :props="{ multiple: true }"
          collapse-tags
          clearable
        ></el-cascader>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button type="primary" @click="submit" :loading="loading">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
    <div class="task-list">
      <div class="task-tip">
        前5次任务记录,
        <span style="color:red">可直接再次巡检：</span>
      </div>
      <el-table :data="taskList" class="task-table mt10" height="300px" empty-text="数据生成中...">
        <el-table-column label="序号" type="index" align="center" prop="index" width="50" />
        <el-table-column label="任务名称" prop="taskId" align="center"></el-table-column>
        <el-table-column label="检测内容" prop="name" align="center">
          <template slot-scope="scope">
            <!-- <el-cascader :options="scope.row.dataVo" :props="{value:'id',children: 'mapList'}"></el-cascader> -->
            <el-menu default-active class="el-menu-demo" mode="horizontal" active-text-color="#ffd04b">
              <el-submenu :index="scope.row.id">
                <template slot="title">查看测点</template>

                <el-submenu :index="item.id" v-for="item in scope.row.dataVo" :key="item.id">
                  <template slot="title">{{item.label}}</template>
                  <el-menu-item :index="child.deviceId" v-for="child in item.mapList" :key="child.id">{{child.label}}</el-menu-item>
                </el-submenu>
              </el-submenu>
            </el-menu>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-caret-right" @click="handleRun(scope.row.dataVo)">再次巡检</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { getDeviceTreeList } from '@/api/setting/device'
import { getSensorListBySensorType } from '@/api/setting/sensor'
import { startStationTask, getInspectionList } from '@/api/inspect'
export default {
  name: 'SelectSensorDialog',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapGetters(['stationId'])
  },
  watch: {
    isVisible(val) {
      if (val) {
        this.loadInspectionList()
        this.loadDeviceTreeList()
        this.loadSensorTypeList()
      }
    }
  },
  data() {
    const validFixedSensor = (rule, value, callback) => {
      if (this.inspectionType === '2') {
        if (!value) {
          callback(new Error('请选择巡检内容'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    const validSensorType = (rule, value, callback) => {
      if (this.inspectionType === '3') {
        if (!value) {
          callback(new Error('请选择巡检内容'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    return {
      props: { multiple: true, value: 'deviceId', label: 'label' },
      form: {
        fixedSensor: [],
        sensorType: []
      },
      inspectionType: '',
      // 表单校验
      rules: {
        fixedSensor: [{ validator: validFixedSensor, trigger: 'blur' }],
        sensorType: [{ validator: validSensorType, trigger: 'blur' }]
      },
      treeList: [], // 定点巡检option
      sensorTypeList: [], // 定制巡检option
      loading: false,
      taskList: []
    }
  },
  created() {},
  methods: {
    // 定点巡检tree
    async loadDeviceTreeList() {
      const res = await getDeviceTreeList()
      // this.treeList = res.data
      this.treeList = this.parseTreeList(res.data)
    },
    // 树形数据递归处理
    parseTreeList(data) {
      return data.map(item => {
        if (item.children.length) {
          if (item.sensorLevel === '1') {
            delete item.children
          } else {
            this.parseTreeList(item.children)
          }
          return item
        } else {
          delete item.children
          return item
        }
      })
    },
    // 获取测点类型列表
    async loadSensorTypeList() {
      const res = await getSensorListBySensorType({
        stationId: this.stationId
      })
      const list = [] // 一级柜体
      const deviceList = res.data.filter(item => item.device_id) // 存在柜体
      res.data.forEach(element => {
        if (!list.map(i => i.value).includes(element.sensor_type_id)) {
          list.push({
            value: element.sensor_type_id,
            label: element.sensor_type_name
          })
        }
      })
      // 归类同一类型的柜体
      const newlist = list.map(item => {
        // 同一测点类型
        const filterDevice = deviceList.filter(d => d.sensor_type_id === item.value)
        const arr = []
        filterDevice.map((d, index) => {
          if (!arr.map(i => i.value).includes(d.device_id)) {
            arr.push({
              value: d.device_id,
              label: d.device_name
            })
            item.children = arr
          }
        })
        return item
      })
      // 筛选测点
      let filterSenSor = []
      for (let i = 0; i < newlist.length; i++) {
        const element = newlist[i]
        const filterDevice = res.data.filter(item => item.sensor_type_id == element.value)
        if (element?.children?.length) {
          for (let j = 0; j < element.children.length; j++) {
            const child = element.children[j] // 机柜
            filterSenSor = filterDevice.filter(item => item.device_id == child.value)
            const arr = []
            filterSenSor.map(f => {
              if (f.device_id === child.value) {
                arr.push({
                  value: f.sensor_id,
                  label: f.sensor_name
                })
                child.children = arr
              }
            })
          }
        }
      }
      this.sensorTypeList = newlist
    },
    // 获取任务记录
    async loadInspectionList() {
      const res = await getInspectionList(this.inspectionType)
      this.taskList = res.data
    },
    handleSetSpectionType(type) {
      this.inspectionType = type
    },
    // 执行历史任务
    handleRun(rows) {
      const self = this
      this.$confirm('确认要立即执行一次任务吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function () {
          const sensorIds = []
          rows.forEach(row => {
            row.mapList.forEach(item => {
              sensorIds.push(item.deviceId)
            })
          })
          return startStationTask({
            list: sensorIds.join(','),
            taskType: self.inspectionType
          })
        })
        .then(() => {
          self.msgSuccess('执行成功')
          self.$emit('onUpdate', self.inspectionType)
          self.cancel()
        })
    },
    submit() {
      this.$refs['form'].validate(async valid => {
        if (valid) {
          let ids = []
          let echoValue = []
          // 循环数组查找测点id
          if (this.inspectionType == 2) {
            echoValue = this.form.fixedSensor
          } else {
            echoValue = this.form.sensorType
          }
          for (const value of echoValue) {
            ids.push(value[value.length - 1])
          }
          await startStationTask({
            list: ids.join(','),
            taskType: this.inspectionType
          })
          this.msgSuccess('巡检任务已下发')
          this.$emit('onUpdate', this.inspectionType)
          this.cancel()
        }
      })
    },
    cancel() {
      this.$emit('update:isVisible', false)
      this.resetForm('form')
    }
  }
}
</script>

<style lang="scss" scoped>
/** IE11 兼容样式**/
@media screen and (-ms-high-contrast: none) {
  .cascader {
    ::v-deep .el-tag {
      & > span {
        flex: auto;
      }
    }
  }
}
.task-list {
  padding: 0 20px;
  margin-top: 30px;
  .task-tip {
    padding: 5px 0;
  }
  .task-table {
    font-size: 12px;
    ::v-deep {
      .el-menu.el-menu--horizontal {
        border: none;
      }
      .el-menu--horizontal > .el-submenu {
        float: none;
        .el-submenu__title {
          height: 40px;
          line-height: 40px;
        }
      }
    }
  }
}
.dialog-footer {
  padding-left: 20px;
}
</style>
