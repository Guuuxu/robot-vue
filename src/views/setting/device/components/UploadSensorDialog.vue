<template>
  <el-dialog
    :title="upload.title"
    :visible.sync="isVisible"
    width="400px"
    append-to-body
  >
    <el-upload
      ref="upload"
      :limit="1"
      accept=".xlsx, .xls"
      :headers="upload.headers"
      :action="upload.url + '?updateSupport=' + upload.updateSupport"
      :disabled="upload.isUploading"
      :on-progress="handleFileUploadProgress"
      :on-success="handleFileSuccess"
      :auto-upload="false"
      drag
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
      <div class="el-upload__tip" slot="tip">
        <!-- <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据 -->
        <el-link type="info" style="font-size:12px">下载模板</el-link>
      </div>
      <div class="el-upload__tip" style="color:red" slot="tip">
        提示：仅允许导入“xls”或“xlsx”格式文件！
      </div>
    </el-upload>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitFileForm">确 定</el-button>
      <el-button @click="$emit('update:isVisible', false)">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getToken } from "@/utils/auth";
export default {
  name: "UploadSensorDialog",
  props: {
    // 是否显示弹出层（用户导入）
    isVisible: {
      type: Boolean,
      default: false
    },
    // 弹出层标题（用户导入）
    title: {
      type: String,
      default: "测点导入"
    }
  },
  data() {
    return {
      // 用户导入参数
      upload: {
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 1,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/robot/sensor/importData"
      }
    };
  },
  methods: {
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(response.msg, "导入结果", { dangerouslyUseHTMLString: true });
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    }
  }
};
</script>

<style></style>
