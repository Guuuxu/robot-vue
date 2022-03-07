<template>
  <div class="app-container site-manage">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate(1)"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-popconfirm title="确定删除这些站点吗？" @confirm="handleDelete">
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
      <right-toolbar
        :showSearchTool="false"
        @queryTable="loadSiteList"
      ></right-toolbar>
    </el-row>
    <el-table
      v-loading="loading"
      :data="siteList"
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" align="center" width="50" />
      <el-table-column label="站所ID" align="center" prop="stationId" />
      <el-table-column label="站所名称" align="center" prop="stationName" />
      <el-table-column label="测点信息" align="center" prop="isHaveSensor">
        <template slot-scope="scope">
          {{ +scope.row.isHaveSensor ? "存在" : "不存在" }}
        </template>
      </el-table-column>
      <el-table-column label="地图信息" align="center" prop="isHaveMap">
        <template slot-scope="scope">
          {{ +scope.row.isHaveMap ? "存在" : "不存在" }}
        </template>
      </el-table-column>
      <el-table-column label="机器人版本" align="center" prop="roleId" />
      <el-table-column label="状态" align="center" width="120">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isUsed"
            active-value="1"
            :active-text="scope.row.isUsed == '1' ? '已启用' : ''"
            inactive-value="0"
            :disabled="scope.row.isUsed == '1' ? true : false"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-popconfirm
            class="icon-delete-pop"
            title="确定删除这个站点吗？"
            @confirm="handleDelete(scope.row)"
          >
            <el-button
              v-if="scope.row.parentId != 0"
              size="mini"
              type="text"
              icon="el-icon-delete"
              slot="reference"
              >删除</el-button
            >
          </el-popconfirm>

          <!-- <el-button
            v-if="scope.row.parentId != 0"
            size="mini"
            type="text"
            icon="el-icon-download"
            @click="handleExport(scope.row)"
          >导出</el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <!-- 站点添加或修改对话框 -->
    <add-or-update-site-dialog
      :title="title"
      :isVisible.sync="isShowAddSiteDialog"
      @onUpdate="updateList"
      :row.sync="currentRow"
    />
  </div>
</template>

<script>
import AddOrUpdateSiteDialog from "./components/AddOrUpdateSiteDialog";
import {
  getSiteList,
  deleteSite,
  updateStationStatus
} from "@/api/setting/site";
import { mapState } from "vuex";
export default {
  name: "SiteManage",
  components: { AddOrUpdateSiteDialog },
  data() {
    return {
      // 遮罩层
      loading: true,
      siteList: [],
      // 选中数组
      ids: [],
      stationIds: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      isShowAddSiteDialog: false,
      title: "",
      currentRow: {},
      selection: []
    };
  },
  computed: {
    ...mapState(["user"])
  },
  created() {
    this.loadSiteList();
  },
  methods: {
    async loadSiteList() {
      this.loading = true;
      const res = await getSiteList();
      this.siteList = res.rows;
      this.loading = false;
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selection = selection;
      this.ids = selection.map(item => item.id);
      this.stationIds = selection.map(item => item.stationId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    // 新增操作
    handleAdd() {
      this.reset();
      this.isShowAddSiteDialog = true;
      this.title = "添加站点";
    },
    // 编辑操作
    handleUpdate(row) {
      this.reset();
      this.title = "修改站点";
      this.isShowAddSiteDialog = true;
      if (row == 1) {
        this.currentRow = this.selection[0];
      } else {
        this.currentRow = row;
      }
    },
    // 站点启用
    async handleStatusChange(row) {
      const res = await updateStationStatus({
        id: row.id,
        isUsed: 1,
        updateBy: this.user.name
      });

      this.$store.commit("robot/SET_STATION", {
        stationId: row.stationId,
        stationName: row.stationName
      });
      // 导航地图信息
      const originPoint = [row.originX, row.originY];
      this.$storage.setItem("scaling", JSON.stringify(row.scaling));
      this.$storage.setItem("originPoint", JSON.stringify(originPoint));
      this.$storage.setItem("pxToPos", JSON.stringify(row.pxToPos));
      this.loadSiteList();
    },
    // 删除站点
    async handleDelete(row) {
      const userIds = row?.id || this.ids;
      await deleteSite(userIds);
      this.loadSiteList();
      this.msgSuccess("删除成功");
    },
    // 导出
    handleExport() {},
    // 更新列表
    updateList() {
      this.loadSiteList();
    },
    // 表单重置
    reset() {
      this.currentRow = {};
    }
  }
};
</script>

<style lang="scss" scoped>
.site-manage {
  ::v-deep {
    .el-switch__label * {
      font-size: 12px;
    }
  }
}
</style>
