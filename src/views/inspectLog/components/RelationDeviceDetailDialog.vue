<template>
  <el-dialog
    class="site-dialog"
    title="关联测点"
    :visible.sync="isVisible"
    width="60%"
    append-to-body
    :close-on-click-modal="false"
    :before-close="cancel"
  >
    <el-table :data="detail">
      <el-table-column label="设备名称" align="center" prop="deviceName" />
      <el-table-column label="检测内容" align="center" prop="sensorId" />
      <el-table-column label="结果" align="center" prop="inspectionResult" />
      <el-table-column label="图片" align="center" prop="inspectionResult">
        <template slot-scope="scope">
          <el-image
            style="width: 60px; height: 40px"
            :src="scope.row.visibleLightFile"
            fit="contain"
            :preview-src-list="[scope.row.visibleLightFile]"
          >
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="巡检时间" align="center" prop="beginTime" />
      <el-table-column label="状态" align="center" prop="judgment" />
    </el-table>
  </el-dialog>
</template>

<script>
export default {
  name: "RelationDeviceDetailDialog",
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    detail: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      srcList: []
    };
  },
  methods: {
    cancel() {
      this.$emit("update:isVisible", false);
    }
  }
};
</script>

<style></style>
