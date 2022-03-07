<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "./mixins/resize";

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: "chart"
    },
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "300px"
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    },
    xType: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      chart: null
    };
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val);
      }
    }
  },
  inject: {
    obj: {
      default: () => ({})
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, "macarons");
      this.setOptions(this.chartData);
    },
    setOptions({ xData, yData } = {}) {
      this.chart.setOption({
        // xAxis: {
        //   type: "category",
        //   data: xData,
        //   boundaryGap: false,
        //   axisTick: {
        //     show: false
        //   }
        // },
        xAxis: {
          type: "category",
          data: xData,
          axisLabel: {
            rotate: -70
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross"
          },
          padding: [5, 10],

          formatter: params => {
            var texts = [];
            var res =
              params[0].name +
              `<br/>${this.obj.sensorType === "6" ? "状态为：" : "数值为："} `;
            if (params[0].value === "ok") {
              texts = "开";
            } else if (params[0].value === "ERROR") {
              texts = "关";
            } else {
              texts = params[0].value;
            }
            res = res + texts;
            return res;
          }
        },
        yAxis: {
          type: this.obj.sensorType === "6" ? "category" : "value",
          axisTick: {
            show: true
          },
          name: `${this.obj.sensorName}(${this.obj.unit})`
        },
        legend: {
          data: []
        },
        series: [
          {
            name: "报警",
            itemStyle: {
              normal: {
                color: "#FF005A",
                lineStyle: {
                  color: "#FF005A",
                  width: 2
                }
              }
            },
            smooth: true,
            type: "line",
            data: yData,
            animationDuration: 2800,
            animationEasing: "cubicInOut"
          }
        ]
      });
    }
  }
};
</script>
