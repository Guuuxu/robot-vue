<template>
  <el-dialog
    class="site-dialog"
    title="明细对比"
    :visible.sync="isVisible"
    width="80%"
    append-to-body
    :close-on-click-modal="false"
    :before-close="cancel"
  >
    <el-date-picker
      v-model="daterange"
      type="daterange"
      :clearable="false"
      align="right"
      unlink-panels
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      value-format="yyyy-MM-dd"
      :picker-options="pickerOptions"
      @change="handleChange"
    >
    </el-date-picker>
    <line-chart v-if="isVisible" class="mt10" :chart-data="lineChartData" />
  </el-dialog>
</template>

<script>
import LineChart from "@/views/dashboard/LineChart";
import { getInspectionSensorHistory } from "@/api/inspect";
export default {
  name: "DetailHistoryDialog",
  components: { LineChart },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    time: {
      type: String,
      default: ""
    },
    sensorId: {
      type: String,
      default: ""
    }
  },
  watch: {
    async isVisible(val) {
      if (val) {
        var ago = new Date(
          new Date(this.time).getTime() - 90 * 24 * 60 * 60 * 1000
        );
        var day = ("0" + ago.getDate()).slice(-2);
        var month = ("0" + (ago.getMonth() + 1)).slice(-2);
        var threeMonAgo = ago.getFullYear() + "-" + month + "-" + day;
        this.daterange = [threeMonAgo, this.time];
        const res = await getInspectionSensorHistory({
          startTime: threeMonAgo,
          endTime: this.time,
          sensorId: this.sensorId
        });
        this.lineChartData.xData = res.data.map(item => item.createTime);
        this.lineChartData.yData = res.data.map(item => item.inspectionResult);
      }
    }
  },
  data() {
    const self = this;
    return {
      lineChartData: {
        xData: [],
        yData: []
      },
      daterange: [],
      pickerOptions: {
        shortcuts: [
          {
            text: "一个月",
            onClick(vm) {
              const end = new Date(self.time.replace(/-/, "/"));
              const start = new Date();
              start.setMonth(start.getMonth() - 1);
              vm.$emit("pick", [start, end]);
            }
          },
          {
            text: "二个月",
            onClick(vm) {
              const end = new Date(self.time.replace(/-/, "/"));
              const start = new Date();
              start.setMonth(start.getMonth() - 2);
              vm.$emit("pick", [start, end]);
            }
          },
          {
            text: "三个月",
            onClick(vm) {
              const end = new Date(self.time.replace(/-/, "/"));
              const start = new Date();
              start.setMonth(start.getMonth() - 3);
              vm.$emit("pick", [start, end]);
            }
          }
        ]
      }
    };
  },
  methods: {
    async handleChange() {
      console.log(this.daterange);
      const res = await getInspectionSensorHistory({
        startTime: this.daterange[0],
        endTime: this.daterange[1],
        sensorId: this.sensorId
      });
      this.lineChartData.xData = res.data.map(item => item.createTime);
      this.lineChartData.yData = res.data.map(item => item.inspectionResult);
    },
    cancel() {
      this.$emit("update:isVisible", false);
    }
  }
};
</script>

<style lang="scss" scoped>
.site-dialog {
}
</style>
