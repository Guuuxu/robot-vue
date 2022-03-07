<template>
  <div class="device-warning app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="关键字查询" prop="sensorName">
        <el-input v-model="queryParams.sensorName" clearable size="small" />
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
      <el-form-item>
        <el-button
          type="cyan"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
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
            >删除</el-button
          >
        </el-popconfirm>
      </el-col>
    </el-row>
    <el-table
      v-loading="loading"
      :data="warningList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" width="50" />
      <el-table-column
        label="设备名称"
        align="center"
        prop="sensorId"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="检测内容"
        align="center"
        :show-overflow-tooltip="true"
        prop="sensorName"
      >
      </el-table-column>
      <el-table-column label="结果" align="center" prop="warningValue" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" class="mr5"
            >处理</el-button
          >
          <el-popconfirm
            title="确定删除这条告警吗？"
            @confirm="handleDelete(scope.row)"
          >
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              slot="reference"
              >删除</el-button
            >
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
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
import {
  getWarningSensorList,
  getWarningSensorDelete
} from "@/api/warning/deviceWarning";
import { mapGetters } from "vuex";
export default {
  name: "deviceWarning",
  data() {
    return {
      loading: true,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      total: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      warningList: [],
      warningOption: [],
      multiple: true,
      ids: []
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
    },
    async loadUnHandledList() {
      this.loading = true;
      const res = await getWarningSensorList(this.queryParams);
      this.warningList = res.rows;
      this.total = res.total;
      this.loading = false;
    },
    // 表单重置
    reset() {
      this.currentRow = {};
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.loadUnHandledList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selection = selection;
      this.ids = selection.map(item => item.id);
      this.multiple = !selection.length;
    },
    /** 删除按钮操作 */
    async handleDelete(row) {
      const Ids = row?.id || this.ids.join(",");
      await getWarningSensorDelete(Ids);
      this.msgSuccess("删除成功");
      this.updateList();
    },
    // 更新列表
    updateList() {
      this.loadUnHandledList();
    }
  }
};
</script>

<style></style>
