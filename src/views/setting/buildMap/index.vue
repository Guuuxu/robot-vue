<template>
  <div class="build-map app-container">
    <div>
      <el-button type="primary" plain @click="handleStart" :disabled="isConnected === false">开始</el-button>
      <el-button type="primary" plain @click="save">保存</el-button>
    </div>
    <!-- 放置地图的容器 -->
    <div class="map_show mt10" id="map_show"></div>
  </div>
</template>

<script>
import { startMapNode, generateMap } from '@/api/map'
import * as ROSLIB from 'roslib'
import * as ROS3D from 'ros3d'
import global from '@/utils/global'
export default {
  data() {
    return {
      car_space: '', // 小车 命名空间（唯一）
      speed: 10, // 初始速度
      carlist: [
        {
          value: '',
          label: 'car1'
        },
        {
          value: 'ros2',
          label: 'car2'
        }
      ],
      twist: new ROSLIB.Message({
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 }
      }),
      flag: false, //按钮flag
      isConnected: false
    }
  },
  created() {
    if (this.carlist.length > 0) {
      this.car_space = this.carlist[0].value
    }
    // 初始化ros连接
    this.init_ros()
  },
  methods: {
    // 初始化连接ros服务器
    init_ros() {
      const that = this
      this.ros = new ROSLIB.Ros({
        url: global.RosConf
      })
      // const init_cmd_vel = this.init_cmd_vel;
      const keyboard = this.keyboard
      this.ros.on('connection', function () {
        console.log('连接成功.')
        console.log('订阅cmd_vel...')
        // init_cmd_vel();
        // 启用 开始 按钮
        that.isConnected = true
      })
      this.ros.on('error', function (error) {
        console.log('连接失败.')
        // alert("连接服务器失败...");
      })
      this.ros.on('close', function () {
        console.log('连接关闭')
        that.isConnected = false
        that.flag = false
      })
      console.log(this.ros)
    },
    init_cmd_vel: function () {
      this.cmdVel = new ROSLIB.Topic({
        ros: this.ros,
        name: this.car_space + '/cmd_vel', // 动态选择
        messageType: 'geometry_msgs/Twist'
      })
      console.log(this.cmdVel)
    },
    // 开始
    async handleStart() {
      // 重置容器
      document.getElementById('map_show').innerHTML = ''
      if (!this.ros.isConnected) {
        console.log('服务器连接失败，请按 f5 刷新页面.')
        return
      }
      try {
        // this.$myMessage.info("初始化建图环境...");
        const res = await startMapNode()
        this.init_view()
        this.flag = true
      } catch (msg) {}
    },
    init_view: function () {
      // 通过ros server 进行进程管控
      alert('初始化建图环境...')
      // 初始化3d场景
      var viewer = new ROS3D.Viewer({
        divID: 'map_show',
        width: document.getElementById('map_show').scrollWidth,
        height: document.getElementById('map_show').scrollHeight
      })
      // 添加网格
      viewer.addObject(new ROS3D.Grid())
      // 添加地图
      var gridClient = new ROS3D.OccupancyGridClient({
        ros: this.ros,
        rootObject: viewer.scene,
        topicName: this.car_space + '/map', // 动态选择
        continuous: true, // slam
        antialias: true
      })
      // 添加模型
      var tfClient = new ROSLIB.TFClient({
        ros: this.ros,
        angularThres: 0.01,
        transThres: 0.01,
        rate: 10.0,
        fixedFrame: 'my_frame' // map 楼层共用
      })
      var markerClient = new ROS3D.MarkerClient({
        ros: ros,
        tfClient: tfClient,
        topic: '/visualization_marker',
        rootObject: viewer.scene
      })
      // var urdfClient = new ROS3D.UrdfClient({
      //   ros: this.ros,
      //   tfClient: tfClient,
      //   path: "/static/carmodel/",
      //   param: this.car_space + "/robot_description", //模型的参数名
      //   rootObject: viewer.scene,
      //   tfPrefix: this.car_space // 动态选择
      // });
      // 添加雷达
      // var laserscan = new ROS3D.LaserScan({
      //   ros: this.ros,
      //   topic: this.car_space + "/scan", //动态选择
      //   tfClient: tfClient,
      //   rootObject: viewer.scene,
      //   material: {
      //     color: 0xff00ff,
      //     size: 0.1
      //   }
      // });
    },
    // select change事件 重新订阅cmd_vel
    selectChange: function () {
      this.init_cmd_vel()
    },
    save() {
      generateMap()
    },
    cancel() {
      this.$emit('update:isVisible', false)
      this.$emit('update:visibleVideo', true)
      this.resetForm('sensorForm')
    }
  }
}
</script>

<style lang="scss" scoped>
.build-map {
  height: calc(100vh - 84px - 40px);
  .map_show {
    height: calc(100vh - 84px - 40px - 40px);
    background-color: #000;
    width: 100%;
  }
}
</style>
