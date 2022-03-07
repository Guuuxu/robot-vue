<template>
  <!-- 添加或修改参数配置对话框 -->
  <el-dialog
    :title="title"
    :visible.sync="isVisible"
    width="500px"
    append-to-body
    :before-close="cancel"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="文件名称" prop="file">
        <el-upload
          action="#"
          accept="application/msword,
          application/vnd.ms-works,
          application/rtf,
          text/rtf,
          application/pdf,
          application/vnd.ms-excel,
          application/octet-stream,
          application/vnd.ms-word.document.macroEnabled.12,
          application/vnd.openxmlformats-officedocument.wordprocessingml.document,
          application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          :http-request="requestUpload"
          :show-file-list="false"
          :before-upload="beforeUpload"
        >
          <el-button size="mini">
            选取文件
            <i class="el-icon-upload el-icon--right"></i>
          </el-button>
          <span class="ml5">{{ (form.file && form.file.name) || "" }}</span>
        </el-upload>
      </el-form-item>
      <el-form-item label="文件类型" prop="fileType">
        <el-select v-model="form.fileType" placeholder="请选择文件类型">
          <el-option
            v-for="item in option"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="item.dictValue"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm" :loading="loading"
        >确 定
      </el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from "vuex";
import { uploadDocument } from "@/api/document";
export default {
  name: "AddDocumentDialog",
  props: {
    title: "",
    isVisible: {
      type: Boolean,
      default: false
    },
    option: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(["stationId"])
  },
  data() {
    const validateFile = (rule, value, callback) => {
      console.log(value);
      if (!value) {
        callback(new Error("请选取文件"));
      } else {
        callback();
      }
    };
    return {
      loading: false,
      // 表单校验
      rules: {
        file: [{ required: true, validator: validateFile }],
        fileType: [
          { required: true, message: "请选择文件类型", trigger: "change" }
        ]
      },
      form: {
        file: null
      },
      fileOption: []
    };
  },
  methods: {
    requestUpload() {},
    // 上传预处理
    beforeUpload(file) {
      this.form.file = file;
    },
    submitForm() {
      this.$refs["form"].validate(async valid => {
        if (valid) {
          try {
            this.loading = true;
            const formData = new FormData();
            formData.append("file", this.form.file);
            formData.append("fileType", this.form.fileType);
            formData.append("stationId", this.stationId);
            await uploadDocument(formData);
            this.msgSuccess("添加成功");
            this.$emit("update:isVisible", false);
            this.$emit("onUpdate");
            this.loading = false;
            this.resetForm("form");
          } catch (error) {
            this.loading = false;
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
.file-input {
  visibility: hidden;
  position: absolute;
  top: 0;
}
</style>
