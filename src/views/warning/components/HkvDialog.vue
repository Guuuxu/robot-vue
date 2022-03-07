<template>
  <el-dialog
    class="hkv-dialog"
    :title="title"
    :visible.sync="isVisible"
    width="400"
    append-to-body
    :close-on-click-modal="false"
    :before-close="cancel"
  >
    <div class="camera-wrap">
      <h-k-v />
    </div>
  </el-dialog>
</template>

<script>
import HKV from "@/views/setting/device/components/HKV";
export default {
  name: "HkvDialog",
  components: { HKV },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "机器人视频"
    }
  },
  methods: {
    cancel() {
      this.$emit("update:isVisible", false);
    }
  }
};
</script>

<style lang="scss" scoped>
.camera-wrap {
  width: 100%;
  height: 300px;
}
</style>
