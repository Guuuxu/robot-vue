<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :span="6">
        当前站所：
        <strong>{{ stationName }}</strong>
      </el-col>
      <el-col :span="6">温度：{{ detail.temperature || "" }} ℃</el-col>
      <el-col :span="6">已处理告警数：{{ detail.handledWarningNum }}</el-col>
      <el-col :span="6">未处理告警数：{{ detail.warningNum }}</el-col>
    </el-row>
    <el-row :gutter="20" class="row-mid">
      <el-col :span="12">
        <el-card class="site-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>当前站点测点：{{ totalSensorNum }}</span>
          </div>
          <div class="site-body">
            <bar-chart :chart-data="barChartData" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="warning-card" shadow="hover">
          <div slot="header" class="head">
            <span>报警分析</span>
            <span>
              <el-select class="warning-select" v-model="queryParams.sensorTypeId" size="mini" @change="changeSensor">
                <el-option v-for="dict in sensorOption" :key="dict.sensorTypeId" :label="dict.sensorTypeName" :value="dict.sensorTypeId" />
              </el-select>
            </span>
          </div>
          <div class="warning-body">
            <line-chart :chart-data="lineChartData" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 任务列表 -->
    <el-row :gutter="20" class="row-foot">
      <el-col :span="24">
        <el-card class="task-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>任务列表</span>
            <span style="float: right; padding: 3px 0">累计执行任务：{{ detail.taskNum }}次</span>
          </div>
          <div class="task-body">
            <el-table :data="detail.taskList">
              <el-table-column label="任务名称" align="center" prop="taskName"></el-table-column>
              <el-table-column label="任务类型" align="center" :formatter="taskTypeFormat"></el-table-column>
              <el-table-column label="开始时间" align="center" prop="startTime"></el-table-column>
              <el-table-column label="结束时间" align="center" prop="endTime"></el-table-column>
              <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat"></el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Cookies from 'js-cookie'
import BarChart from './dashboard/BarChart'
import LineChart from './dashboard/LineChart'
import { getIndexData } from '@/api/dashboard'
import { getRobotConfig } from '@/api/setting/robot'
import { getSiteIsUsing } from '@/api/setting/site'

export default {
  name: 'index',
  components: { BarChart, LineChart },
  data() {
    return {
      value1: false,
      detail: {},
      xData: [],
      series: [],
      barChartData: {
        xData: [],
        yData: []
      },
      lineChartData: {
        xData: [],
        yData: []
      },
      queryParams: {
        sensorTypeId: ''
      },
      sensorOption: [],
      taskOption: [],
      obj: {
        sensorType: '',
        sensorName: '',
        unit: ''
      }
    }
  },
  computed: {
    ...mapState('robot', ['stationName']),
    totalSensorNum() {
      return (
        this.detail.sensorTypeNumList &&
        this.detail.sensorTypeNumList.reduce((current, acc) => {
          return current + acc.sensorNum
        }, 0)
      )
    }
  },
  // 父组件中返回要传给下级的数据
  provide() {
    return {
      obj: this.obj
    }
  },
  activated() {
    this.loadIndexData()
    this.loadDicts()
    this.loadRobotConfig()
  },
  methods: {
    // 图表数据
    async loadIndexData() {
      const res = await getIndexData(this.queryParams)
      this.detail = res.data
      this.sensorOption = res.data.sensorTypeNumList
      this.sensorOption.unshift({
        sensorNum: 0,
        sensorTypeId: '',
        sensorTypeName: '全部'
      })
      this.barChartData.xData = this.detail.sensorTypeNumList.map(item => item.sensorTypeName)
      this.barChartData.yData = this.detail.sensorTypeNumList.map(item => item.sensorNum)
      this.lineChartData.yData = this.detail.sensorTypeWarnNumList.map(item => item.warningNum)
      this.lineChartData.xData = this.detail.sensorTypeWarnNumList.map(item => item.MONTHWARN)
      // 导航地图信息
      const res2 = await getSiteIsUsing()
      const originPoint = [res2.data[0].originX, res2.data[0].originY]
      const originZeroPoint = [res2.data[0].originZeroX, res2.data[0].originZeroY]
      this.$storage.setItem('scaling', JSON.stringify(res2.data[0].scaling))
      this.$storage.setItem('originPoint', JSON.stringify(originPoint))
      this.$storage.setItem('originZeroPoint', JSON.stringify(originZeroPoint))
      this.$storage.setItem('pxToPos', JSON.stringify(res2.data[0].resolution))
    },
    async changeSensor() {
      const res = await getIndexData(this.queryParams)
      this.lineChartData.yData = res.data.sensorTypeWarnNumList.map(item => item.warningNum)
      this.lineChartData.xData = res.data.sensorTypeWarnNumList.map(item => item.MONTHWARN)
    },
    loadDicts() {
      this.getDicts('robot_inspection_type').then(response => {
        this.taskOption = response.data
      })
    },
    // 机器人配置
    async loadRobotConfig() {
      const res = await getRobotConfig()
      const configData = res.rows[0]
      // 红外
      var redCameraData = []
      redCameraData[0] = configData.redCameraIp
      redCameraData[1] = configData.redCameraPort * 1
      redCameraData[2] = configData.redCameraUser
      redCameraData[3] = configData.redCameraPassword
      this.$storage.setItem('infraredMode', JSON.stringify(redCameraData))
      // Cookies.set("infraredMode", JSON.stringify(redCameraData));

      // 可见光
      var canSeeData = []
      canSeeData[0] = configData.lightCameraIp
      canSeeData[1] = configData.lightCameraPort * 1
      canSeeData[2] = configData.lightCameraUser
      canSeeData[3] = configData.lightCameraPassword
      this.$storage.setItem('lightMode', JSON.stringify(canSeeData))
      // Cookies.set("lightMode", JSON.stringify(canSeeData));

      const lightLocation = []
      lightLocation[0] = configData.lightPositionX
      lightLocation[1] = configData.lightPositionY
      lightLocation[2] = configData.lightCameraHorizontalAngle
      this.$storage.setItem('lightLocation', lightLocation)
    },
    // 任务类型字典翻译
    taskTypeFormat(row, column) {
      return this.selectDictLabel(this.taskOption, row.taskType)
    },
    statusFormat(row) {
      let name = ''
      switch (row.status) {
        case '1':
          name = '执行中'
          break
        case '2':
          name = '已停止'
          break
        case '3':
          name = '已暂停'
          break
        case '4':
          name = '已完成'
          break
        case '5':
          name = '异常结束'
          break
        case '6':
          name = '计算中'
          break
        case '0':
          name = '未开始'
          break
        default:
          name = '执行中'
          break
      }

      return name
    }
  }
}
</script>

<style scoped lang="scss">
.home {
  .row-mid {
    margin-top: 20px;
    margin-bottom: 20px;
  }
  .warning-card {
    .head {
      @include fb();
    }
    .warning-select {
      width: 100px;
    }
  }
}
</style>
