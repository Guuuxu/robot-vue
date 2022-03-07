<template>
  <el-dialog
    class="site-dialog"
    :title="title"
    :visible.sync="isVisible"
    width="400px"
    append-to-body
    :close-on-click-modal="false"
    :before-close="cancel"
  >
    <el-form :model="siteForm" ref="siteForm" label-width="80px" inline="">
      <el-form-item label="站所名称" prop="stationName">
        <el-input v-model="siteForm.stationName" />
      </el-form-item>
      <el-form-item label="站所编号" prop="stationId">
        <el-input
          :readonly="siteForm.id ? true : false"
          v-model="siteForm.stationId"
          class="common-input"
        />
        <span class="text-danger" v-if="siteForm.id">(不可更改)</span>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getAddSite, getEditSite } from "@/api/setting/site";
export default {
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ""
    },
    row: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    isVisible() {
      this.siteForm = JSON.parse(JSON.stringify(this.row));
    }
  },
  data() {
    return {
      siteForm: {
        stationName: "",
        stationId: ""
      }
    };
  },
  methods: {
    submit() {
      this.$refs["siteForm"].validate(async valid => {
        if (valid) {
          if (this.siteForm.id != undefined) {
            await getEditSite(this.siteForm);
            this.msgSuccess("修改成功");
            this.$emit("update:isVisible", false);
            this.$emit("onUpdate");
          } else {
            await getAddSite(this.siteForm);
            this.msgSuccess("添加成功");
            this.$emit("update:isVisible", false);
            this.$emit("onUpdate");
          }
        }
      });
    },
    cancel() {
      this.$emit("update:isVisible", false);
      this.resetForm("siteForm");
    }
  }
};
</script>

<style lang="scss" scoped>
.site-dialog {
  .text-danger {
    font-size: 12px;
    margin-left: 5px;
  }
}
</style>
