<template>
  <div class="inspect-log app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      v-show="showSearch"
      :inline="true"
    >
      <el-form-item label="任务类型" prop="taskType">
        <el-select
          v-model="queryParams.taskType"
          placeholder="任务类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in taskOption"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="任务编号" prop="taskId">
        <el-input v-model="queryParams.taskId" placeholder="请输入任务编号" />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="queryParams.startTime"
          value-format="yyyy-MM-dd hh:mm:ss"
          type="datetime"
          placeholder="选择开始时间"
          clearable
          size="small"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="queryParams.endTime"
          value-format="yyyy-MM-dd hh:mm:ss"
          type="datetime"
          placeholder="选择结束时间"
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
            >批量删除</el-button
          >
        </el-popconfirm>
      </el-col>

      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="loadInspectList"
      ></right-toolbar>
    </el-row>
    <el-table
      v-loading="loading"
      :data="logList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" width="50" />
      <el-table-column
        label="任务编号"
        align="center"
        :show-overflow-tooltip="true"
        prop="taskId"
      >
      </el-table-column>
      <el-table-column
        label="任务名称"
        align="center"
        :show-overflow-tooltip="true"
        prop="taskName"
      >
      </el-table-column>
      <el-table-column label="任务类型" align="center">
        <template slot-scope="scope">
          <span>{{
            taskOption.length &&
              taskOption.find(item => item.dictValue == scope.row.taskType)
                .dictLabel
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="待检测点数" align="center" prop="readyPointCount">
      </el-table-column>
      <el-table-column label="检测点数" align="center" prop="pointCount">
      </el-table-column>
      <el-table-column label="异常数" align="center" prop="warningCount">
      </el-table-column>
      <el-table-column label="未处理数" align="center" prop="notDeal">
      </el-table-column>
      <el-table-column label="巡检时间" align="center" prop="createTime">
      </el-table-column>
      <el-table-column label="任务状态" align="center" prop="warningValue">
        <template slot-scope="scope">
          {{ scope.row.status === "4" ? "已完成" : "未完成" }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
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
    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="loadInspectList"
    />
  </div>
</template>

<script>
import { getInspectList, getInspectionDelete } from "@/api/inspect";
export default {
  name: "inspectLog",
  data() {
    return {
      queryParams: {
        startTime: "",
        endTime: "",
        pageSize: 10,
        pageNum: 1,
        taskId: ""
      },
      // 显示搜索条件
      showSearch: true,
      total: 0,
      logList: [],
      taskOption: [],
      loading: true,
      selection: [],
      ids: [],
      multiple: true
    };
  },
  created() {
    this.loadDicts();
    this.loadInspectList();
  },
  methods: {
    loadDicts() {
      this.getDicts("robot_inspection_type").then(response => {
        this.taskOption = response.data;
      });
    },
    // 获取巡检记录
    async loadInspectList() {
      this.loading = true;
      const res = await getInspectList(this.queryParams);
      this.total = res.total;
      this.logList = res.rows;
      this.loading = false;
    },
    // 搜索
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.loadInspectList();
    },
    // 重置
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
    // 查看
    handleView(row) {
      this.$router.push({
        path: "/inspectLog/detail/" + row.taskId
      });
    },
    /** 删除按钮操作 */
    async handleDelete(row) {
      const ids = row?.id || this.ids.join(",");
      await getInspectionDelete(ids);
      this.msgSuccess("删除成功");
      this.updateList();
    },
    updateList() {
      this.loadInspectList();
    }
  }
};
</script>

<style></style>
