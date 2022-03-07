<template>
  <div class="document app-container">
    <el-form
      :model="queryParams"
      v-show="showSearch"
      ref="queryForm"
      :inline="true"
    >
      <el-form-item label="文件名称" prop="fileName">
        <el-input
          size="small"
          v-model="queryParams.fileName"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="文件类型" prop="fileType">
        <el-select
          v-model="queryParams.fileType"
          placeholder="请选择"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in fileOption"
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
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="loadDocumentList"
      ></right-toolbar>
    </el-row>
    <el-table :data="list">
      <el-table-column label="文件名称" prop="fileName" align="center" />
      <el-table-column
        label="类型"
        align="center"
        :formatter="fileTypeFormat"
      ></el-table-column>
      <el-table-column label="站所ID" prop="stationId" align="center" />
      <el-table-column label="上传时间" prop="createTime" align="center">
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
            icon="el-icon-download"
            @click="handleDownload(scope.row)"
            >下载</el-button
          >
          <el-popconfirm
            class="icon-delete-pop"
            title="确定删除这份文件吗？"
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
      @pagination="loadDocumentList"
    />
    <!-- 添加文件对话框 -->
    <add-document-dialog
      :isVisible.sync="isShow"
      :title="title"
      :option="fileOption"
      @onUpdate="updateList"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { downLoadZip } from "@/utils/zipdownload";
import AddDocumentDialog from "./components/AddDocumentDialog";
import { getDocumentList, deleteDocument } from "@/api/document";
export default {
  name: "Document",
  components: { AddDocumentDialog },
  computed: {
    ...mapGetters(["stationId"])
  },
  data() {
    return {
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        fileName: undefined,
        fileType: "",
        stationId: ""
      },
      // 显示搜索条件
      showSearch: true,
      fileOption: [],
      total: 0,
      list: [],
      isShow: false,
      title: "文件新增"
    };
  },
  created() {
    this.loadDocumentList();
    this.loadDicts();
  },
  methods: {
    loadDicts() {
      this.getDicts("robot_file_type").then(response => {
        this.fileOption = response.data;
      });
    },
    /** 查询文档列表 */
    async loadDocumentList() {
      this.queryParams.stationId = this.stationId;
      const res = await getDocumentList(this.queryParams);
      this.total = res.total;
      this.list = res.rows;
    },
    // 文件类型字典翻译
    fileTypeFormat(row, column) {
      return this.selectDictLabel(this.fileOption, row.fileType);
    },
    // 搜索
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.loadDocumentList();
    },
    // 重置
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.isShow = true;
    },
    /** 下载操作 */
    handleDownload(row) {
      downLoadZip("/robot/upload/download?id=" + row.id);
    },
    async handleDelete(row) {
      await deleteDocument(row.id);
      this.updateList();
      this.msgSuccess("删除成功");
    },
    // 更新列表
    updateList() {
      this.loadDocumentList();
    }
  }
};
</script>

<style></style>
