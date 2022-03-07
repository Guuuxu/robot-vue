<template>
  <el-dialog
    class="device-warning-handle-dialog"
    :title="title"
    :visible.sync="isVisible"
    width="80%"
    append-to-body
    :close-on-click-modal="false"
    :before-close="cancel"
  >
    <el-row
      :gutter="10"
      class="device-warning-row"
      v-if="currentRow.warningType === '1' || currentRow.warningType === '4'"
    >
      <el-col :span="14">
        <el-card class="detection-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>检测内容</span>
          </div>
          <table
            class="warning-table"
            style="width: 100%;border-collapse: collapse;"
          >
            <thead>
              <th>设备名称</th>
              <th>检测内容</th>
              <th>结果</th>
              <th>检测时间</th>
              <th>测点状态</th>
            </thead>
            <tr>
              <td>{{ detail.deviceName ? detail.deviceName : "" }}</td>
              <td v-if="row.warningType === '1'">
                {{ detail.sensorName ? detail.sensorName : "" }}
              </td>
              <td v-else>{{ detail.relName ? detail.relName : "" }}</td>
              <td>{{ detail.warningValue }}</td>
              <td>{{ detail.createTime }}</td>
              <td>{{ detail.judgment ? detail.judgment : "" }}</td>
            </tr>
          </table>

          <div class="sensor-panel">
            <h3>测点</h3>
            <el-divider></el-divider>
            <div class="sensor-panel-content">
              <div class="left">
                <div>
                  <img
                    class="sensor-img"
                    v-for="img in imgFile"
                    :key="img"
                    :src="img"
                  />
                </div>
                <div class="sensor-status">
                  <el-input v-model="sensorStatus" />
                  <span>状态</span>
                  <el-button @click="handleEditWarning">修改</el-button>
                </div>
              </div>
              <div class="right">
                <div class="right-content th">
                  <div class="right-content-item">设备名称</div>
                  <div class="right-content-item">检测内容</div>
                  <div class="right-content-item">结果</div>
                  <div class="right-content-item">检测时间</div>
                  <div class="right-content-item">测点状态</div>
                </div>
                <div class="right-content">
                  <div class="right-content-item">
                    {{ detail.deviceName ? detail.deviceName : "" }}
                  </div>
                  <div
                    class="right-content-item"
                    v-if="row.warningType === '1'"
                  >
                    {{ detail.sensorName ? detail.sensorName : "" }}
                  </div>
                  <div class="right-content-item" v-else>
                    {{ detail.relName ? detail.relName : "" }}
                  </div>
                  <div class="right-content-item">
                    {{ detail.warningValue ? detail.warningValue : "" }}
                  </div>
                  <div class="right-content-item">
                    <el-tooltip :content="detail.createTime" placement="top">
                      <span>{{
                        detail.createTime ? detail.createTime : ""
                      }}</span>
                    </el-tooltip>
                  </div>
                  <div class="right-content-item">
                    {{ detail.judgment ? detail.judgment : "" }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="detection-footer">
            <el-button type="primary" size="mini" plain @click="showHkvDialog"
              >去看看
            </el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="warning-rules-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>告警规则</span>
          </div>
          <template v-if="row.warningType === '1'">
            <el-row :gutter="6">
              <el-col :span="8" class="warning-rules-th">告警级别</el-col>
              <el-col :span="8" class="warning-rules-th">仪表量程</el-col>
            </el-row>
            <el-row
              :gutter="6"
              v-for="(item, index) in warningLevelOption"
              :key="item.dictCode"
            >
              <el-col :span="8" class="warning-rules-cell">
                {{ item.dictLabel }}
              </el-col>
              <el-col :span="8" class="warning-rules-cell">
                {{ detail[`warning${index + 1}LessVal`] }} ~
                {{ detail[`warning${index + 1}GreatVal`] }}
              </el-col>
            </el-row>
          </template>
          <template v-else>
            <div v-html="detail.relation"></div>
          </template>
        </el-card>
        <el-card class="handle-rules-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span>处理规则</span>
          </div>
          <div class="handle-rules-body">
            <el-form :model="form" ref="form" :rules="rules">
              <el-form-item prop="checkList">
                <el-checkbox-group
                  v-model="form.checkList"
                  @change="changeCheck"
                >
                  <el-checkbox
                    v-for="item in warningRulesOption"
                    :key="item.dictValue"
                    :label="item.dictValue"
                    border
                    >{{ item.dictLabel }}</el-checkbox
                  >
                </el-checkbox-group>
              </el-form-item>
              <el-form-item prop="descb">
                <el-input
                  v-model="form.descb"
                  class="handle-textArea mt10"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入处理描述"
                />
              </el-form-item>
            </el-form>

            <div slot="footer" class="dialog-footer">
              <el-button @click="cancel">取 消</el-button>
              <el-button type="primary" @click="submit" :loading="loading"
                >处 理
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <div
      :gutter="10"
      class="robot-warning-row"
      v-if="currentRow.warningType === '3'"
    >
      <el-card class="detection-card" shadow="hover">
        <div slot="header" class="clearfix">
          <span>告警内容</span>
        </div>
        <table
          class="warning-table"
          style="width: 100%;border-collapse: collapse;"
        >
          <thead>
            <th>告警结果</th>
            <th>故障编码</th>
            <th>告警时间</th>
          </thead>
          <tr>
            <td>{{ detail.warningInfo ? detail.warningInfo : "" }}</td>
            <td>{{ detail.exCode ? detail.exCode : "" }}</td>
            <td>{{ detail.createTime }}</td>
          </tr>
        </table>
      </el-card>
      <el-card class="handle-rules-card" shadow="hover">
        <div slot="header" class="clearfix">
          <span>处理规则</span>
        </div>
        <div class="handle-rules-body">
          <el-form ref="form" :model="form" :rules="rules">
            <el-form-item prop="checkList">
              <el-checkbox-group v-model="form.checkList" @change="changeCheck">
                <el-checkbox
                  v-for="item in warningRulesOption"
                  :key="item.dictValue"
                  :label="item.dictValue"
                  border
                  >{{ item.dictLabel }}</el-checkbox
                >
              </el-checkbox-group>
            </el-form-item>
            <el-form-item prop="descb">
              <el-input
                v-model="form.descb"
                class="handle-textArea mt10"
                type="textarea"
                :rows="3"
                placeholder="请输入处理描述"
              />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="cancel">取 消</el-button>
            <el-button type="primary" @click="submit" :loading="loading"
              >处 理
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
    <hkv-dialog :isVisible.sync="isShowHkvDialog" />
  </el-dialog>
</template>

<script>
import HkvDialog from "./HkvDialog";
import { getWarningRobotHandler } from "@/api/warning/robotWarning";
import {
  getWarningSensorHandler,
  editWarningSensor
} from "@/api/warning/deviceWarning";
import {
  updateWarningRe,
  handleWarningRe
} from "@/api/warning/relationWarning";
import { getRobotToWatch } from "@/api/setting/device/control";
export default {
  name: "DeviceWarningHandleDialog",
  components: { HkvDialog },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "设备告警处理"
    },
    row: {
      type: Object,
      default: () => {}
    },
    detail: {
      type: Object,
      default: () => {}
    },
    tableData: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    isVisible(val) {
      if (val) {
        this.currentRow = JSON.parse(JSON.stringify(this.row));
        this.imgFile = this.detail.visibleLightFile
          ? this.detail.visibleLightFile.split(",")
          : [];
      }
    },
    tableData(val) {
      this.tableList = val;
      this.sensorStatus = this.detail?.warningValue;
    }
  },
  data() {
    return {
      tableList: [],
      currentRow: {},
      warningLevelOption: [],
      sensorStatus: "无状态",
      form: {
        checkList: [],
        descb: ""
      },
      warningRulesOption: [],
      loading: false,
      rules: {
        checkList: [
          { required: true, message: "请选择处理规则", trigger: "change" }
        ]
      },
      isShowHkvDialog: false,
      imgFile: []
    };
  },
  created() {
    this.loadDicts();
  },
  methods: {
    loadDicts() {
      this.getDicts("robot_warning_level").then(response => {
        this.warningLevelOption = response.data;
      });
      this.getDicts("robot_warning_rules").then(response => {
        this.warningRulesOption = response.data;
      });
    },
    // 告警等级字典翻译
    warningLevelFormat(row, column) {
      return this.selectDictLabel(this.warningOption, row.warningLevel);
    },
    changeCheck(val) {
      this.form.checkList.length > 1 && this.form.checkList.shift();
    },
    // 修改告警
    async handleEditWarning() {
      if (this.currentRow.warningType === "1") {
        await editWarningSensor({
          id: this.detail.id,
          resultId: this.detail.resultId,
          warningValue: this.sensorStatus,
          dealContent:
            this.selectDictLabel(
              this.warningRulesOption,
              this.form.checkList.join(",")
            ) || "仅修改状态",
          warningState: 1
        });
      } else {
        await updateWarningRe({
          id: this.detail.id,
          resultId: this.detail.resultId,
          warningValue: this.sensorStatus,
          dealContent:
            this.selectDictLabel(
              this.warningRulesOption,
              this.form.checkList.join(",")
            ) || "仅修改状态",
          warningState: 1
        });
      }

      this.msgSuccess("修改成功！");
      this.$emit("update:isVisible", false);
      this.$emit("onUpdate");
    },
    // 去看看
    async showHkvDialog() {
      this.isShowHkvDialog = true;
      await getRobotToWatch(this.detail.sensorId);
    },
    // 告警处理
    submit() {
      this.$refs["form"].validate(async valid => {
        if (valid) {
          this.loading = true;
          if (this.currentRow.warningType === "1") {
            await getWarningSensorHandler({
              id: this.detail.id,
              dealContent: this.selectDictLabel(
                this.warningRulesOption,
                this.form.checkList.join(",")
              ),
              descb: this.form.descb
            });
          }
          if (this.currentRow.warningType === "3") {
            await getWarningRobotHandler({
              id: this.detail.id,
              dealType: this.form.checkList.join(","),
              dealInfo: this.selectDictLabel(
                this.warningRulesOption,
                this.form.checkList.join(",")
              ),
              descb: this.form.descb
            });
          }
          if (this.currentRow.warningType === "4") {
            await handleWarningRe({
              id: this.detail.id,
              dealContent: this.selectDictLabel(
                this.warningRulesOption,
                this.form.checkList.join(",")
              ),
              descb: this.form.descb
            });
          }
          this.msgSuccess("处理成功");
          this.loading = false;
          this.$emit("update:isVisible", false);
          this.$emit("onUpdate");
        }
      });
    },
    cancel() {
      this.$emit("update:isVisible", false);
      this.tableList = [];
      this.currentRow = {};
    }
  }
};
</script>

<style lang="scss" scoped>
.device-warning-row {
  height: 100%;
  align-items: stretch;
  display: flex;
}
.detection-card {
  width: 100%;
  height: 100%;
  ::v-deep .el-card__body {
    height: calc(100% - 35px);
  }
  .sensor-panel {
    h3 {
      text-align: center;
    }
    .sensor-panel-content {
      @include fb(center);
      .left {
        width: 40%;
        .sensor-img {
          width: 80px;
          height: 80px;
          margin-right: 10px;
        }
        .sensor-status {
          @include fb();
          .el-input {
            width: 140px;
          }
        }
      }
      .right {
        width: 40%;
        margin-left: 15px;
        @include fb();
        border: 1px solid #dcdfe6;
        .right-content {
          width: 60%;
          text-align: center;
          &.th {
            background-color: #f8f8f9;
            font-size: 13px;
            color: #515a6e;
            font-weight: bold;
            width: 40%;
          }
          .right-content-item {
            height: 36px;
            line-height: 36px;
            @include ellipsis();
          }
        }
      }
    }
  }
  .detection-footer {
    text-align: center;
    margin-top: 50px;
  }
  .warning-table {
    width: 100%;
    ::v-deep .el-table__header {
      width: 100%;
    }
    thead {
      color: #909399;
      th {
        background-color: #f8f8f9;
        height: 40px;
        font-size: 13px;
      }
    }
    td {
      text-align: center;
      height: 40px;
    }
  }
}
.warning-rules-card {
  width: 100%;
  .warning-rules-th {
    background-color: #f8f8f9;
    text-align: center;
    color: #515a6e;
    font-weight: bold;
    height: 40px;
    line-height: 40px;
    font-size: 13px;
  }
  .warning-rules-cell {
    padding: 5px 0;
    text-align: center;
    font-size: 14px;
    color: #606266;
  }
}
.handle-rules-card {
  width: 100%;
  margin-top: 10px;
  ::v-deep {
    .el-checkbox-group {
      @include fb(flex-start);
      flex-wrap: wrap;
      margin-bottom: -10px;
      padding-right: -30px;
      .el-checkbox {
        margin-bottom: 10px;
        @include fb();
      }
    }
    .el-checkbox.is-bordered + .el-checkbox.is-bordered {
      margin-left: 0;
    }
  }
  .handle-rules-body {
    .dialog-footer {
      margin-top: 20px;
      text-align: right;
      .el-button {
        margin-bottom: 5px;
      }
    }
  }
}
.robot-warning-row {
  width: 100%;
}
</style>
