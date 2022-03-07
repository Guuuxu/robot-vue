<template>
  <!-- 添加或修改参数配置对话框 -->
  <el-dialog :title="title" :visible.sync="isVisible" width="500px" append-to-body :before-close="cancel">
    <el-form :model="form" inline label-width="80px" :rules="rules">
      <el-form-item label="坐标X" prop="posX">
        <el-input v-model="form.posX" />
      </el-form-item>
      <el-form-item label="坐标Y" prop="posY">
        <el-input v-model="form.posY" />
      </el-form-item>
      <el-form-item label="排序" prop="sort" v-if="nodeType === 2 || nodeType === 5">
        <el-input v-model="form.sort" />
      </el-form-item>
      <el-form-item label="车身角度" prop="bodyAngle" v-if="nodeType === 2">
        <el-input v-model="form.bodyAngle" />
      </el-form-item>
      <el-form-item label="角度" prop="angle" v-if="nodeType === 2 || nodeType === 5">
        <el-input v-model="form.angle" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm" :loading="loading">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getTaskStatus } from '@/api/inspect'
import { getRobotMapPath } from '@/api/map'
export default {
  name: 'AddVirtualPointDialog',
  props: {
    title: {
      type: String,
      default: '添加虚拟点'
    },
    isVisible: {
      type: Boolean,
      default: false
    },
    option: {
      type: Array,
      default: () => []
    },
    nodeType: {
      type: Number,
      default: 1
    }
  },
  watch: {
    isVisible() {
      this.fetchTaskStatus()
    }
  },
  data() {
    return {
      loading: false,
      form: {
        posX: '',
        posY: '',
        sort: '',
        angle: 0,
        bodyAngle: 0
      },
      rules: {
        posX: [{ required: true, message: '请输入X坐标', trigger: 'blur' }],
        posY: [{ required: true, message: '请输入Y坐标', trigger: 'blur' }],
        sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 实时状态
    async fetchTaskStatus() {
      try {
        const res = await getTaskStatus()
        this.form.posX = res.data.posX
        this.form.posY = res.data.posY
        this.form.bodyAngle = res.data.bodyAngle
      } catch (error) {}
    },
    //添加虚拟点、充电点
    async submitForm() {
      try {
        this.loading = true
        this.form.nodeType = this.nodeType
        this.form.obstacleEndSteel = '0'
        let mapData = {
          pathNodes: new Array()
        }
        mapData.pathNodes.push(this.form)
        await getRobotMapPath(mapData)
        this.loading = false
        this.$myMessage.success('添加成功')
        this.$emit('onUpdate')
        this.cancel()
      } catch (error) {
        this.loading = false
      }
    },
    cancel() {
      this.$emit('update:isVisible', false)
      this.resetForm('form')
    }
  }
}
</script>

<style lang="scss" scoped>
.file-input {
  visibility: hidden;
  position: absolute;
  top: 0;
}
</style>
