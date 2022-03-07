<template>
  <el-dialog
    class="add-related-dialog"
    :title="title"
    :visible.sync="isVisible"
    width="400px"
    append-to-body
    :close-on-click-modal="false"
    :before-close="cancel"
  >
    <el-form
      :model="relatedForm"
      ref="relatedForm"
      label-width="110px"
      :rules="rules"
    >
      <el-form-item label="关联测点名称" prop="reName">
        <el-input
          class="common-input"
          v-model="relatedForm.reName"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="有效时间(月)" prop="validMonth">
        <el-select
          v-model="relatedForm.validMonth"
          placeholder="请选择"
          multiple
        >
          <el-option v-for="i in month" :key="i" :label="i" :value="i">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit" :loading="loading"
        >确 定
      </el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  addRelationSensor,
  updateRelationSensor
} from "@/api/setting/relationSensor";
export default {
  name: "AddRelatedSensorDialog",
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "新增关联列表"
    },
    row: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    isVisible(val) {
      this.$nextTick(() => {
        this.$refs?.relatedForm.clearValidate();
      });
      if (val) {
        console.log(this.row);
        if (this.row?.id) {
          const row = JSON.parse(JSON.stringify(this.row));
          this.relatedForm = {
            ...row,
            validMonth: row?.validMonth && row.validMonth.split(",")
          };
        } else {
          this.relatedForm = {
            reName: "",
            validMonth: ""
          };
        }
      }
    }
  },
  data() {
    return {
      loading: false,
      month: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      relatedForm: {
        reName: "",
        validMonth: ""
      },
      // 表单校验
      rules: {
        reName: [
          { required: true, message: "请输入柜机名称", trigger: "blur" }
        ],
        validMonth: [
          { required: true, message: "请选择类型", trigger: "change" }
        ]
      }
    };
  },
  methods: {
    async submit() {
      this.loading = true;
      const validMonthStr = this.relatedForm.validMonth.join(",");
      if (!this.relatedForm?.id) {
        await addRelationSensor({
          reName: this.relatedForm.reName,
          validMonth: validMonthStr
        });
        this.loading = false;
        this.msgSuccess("添加成功");
      } else {
        await updateRelationSensor({
          id: this.relatedForm.id,
          reName: this.relatedForm.reName,
          validMonth: validMonthStr
        });
        this.loading = false;
        this.msgSuccess("编辑成功");
      }

      this.$emit("onUpdate");
      this.$emit("update:isVisible", false);
      this.resetForm("relatedForm");
    },
    cancel() {
      this.$emit("update:isVisible", false);
      this.resetForm("relatedForm");
    }
  }
};
</script>

<style></style>
