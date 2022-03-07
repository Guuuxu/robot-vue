<template>
  <div class="app-container robot" v-loading="loading">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      :inline="true"
      label-width="80px"
    >
      <el-card>
        <div slot="header" class="clearfix">
          <span>可见光相机</span>
        </div>
        <el-form-item label="ip地址" prop="lightCameraIp">
          <el-input
            v-model="configData.lightCameraIp"
            placeholder="请输入ip地址"
          />
        </el-form-item>
        <el-form-item label="端口号" prop="lightCameraPort">
          <el-input
            v-model="configData.lightCameraPort"
            placeholder="请输入端口号"
          />
        </el-form-item>
        <el-form-item label="用户名" prop="lightCameraUser">
          <el-input
            v-model="configData.lightCameraUser"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="密码" prop="lightCameraPassword">
          <el-input
            v-model="configData.lightCameraPassword"
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item label="光芯位置X" prop="lightPositionX">
          <el-input
            v-model="configData.lightPositionX"
            placeholder="请输入光芯位置X"
          />
        </el-form-item>
        <el-form-item label="光芯位置Y" prop="lightPositionY">
          <el-input
            v-model="configData.lightPositionY"
            placeholder="请输入光芯位置Y"
          />
        </el-form-item>
        <el-form-item label="水平角度" prop="lightCameraHorizontalAngle">
          <el-input
            v-model="configData.lightCameraHorizontalAngle"
            placeholder="请输入水平角度"
          />
        </el-form-item>
      </el-card>
      <el-card class="infrared-camera mt10">
        <div slot="header" class="clearfix">
          <span>红外相机</span>
        </div>
        <el-form-item label="ip地址" prop="redCameraIp">
          <el-input
            v-model="configData.redCameraIp"
            placeholder="请输入ip地址"
          />
        </el-form-item>
        <el-form-item label="端口号" prop="redCameraPort">
          <el-input
            v-model="configData.redCameraPort"
            placeholder="请输入端口号"
          />
        </el-form-item>
        <el-form-item label="用户名" prop="redCameraUser">
          <el-input
            v-model="configData.redCameraUser"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="密码" prop="redCameraPassword">
          <el-input
            v-model="configData.redCameraPassword"
            placeholder="请输入密码"
          />
        </el-form-item>
      </el-card>
      <el-card class="mt10">
        <div slot="header" class="clearfix">
          <span>机器人本体</span>
        </div>
        <el-form-item label="ip地址" prop="robotIp">
          <el-input v-model="configData.robotIp" placeholder="请输入ip地址" />
        </el-form-item>
        <el-form-item label="端口号" prop="robotPort">
          <el-input v-model="configData.robotPort" placeholder="请输入端口号" />
        </el-form-item>
        <el-form-item label="用户名" prop="robotUser">
          <el-input v-model="configData.robotUser" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="robotPassword">
          <el-input
            v-model="configData.robotPassword"
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item label="机器人逆向零位" label-width="90" prop="robotNxlw">
          <el-input
            v-model="configData.robotNxlw"
            placeholder="请输入机器人逆向零位"
          />
        </el-form-item>
        <el-form-item label="机器人零位焦距" label-width="90" prop="robotLwjj">
          <el-input
            v-model="configData.robotLwjj"
            placeholder="请输入机器人零位焦距"
          />
        </el-form-item>
      </el-card>
      <el-card class="mt10">
        <div slot="header" class="clearfix">
          <span>数据中心</span>
        </div>
        <el-form-item label="ip地址" prop="dataSourceIp">
          <el-input
            v-model="configData.dataSourceIp"
            placeholder="请输入ip地址"
          />
        </el-form-item>
        <el-form-item label="端口号" prop="dataSourcePort">
          <el-input
            v-model="configData.dataSourcePort"
            placeholder="请输入端口号"
          />
        </el-form-item>
        <el-form-item label="机器人ID" prop="robotId">
          <el-input v-model="configData.robotId" placeholder="请输入机器人ID" />
        </el-form-item>
        <el-form-item label="出厂日期" prop="madeDate">
          <el-date-picker
            type="date"
            v-model="configData.madeDate"
            placeholder="请选择出厂日期"
          />
        </el-form-item>
      </el-card>
      <el-card class="mt10">
        <div slot="header" class="clearfix">
          <span>系统版本</span>
        </div>
        <el-form-item label="系统版本号" prop="versionNo" label-width="90">
          <el-input v-model="configData.versionNo" placeholder="请输入ip地址" />
        </el-form-item>
      </el-card>
      <!-- <el-card class="mt10">
         <el-form-item label="是否运输中" prop="ip" label-width="90">
          <el-switch
            v-model="switchValue3"
            >
          </el-switch>
        </el-form-item>
      </el-card> -->
      <div class="action-wrap">
        <el-form-item>
          <el-button type="cyan" @click="handleSave" :loading="saveLoading"
            >保存</el-button
          >
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { getRobotConfig, getEditRobotConfig } from "@/api/setting/robot";
export default {
  name: "Robot",
  data() {
    return {
      // 遮罩层
      loading: true,
      configData: {},
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      walkAvoidObstacle: 0,
      speedRadio: "",
      switchValue1: false,
      switchValue2: false,
      switchValue3: false,
      saveLoading: false
    };
  },
  created() {
    this.loadRobotConfig();
  },
  methods: {
    // 机器人配置
    async loadRobotConfig() {
      this.loading = true;
      const res = await getRobotConfig();
      this.configData = res.rows[0];
      this.setLightLocation();
      this.loading = false;
    },
    // 保存
    async handleSave() {
      this.saveLoading = true;
      await getEditRobotConfig(this.configData);
      this.saveLoading = false;
      this.setLightLocation();
      this.msgSuccess("保存成功");
    },
    // 存储可见光
    setLightLocation() {
      const lightLocation = [];

      lightLocation[0] = this.configData.lightPositionX;

      lightLocation[1] = this.configData.lightPositionY;

      lightLocation[2] = this.configData.lightCameraHorizontalAngle;
      this.$storage.setItem("lightLocation", lightLocation);

      // 红外
      var redCameraData = [];

      redCameraData[0] = this.configData.redCameraIp;

      redCameraData[1] = this.configData.redCameraPort * 1;

      redCameraData[2] = this.configData.redCameraUser;

      redCameraData[3] = this.configData.redCameraPassword;

      Cookies.set("infraredMode", JSON.stringify(redCameraData));
      this.$storage.setItem("infraredMode", JSON.stringify(redCameraData));
      // 可见光
      var canSeeData = [];

      canSeeData[0] = this.configData.lightCameraIp;

      canSeeData[1] = this.configData.lightCameraPort * 1;

      canSeeData[2] = this.configData.lightCameraUser;

      canSeeData[3] = this.configData.lightCameraPassword;
      this.$storage.setItem("lightMode", JSON.stringify(canSeeData));

      // Cookies.set("lightMode", JSON.stringify(canSeeData));
    }
  }
};
</script>

<style lang="scss" scoped>
.robot {
  .mt10 {
    margin-top: 10px;
  }
  .action-wrap {
    margin-top: 20px;
    text-align: center;
  }
  ::v-deep {
    .el-form-item {
      margin-bottom: 10px;
    }
  }
}
</style>
