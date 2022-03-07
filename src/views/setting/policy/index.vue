<template>
  <div class="policy app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="任务类型" prop="inspectionType">
        <el-select
          v-model="queryParams.inspectionType"
          placeholder="任务类型"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in inspectionOption"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="策略类型" prop="strategyType">
        <el-select
          v-model="queryParams.strategyType"
          placeholder="请选择"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in strategyOption"
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
          >重置</el-button
        >
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-popconfirm title="确定删除这些策略吗？" @confirm="handleDelete">
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            slot="reference"
            >删除
          </el-button>
        </el-popconfirm>
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="loadStrategyList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="strategyList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" width="50" />
      <el-table-column
        label="策略名称"
        align="center"
        prop="strategyName"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="策略类型" align="center">
        <template slot-scope="scope">
          <span>{{
            strategyOption.length &&
              strategyOption.find(
                item => item.dictValue == scope.row.strategyType
              ).dictLabel
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务类型" align="center">
        <template slot-scope="scope">
          <span>{{
            inspectionOption.length &&
              inspectionOption.find(
                item => item.dictValue == scope.row.inspectionType
              ).dictLabel
          }}</span>
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
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            >修改
          </el-button>
          <el-popconfirm
            class="icon-delete-pop"
            title="确定删除这条策略吗？"
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
      @pagination="loadStrategyList"
    />
    <!-- 添加或修改策略对话框 -->
    <add-or-update-strategy-dialog
      :title="title"
      :isVisible.sync="open"
      :strategyList="strategyList"
      :row.sync="currentRow"
      :strategyOption="strategyOption"
      :inspectionOption="inspectionOption"
      width="500px"
      append-to-body
      @onUpdate="updateList"
    ></add-or-update-strategy-dialog>
  </div>
</template>

<script>
import AddOrUpdateStrategyDialog from "./components/AddOrUpdateStrategyDialog";
import {
  getStrategyList,
  getStrategyDelete,
  getStrategyDetail
} from "@/api/setting/policy";
import { mapGetters } from "vuex";
export default {
  name: "Policy",
  components: { AddOrUpdateStrategyDialog },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 选中数组
      ids: [],
      strategyIds: [], //选中的策略id
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        inspectionType: undefined,
        strategyType: undefined
      },
      form: {},
      // 策略类型数据字典
      strategyOption: [],
      // 任务类型字典
      inspectionOption: [],
      strategyList: [],
      // 总条数
      total: 0,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      currentRow: {},
      selection: []
    };
  },
  computed: {
    ...mapGetters(["stationId"])
  },
  created() {
    this.loadDicts();
    this.loadStrategyList();
  },
  methods: {
    loadDicts() {
      this.getDicts("robot_inspection_type").then(response => {
        this.inspectionOption = response.data;
      });
      this.getDicts("robot_strategy_type").then(response => {
        this.strategyOption = response.data;
      });
    },
    async loadStrategyList() {
      this.loading = true;
      const res = await getStrategyList(this.queryParams);
      this.strategyList = res.rows;
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
      this.loadStrategyList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加策略";
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selection = selection;
      this.ids = selection.map(item => item.id);
      this.strategyIds = selection.map(item => item.strategyId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 修改按钮操作 */
    async handleUpdate(row) {
      this.reset();
      const id = row?.id || this.ids;
      const res = await getStrategyDetail(id);
      this.currentRow = res.data;
      this.open = true;
      this.title = "修改策略";
    },
    /** 删除按钮操作 */
    async handleDelete(row) {
      const Ids = row?.id || this.ids.join(",");
      const strategyIds = row?.strategyId || this.strategyIds.join(",");
      await getStrategyDelete(Ids, strategyIds);
      this.msgSuccess("删除成功");
      this.updateList();
    },
    updateList() {
      this.loadStrategyList();
    }
  }
};
</script>

<style></style>
