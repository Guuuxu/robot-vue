<template>
  <el-dialog
    class="select-node-group-dialog"
    :title="title"
    :visible.sync="isVisible"
    width="400px"
    append-to-body
    :close-on-click-modal="false"
    :before-close="cancel"
  >
    <el-form :model="nodeForm" ref="nodeForm" :rules="rules">
      <el-form-item class="range-item" label="开始编码号" prop="startnum">
        <el-input
          class="common-input"
          v-model="nodeForm.startnum"
          placeholder=""
        />
      </el-form-item>
      <el-form-item class="range-item" label="结束编码号" prop="endnum">
        <el-input
          class="common-input"
          v-model="nodeForm.endnum"
          placeholder=""
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button type="primary" @click="onConfirm">确 定 </el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import MapBuilderConstant from "@/plugins/map/mapbuilder-constant";
export default {
  name: "",
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "编码范围设定"
    }
  },
  data() {
    const checkStartnum = (rule, value, callback) => {
      if (parseInt(this.nodeForm.startnum) == parseInt(this.nodeForm.endnum)) {
        callback(new Error("开始和结束的编号不能相同"));
      } else if (
        parseInt(this.nodeForm.startnum) > parseInt(this.nodeForm.endnum)
      ) {
        callback(new Error("开始的编号不能大于结束编号"));
      } else {
        callback();
      }
    };
    return {
      rules: {
        startnum: [
          { required: true, message: "请输入开始编码号", trigger: "blur" },
          { pattern: /^[0-9]*$/, message: "请输入正整数", trigger: "blur" }, // 只能输入正整数
          { validator: checkStartnum, trigger: "blur" }
        ],
        endnum: [
          { required: true, message: "请输入结束编码号", trigger: "blur" },
          { pattern: /^[0-9]*$/, message: "请输入正整数", trigger: "blur" }, // 只能输入正整数
          { validator: checkStartnum, trigger: "blur" }
        ]
      },
      nodeForm: {
        startnum: "",
        endnum: ""
      },
      fromFatherData: null
    };
  },
  methods: {
    setDialogData(data) {
      this.fromFatherData = data;
    },
    onConfirm() {
      this.$refs["nodeForm"].validate(valid => {
        if (valid) {
          this.fromFatherData.toolhandler.addPathNodeGroup(
            this.fromFatherData.mapBuilder,
            parseInt(this.nodeForm.startnum),
            parseInt(this.nodeForm.endnum)
          );
          this.fromFatherData.mapBuilder.setTool(
            MapBuilderConstant.TOOL_SELECT
          );
          this.fromFatherData.mapBuilder.setToolMode(
            MapBuilderConstant.TOOL_SELECT_MODE_DEFAULT
          );
          this.$emit("onSet", "3");
          this.$emit("update:isVisible", false);
        }
      });
    },
    cancel() {
      this.$emit("update:isVisible", false);
      this.resetForm("nodeForm");
    }
  }
};
</script>

<style lang="scss" scoped>
.select-node-group-dialog {
  margin: 0 auto;
  margin-top: 250px;
  .dialog-footer {
    text-align: right;
  }
}
</style>
