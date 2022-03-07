<template>
  <!-- 添加或修改参数配置对话框 -->
  <el-dialog
    :title="title"
    :visible.sync="isVisible"
    width="500px"
    append-to-body
    :before-close="cancel"
  >
    <el-form :model="form" inline label-width="80px" :rules="rules">
      <el-form-item label="当前圈数" prop="level">
        <el-input v-model="form.level" />
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
import { getTaskStatus } from "@/api/inspect";
import { updateRobotNodePath } from "@/api/map";
export default {
  name: "UpdatePathLineDialog",
  props: {
    title: {
      type: String,
      default: "更新圈数"
    },
    isVisible: {
      type: Boolean,
      default: false
    },
    selectedObject: {
      type: Array,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      form: {
        ids: "",
        level: ""
      },
      rules: {
        posX: [{ required: true, message: "请输入圈数", trigger: "blur" }]
      }
    };
  },
  methods: {
    //添加虚拟点、充电点
    async submitForm() {
      try {
        this.loading = true;
        const ids = this.selectedObject.map(item => item.info.id);
        this.form.ids = ids.join(",");
        await updateRobotNodePath(this.form);
        this.loading = false;
        this.$myMessage.success("更新成功");
        this.$emit("onUpdate");
        this.cancel();
      } catch (error) {
        this.loading = false;
      }
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
