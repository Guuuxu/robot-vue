<template>
  <div class="total-warning app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="告警类型" prop="warningType">
        <el-select
          v-model="queryParams.warningType"
          placeholder="任务类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in warningOption"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="告警开始时间" prop="beginTime">
        <el-date-picker
          v-model="queryParams.beginTime"
          type="datetime"
          placeholder=""
          clearable
          size="small"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="告警结束时间" prop="endTime">
        <el-date-picker
          v-model="queryParams.endTime"
          type="datetime"
          placeholder=""
          clearable
          size="small"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="状态" prop="warningState">
        <el-select
          v-model="queryParams.warningState"
          placeholder=""
          size="small"
        >
          <el-option
            v-for="dict in warningStatusOption"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="cyan"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置
        </el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-popconfirm title="确定删除这些告警吗？" @confirm="handleDelete">
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            slot="reference"
            >批量删除
          </el-button>
        </el-popconfirm>
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="loadUnHandledList"
      ></right-toolbar>
    </el-row>
    <el-table
      v-loading="loading"
      :data="warningList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" width="50" />
      <el-table-column label="测点编号" align="center" prop="sensorId" />
      <el-table-column
        label="检测内容"
        align="center"
        :show-overflow-tooltip="true"
        prop="sensorName"
      >
        <template slot-scope="scope">
          {{
            scope.row.warningType === "3"
              ? scope.row.deviceName
              : scope.row.sensorName
          }}
        </template>
      </el-table-column>
      <el-table-column label="结果" align="center" prop="warningValue">
        <template slot-scope="scope">
          {{
            scope.row.warningType === "3"
              ? scope.row.deviceName
              : scope.row.warningValue
          }}
        </template>
      </el-table-column>
      <el-table-column
        label="告警类型"
        align="center"
        :formatter="warningTypeFormat"
      >
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        :formatter="warningStatusFormat"
      >
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-if="!scope.row.warningState"
            size="mini"
            type="text"
            icon="el-icon-edit-outline"
            @click="handleWarning(scope.row)"
            >处理
          </el-button>
          <el-button
            v-if="scope.row.warningState"
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            >查看
          </el-button>
          <el-popconfirm
            class="icon-delete-pop"
            title="确定删除这条告警吗？"
            @confirm="handleDelete(scope.row)"
          >
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              slot="reference"
              >删除
            </el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 告警处理对话框 -->
    <device-warning-handle-dialog
      :isVisible.sync="isShowWarningDialog"
      :title="title"
      :detail.sync="warningDetail"
      :tableData.sync="tableData"
      :row.sync="row"
      @onUpdate="updateList"
    />
    <!-- 告警查看对话框 -->
    <device-warning-view-dialog
      :isVisible.sync="isShowWarningViewDialog"
      :title="title"
      :detail.sync="warningDetail"
      :tableData.sync="tableData"
      :row.sync="row"
    />
    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="loadUnHandledList"
    />
  </div>
</template>

<script>
import { getUnHandledList } from "@/api/warning/totalWarning";
import {
  getReWarningList,
  deleteWarningRe,
  getWarningReDetail
} from "@/api/warning/relationWarning";
import {
  getWarningRobotDelete,
  getWarningRobotList,
  getWarningRobotDetail
} from "@/api/warning/robotWarning";
import {
  getWarningSensorDelete,
  getWarningSensorList,
  getWarningSensorDetail
} from "@/api/warning/deviceWarning";
import DeviceWarningHandleDialog from "../components/DeviceWarningHandleDialog";
import DeviceWarningViewDialog from "../components/DeviceWarningViewDialog";
import { mapGetters } from "vuex";
export default {
  name: "unhandled",
  components: { DeviceWarningHandleDialog, DeviceWarningViewDialog },
  data() {
    return {
      loading: true,
      // 显示搜索条件
      showSearch: true,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        warningState: "0"
      },
      warningList: [],
      warningOption: [],
      warningStatusOption: [],
      multiple: true,
      selection: [], // 选中数据
      ids: [],
      isShowWarningDialog: false,
      isShowWarningViewDialog: false,
      title: "",
      row: {},
      warningDetail: {}, // 告警详情
      tableData: [] // 告警详情检测内容
    };
  },
  computed: {
    ...mapGetters(["stationId"])
  },
  created() {
    this.queryParams.stationId = this.stationId;
    this.loadUnHandledList();
    this.loadDicts();
  },
  methods: {
    loadDicts() {
      this.getDicts("robot_warning_type").then(response => {
        this.warningOption = response.data;
      });
      this.getDicts("robot_warning_status").then(response => {
        this.warningStatusOption = response.data;
      });
    },
    // 告警类型字典翻译
    warningTypeFormat(row, column) {
      return this.selectDictLabel(this.warningOption, row.warningType);
    },
    // 告警字典状态翻译
    warningStatusFormat(row, column) {
      return this.selectDictLabel(this.warningStatusOption, row.warningState);
    },
    async loadUnHandledList() {
      this.loading = true;
      let res;
      if (this.queryParams.warningType === "1") {
        res = await getWarningSensorList(this.queryParams);
      } else if (this.queryParams.warningType === "3") {
        res = await getWarningRobotList(this.queryParams);
      } else if (this.queryParams.warningType === "4") {
        res = await getReWarningList(this.queryParams);
      } else {
        res = await getUnHandledList(this.queryParams);
      }

      this.warningList = res.rows;
      this.total = res.total;
      this.loading = false;
    },
    // 搜索
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.loadUnHandledList();
    },
    // 重置
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selection = selection;
      this.ids = selection.map(item => item.warnId);
      this.multiple = !selection.length;
    },
    /** 删除按钮操作 */
    async handleDelete(row) {
      let robotIds; // 机器人告警ids
      let sensorIds; // 设备告警ids
      let sensorReIds; // 关联设备告警ids
      if (row?.warnId) {
        if (row.warningType === "3") {
          robotIds = row?.warnId || this.ids;
          await getWarningRobotDelete(robotIds);
        } else if (row.warningType === "4") {
          sensorReIds = row?.warnId || this.ids;
          await deleteWarningRe(sensorReIds);
        } else {
          sensorIds = row?.warnId || this.ids;
          await getWarningSensorDelete(sensorIds);
        }
        this.msgSuccess("删除成功");
        this.updateList();
      } else {
        robotIds = this.selection
          .filter(v => v.warningType === "3")
          .map(item => item.warnId);
        sensorIds = this.selection
          .filter(v => v.warningType === "1")
          .map(item => item.warnId);
        sensorReIds = this.selection
          .filter(v => v.warningType === "4")
          .map(item => item.warnId);
        Promise.all([
          robotIds.length && getWarningRobotDelete(robotIds),
          sensorIds.length && getWarningSensorDelete(sensorIds),
          sensorReIds.length && deleteWarningRe(sensorReIds)
        ]).then(() => {
          this.updateList();
          this.msgSuccess("删除成功");
        });
      }
    },
    // 处理操作
    handleWarning(row) {
      this.row = row;
      this.isShowWarningDialog = true;
      this.loadWarningDetail(row);
    },
    // 查看
    handleView(row) {
      this.row = row;
      this.isShowWarningViewDialog = true;
      this.loadWarningDetail(row);
    },
    // 告警详情
    async loadWarningDetail(row) {
      const tableData = [];
      let res;
      if (row.warningType === "1") {
        this.title = "设备告警处理";
        res = await getWarningSensorDetail(row.warnId);
      } else if (row.warningType === "3") {
        this.title = "机器人告警处理";
        res = await getWarningRobotDetail(row.warnId);
      } else {
        this.title = "关联设备告警处理";
        res = await getWarningReDetail(row.warnId);
      }
      this.warningDetail = res.data;
      tableData.push(res.data);
      this.tableData = tableData;
    },
    // 更新列表
    updateList() {
      this.loadUnHandledList();
    }
  }
};
</script>

<style></style>
