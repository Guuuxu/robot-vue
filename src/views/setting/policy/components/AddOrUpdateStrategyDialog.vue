<template>
  <el-dialog
    class="strategy-dialog"
    :title="title"
    :visible.sync="isVisible"
    width="600px"
    append-to-body
    :close-on-click-modal="false"
    :before-close="cancel"
  >
    <el-form :model="form" ref="form" label-width="100px" :rules="rules">
      <el-form-item label="策略名称" prop="strategyName">
        <el-input
          v-model="form.strategyName"
          placeholder="请输入"
          class="small-input"
        />
      </el-form-item>
      <el-form-item label="任务类型" prop="inspectionType">
        <el-select v-model="form.inspectionType" placeholder="请选择">
          <el-option
            v-for="item in inspectionOption"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="item.dictValue"
          >
          </el-option>
        </el-select>
        <!-- 定点巡检选择框 -->
        <el-cascader
          v-model="fixedSensor"
          class="ml10 cascader"
          v-show="form.inspectionType == 2"
          :options="treeList"
          :props="props"
          collapse-tags
          clearable
        ></el-cascader>
        <!-- 定制巡检选择框 -->
        <el-cascader
          v-model="sensorType"
          class="ml10"
          v-show="form.inspectionType == 3"
          :options="sensorTypeList"
          :props="{ multiple: true }"
          collapse-tags
          clearable
        ></el-cascader>
      </el-form-item>
      <el-form-item label="策略类型" prop="strategyType">
        <el-select v-model="form.strategyType" placeholder="请选择">
          <el-option
            v-for="item in strategyOption"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="item.dictValue"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <!-- 间隔方案 -->
      <div v-show="form.strategyType === '3'">
        <el-form-item label="间隔方式" prop="intervalType">
          <el-input-number
            class="interval-input"
            placeholder="请输入数字"
            v-model="form.intervalCount"
            :precision="0"
            :min="1"
            :step="1"
          ></el-input-number>
          <el-select
            v-model="form.intervalType"
            placeholder="请选择"
            class="interval-select"
            v-if="intervalOption.length"
          >
            <el-option
              v-for="item in intervalOption"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </div>
      <!-- 模板方案 -->
      <div v-show="form.strategyType === '2'">
        <el-form-item label="选择配置方案" prop="template">
          <el-select v-model="form.template" placeholder="请选择">
            <el-option
              v-for="item in templatePlanOption"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </div>
      <!-- 自定义 -->
      <div v-show="form.strategyType === '1'">
        <el-form-item label="选择月" prop="strategyMonth">
          <el-select
            v-model="form.strategyMonthArr"
            placeholder="请选择"
            multiple
          >
            <el-option
              v-for="item in [
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
                '11',
                '12'
              ]"
              :key="item"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择日" prop="strategyDayArr">
          <el-date-picker
            v-model="form.strategyDayArr"
            type="dates"
            format="dd"
            value-format="dd"
            placeholder="选择日"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item
          label="选择时"
          prop="strategyHour"
          v-if="hourOption.length"
        >
          <el-select
            v-model="form.strategyHourArr"
            placeholder="请选择时"
            multiple
          >
            <el-option
              v-for="item in hourOption"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"
              >{{ item.dictValue }}
            </el-option>
          </el-select>
        </el-form-item>
      </div>

      <el-form-item label="选择日期" prop="timeRange">
        <el-date-picker
          v-model="form.timeRange"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        >
        </el-date-picker>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit" :loading="loading"
        >确 定
      </el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from "vuex";
import { getStrategyAdd, getStrategyUpdate } from "@/api/setting/policy";
import { getDeviceTreeList } from "@/api/setting/device";
import { getSensorListBySensorType } from "@/api/setting/sensor";
export default {
  name: "AddOrUpdateStrategyDialog",
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ""
    },
    row: {
      type: Object,
      default: () => {}
    },
    strategyOption: {
      type: Array,
      default: () => []
    },
    inspectionOption: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(["stationId"])
  },
  watch: {
    isVisible() {
      this.$nextTick(() => {
        this.$refs?.form.clearValidate();
      });
      this.init();
      if (this.row.strategyInfo) {
        this.row.strategyInfo.strategyType =
          this.row.strategyInfo.strategyType &&
          this.row.strategyInfo.strategyType.toString();
        this.row.strategyInfo.inspectionType =
          this.row.strategyInfo.inspectionType &&
          this.row.strategyInfo.inspectionType.toString();
        this.row.strategyInfo.intervalType =
          this.row.strategyInfo.intervalType &&
          this.row.strategyInfo.intervalType.toString();

        this.form = JSON.parse(JSON.stringify(this.row.strategyInfo));
        this.$set(this.form, "timeRange", [
          this.form.startDate ? this.form.startDate : "",
          this.form.endDate ? this.form.endDate : ""
        ]);
        this.row.template = "";

        // 月日时回显格式化
        if (this.form.strategyMonth) {
          this.$set(
            this.form,
            "strategyMonthArr",
            this.form.strategyMonth.split(",")
          );
        } else {
          this.$set(this.form, "strategyMonthArr", []);
        }
        if (this.form.strategyDay) {
          this.$set(
            this.form,
            "strategyDayArr",
            this.form.strategyDay.split(",")
          );
        } else {
          this.$set(this.form, "strategyDayArr", []);
        }
        if (this.form.strategyHour) {
          this.$set(
            this.form,
            "strategyHourArr",
            this.form.strategyHour.split(",")
          );
        } else {
          this.$set(this.form, "strategyHourArr", []);
        }

        //  定点巡检测点回显
        if (this.form.inspectionType == 2) {
          console.log(this.row.deviceListSelected);
          const selectArr = [];
          this.row.deviceListSelected &&
            this.row.deviceListSelected.forEach(sl => {
              selectArr.push([sl.deviceId, sl.sensorParentId]);
            });
          this.fixedSensor = selectArr;
        } else if (this.form.inspectionType == 3) {
          //  定制巡检测点回显
          const selectArr = [];
          this.row.sensorTypeListSelected &&
            this.row.sensorTypeListSelected.forEach(sl => {
              selectArr.push([sl.sensor_type_id, sl.device_id, sl.sensor_id]);
            });
          this.sensorType = selectArr;
        }
        // 根据策略时间strategyHour 8 16 20点判断一日几巡
        if (this.form.strategyHour) {
          const strategyHour = this.form.strategyHour.split(",");
          switch (strategyHour.length) {
            case 1:
              this.$set(this.form, "template", "1");
              break;
            case 2:
              this.$set(this.form, "template", "2");
              break;
            case 3:
              this.$set(this.form, "template", "3");
              break;
            default:
              this.$set(this.form, "template", "1");
              break;
          }
        }
        // 根据策略周strategyWeek 8 16 20点判断一周几巡
        if (this.form.strategyWeek) {
          const strategyWeek = this.form.strategyHour.split(",");
          switch (strategyWeek.length) {
            case 1:
              this.$set(this.form, "template", "4");
              break;
            case 2:
              this.$set(this.form, "template", "5");
              break;
            case 3:
              this.$set(this.form, "template", "6");
              break;
            default:
              this.$set(this.form, "template", "4");
              break;
          }
        }
      } else {
        this.form = {
          strategyMonthArr: [],
          strategyHourArr: [],
          strategyDayArr: []
        };
        this.fixedSensor = [];
        this.sensorType = [];
      }
      this.form.stationId = this.stationId;
    },
    "form.strategyType"(val) {
      console.log(val);
    }
  },
  data() {
    var validateIntervalType = (rule, value, callback) => {
      if (
        !this.form.intervalType &&
        this.form.intervalCount !== "" &&
        this.form.strategyType === "3"
      ) {
        callback(new Error("请选择间隔方式"));
      } else if (
        this.form.intervalType &&
        !this.form.intervalCount &&
        this.form.strategyType === "3"
      ) {
        callback(new Error("请输入间隔数字"));
      } else {
        callback();
      }
    };
    const validateTimeRange = (rule, value, callback) => {
      if (!value && this.form.strategyType === "3") {
        callback(new Error("请选择间隔时间"));
      } else {
        callback();
      }
    };
    return {
      hourOption: [],
      form: {
        strategyType: ""
      },
      timeRange: [],
      intervalOption: [],
      templatePlanOption: [],
      // 表单校验
      rules: {
        strategyName: [
          { required: true, message: "请输入策略名称", trigger: "blur" }
        ],
        inspectionType: [
          { required: true, message: "请任务类型", trigger: "change" }
        ],
        strategyType: [
          { required: true, message: "请选择策略类型", trigger: "change" }
        ],
        intervalType: [{ validator: validateIntervalType, trigger: "blur" }],
        timeRange: [{ validator: validateTimeRange, trigger: "blur" }]
      },
      props: { multiple: true, value: "deviceId", label: "label" },
      fixedSensor: [], // 定点巡检回显
      treeList: [], // 定点巡检option
      sensorTypeList: [], // 定制巡检option
      sensorType: [], // 定制巡检回显
      loading: false
    };
  },
  created() {
    this.loadDicts();
  },
  methods: {
    init() {
      Promise.all([this.loadSensorTypeList(), this.loadDeviceTreeList()]);
    },
    loadDicts() {
      this.getDicts("robot_interval_type").then(response => {
        this.intervalOption = response.data;
      });
      this.getDicts("robot_template_plan").then(response => {
        this.templatePlanOption = response.data;
      });
      this.getDicts("robot_strategy_hour").then(response => {
        this.hourOption = response.data;
      });
    },
    // 获取测点类型列表
    async loadSensorTypeList() {
      const res = await getSensorListBySensorType({
        stationId: this.stationId
      });
      const list = []; // 一级柜体
      const deviceList = res.data.filter(item => item.device_id); // 存在柜体
      res.data.forEach(element => {
        if (!list.map(i => i.value).includes(element.sensor_type_id)) {
          list.push({
            value: element.sensor_type_id,
            label: element.sensor_type_name
          });
        }
      });
      // 归类同一类型的柜体
      const newlist = list.map(item => {
        const filterDevice = deviceList.filter(
          d => d.sensor_type_id === item.value
        );
        const arr = [];
        filterDevice.map((d, index) => {
          if (!arr.map(i => i.value).includes(d.device_id)) {
            arr.push({
              value: d.device_id,
              label: d.device_name
            });
            item.children = arr;
          }
        });
        return item;
      });
      // 筛选测点
      let filterSenSor = [];
      for (let i = 0; i < newlist.length; i++) {
        const element = newlist[i];
        const filterDevice = res.data.filter(
          item => item.sensor_type_id == element.value
        );
        if (element?.children?.length) {
          for (let j = 0; j < element.children.length; j++) {
            const child = element.children[j];
            filterSenSor = filterDevice.filter(
              item => item.device_id == child.value
            );
            const arr = [];
            filterSenSor.map(f => {
              if (!arr.map(i => i.value).includes(f.sensor_id)) {
                arr.push({
                  value: f.sensor_id,
                  label: f.sensor_name,
                  checked: false
                });
                child.children = arr;
              }
            });
          }
        }
      }
      this.sensorTypeList = newlist;
    },
    async loadDeviceTreeList() {
      const res = await getDeviceTreeList();
      this.treeList = this.parseTreeList(res.data);
    },
    // 树形数据处理
    parseTreeList(data) {
      return data.map(item => {
        if (item.children.length) {
          if (item.sensorLevel === "1") {
            delete item.children;
          } else {
            this.parseTreeList(item.children);
          }
          return item;
        } else {
          delete item.children;
          return item;
        }
      });
    },
    // 提交
    submit() {
      this.$refs["form"].validate(async valid => {
        let ids = [];
        let echoValue = [];
        // 回显数组
        if (this.form.inspectionType == 2) {
          echoValue = this.fixedSensor;
        } else if (this.form.inspectionType == 3) {
          echoValue = this.sensorType;
        }
        for (const value of echoValue) {
          ids.push(value[value.length - 1]);
        }
        this.form.sensorIds = ids.join(",");
        this.form.strategyMonth =
          this.form.strategyMonthArr && this.form.strategyMonthArr.join(",");
        this.form.strategyDay =
          this.form.strategyDayArr && this.form.strategyDayArr.join(",");
        this.form.strategyHour =
          this.form.strategyHourArr && this.form.strategyHourArr.join(",");

        if (valid) {
          this.loading = true;
          if (this.form.id) {
            this.loading = false;

            try {
              if (this.form?.timeRange?.length) {
                this.form.startDate =
                  this.form.timeRange[0] &&
                  this.form.timeRange[0].substring(0, 10) + " 00:00:00";
                this.form.endDate =
                  this.form.timeRange[1] &&
                  this.form.timeRange[1].substring(0, 10) + " 00:00:00";
              }
              // return;
              await getStrategyUpdate(this.form);
              this.msgSuccess("编辑成功");
              this.$emit("update:isVisible", false);
              this.$emit("onUpdate");
              this.loading = false;
            } catch (error) {
              this.loading = false;
            }
          } else {
            if (this.form?.timeRange?.length) {
              this.form.startDate =
                this.form.timeRange[0] && this.form.timeRange[0] + " 00:00:00";
              this.form.endDate =
                this.form.timeRange[1] && this.form.timeRange[1] + " 00:00:00";
            }
            try {
              await getStrategyAdd(this.form);
              this.loading = false;
              this.msgSuccess("添加成功");
              this.$emit("update:isVisible", false);
              this.$emit("onUpdate");
            } catch (error) {
              this.loading = false;
            }
          }
        }
      });
    },
    cancel() {
      this.$emit("update:isVisible", false);
      this.resetForm("form");
    }
  }
};
</script>

<style lang="scss" scoped>
.interval-input {
  width: 160px;
}
.interval-select {
  width: 160px;
  margin-left: 10px;
}
.el-select {
  width: 180px;
}
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
</style>
