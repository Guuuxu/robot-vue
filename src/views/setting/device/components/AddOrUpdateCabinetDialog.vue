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
    <el-form
      :model="cabinetForm"
      ref="cabinetForm"
      label-width="80px"
      :rules="rules"
    >
      <el-form-item label="柜机名称" prop="deviceName">
        <el-input v-model="cabinetForm.deviceName" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="类型名称" prop="deviceType">
        <el-select v-model="cabinetForm.deviceType" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.dictValue"
            :label="item.dictLabel"
            :value="item.dictValue"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit" :loading="loading"
        >确 定</el-button
      >
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getAddDevice, updateDevice } from "@/api/setting/device";
import { getSiteIsUsing } from "@/api/setting/site";
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
      this.cabinetForm = JSON.parse(JSON.stringify(this.row));
    }
  },
  data() {
    return {
      cabinetForm: {},
      options: [],
      // 表单校验
      rules: {
        deviceName: [
          { required: true, message: "请输入柜机名称", trigger: "blur" }
        ],
        deviceType: [{ required: true, message: "请选择类型", trigger: "blur" }]
      },
      station: null,
      loading: false
    };
  },
  created() {
    this.loadDeviceType();
    this.loadSiteIsUsing();
  },
  methods: {
    // 查询使用中的站点
    async loadSiteIsUsing() {
      const res = await getSiteIsUsing();
      this.station = res.data[0];
    },
    async loadDeviceType() {
      const res = await this.getDicts("robot_device_type");
      this.options = res.data;
    },
    submit() {
      this.$refs["cabinetForm"].validate(async valid => {
        if (valid) {
          this.loading = true;
          if (this.cabinetForm.id != undefined) {
            await updateDevice(this.cabinetForm);
            this.loading = false;
            this.msgSuccess("编辑成功");
            this.$emit("update:isVisible", false);
            this.$emit("onUpdate");
          } else {
            this.cabinetForm.stationId = this.station.stationId;
            await getAddDevice(this.cabinetForm);
            this.loading = false;
            this.msgSuccess("添加成功");
            this.$emit("update:isVisible", false);
            this.$emit("onUpdate");
          }
        }
      });
    },
    cancel() {
      this.$emit("update:isVisible", false);
      this.resetForm("cabinetForm");
    }
  }
};
</script>

<style></style>
