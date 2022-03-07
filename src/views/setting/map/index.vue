<template>
  <div class="map">
    <div class="left-board">
      <h4 class="button">基本元件</h4>
      <ul class="component-ul">
        <li :class="{ active: currentIndex == '3' }" @click="selectComponent('3')">指针工具</li>
        <li :class="{ active: currentIndex == '5' }" @click="selectComponent('5')">添加虚拟点</li>
        <li :class="{ active: currentIndex == '6' }" @click="selectComponent('6')">添加充电点</li>
        <!-- <li
          :class="{ active: currentIndex == '7' }"
          @click="selectComponent('7')"
        >
          添加辅助点
        </li>-->
        <li :class="{ active: currentIndex == '8' }" @click="selectComponent('8')">更新圈数</li>
        <li :class="{ active: currentIndex == '9' }" @click="selectComponent('9')">设置检修区</li>
      </ul>
    </div>
    <div class="center-board">
      <div class="action-wrap">
        <el-button size="mini" @click="handleRevoke">撤销</el-button>
        <el-popconfirm title="确定删除这个点吗？" @confirm="handleDelete">
          <el-button class="ml10" size="mini" type="danger" icon="el-icon-delete" slot="reference">删除</el-button>
        </el-popconfirm>
      </div>
      <img ref="img" />
      <div class="canvas mt20" id="inspectionMap">
        <canvas class="canvas-body" id="canvas">您的电脑不支持canvas.请升级浏览器或使用谷歌浏览器！</canvas>
      </div>
    </div>
    <div class="right-board">
      <el-card value="2" class="prop-card">
        <div slot="header" class="clearfix">
          <span>地图点列表</span>
        </div>
        <el-tree
          ref="nodeTree"
          :data="nodeTreeData"
          node-key="id"
          show-checkbox
          check-strictly
          highlight-current
          default-expand-all
          :props="nodeProps"
          @check-change="handleNodeClick"
        ></el-tree>
      </el-card>
      <el-card class="prop-card mt10">
        <div slot="header" class="clearfix">
          <span>属性</span>
        </div>
        <el-form :model="currentObject" label-width="110px">
          <el-form-item label="X:" prop="posX">
            <el-input size="mini" class="steelNo" v-model="currentObject.posX" :readonly="currentObject.nodeType === 1"></el-input>
          </el-form-item>
          <el-form-item label="Y:" prop="posY">
            <el-input size="mini" class="steelNo" v-model="currentObject.posY" :readonly="currentObject.nodeType === 1"></el-input>
          </el-form-item>
          <el-form-item label="角度:" prop="angle" v-show="currentObject.nodeType !== 3">
            <el-input size="mini" class="angle" v-model="currentObject.angle" />
          </el-form-item>
          <el-form-item
            label="车身角度:"
            prop="angle"
            v-show="
              currentObject.nodeType === 3 || currentObject.nodeType === 2
            "
          >
            <el-input size="mini" class="angle" v-model="currentObject.bodyAngle" />
          </el-form-item>
          <!-- <el-form-item label="编码:" prop="steelNo">
            <el-input
              size="mini"
              class="steelNo"
              v-model="currentObject.steelNo"
            ></el-input>
          </el-form-item>-->
          <el-form-item label="排序:" prop="sort" v-show="currentObject.nodeType !== 3">
            <el-input class="value" size="mini" v-model="currentObject.sort" :readonly="true"></el-input>
          </el-form-item>
          <el-form-item label="避障失效:" prop="obstacleEndSteel" class="end-steel">
            <el-select class="warning-select" v-model="currentObject.obstacleEndSteel" size="mini">
              <el-option v-for="dict in obstacleOption" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
            </el-select>
          </el-form-item>
          <el-form-item label="圈数:" prop="sort">
            <el-input class="value" size="mini" v-model="currentObject.level"></el-input>
          </el-form-item>
          <!-- <el-form-item label="速度:" prop="speed">
            <el-input-number
              class=" "
              size="mini"
              :min="0"
              :max="0.5"
              :step="0.01"
              v-model="currentObject.speed"
            ></el-input-number>
          </el-form-item>-->
          <el-form-item label="类型:" prop="sort">
            {{
            currentObject.nodeType &&
            (currentObject.nodeType === 1
            ? "地图点"
            : currentObject.nodeType === 2
            ? "虚拟点"
            : "充电点")
            }}
          </el-form-item>
          <el-form-item>
            <el-button size="mini" type="primary" @click="save">保存</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <select-node-group-dialog ref="nodeGroupDialog" :isVisible.sync="isShowNodeGroup" @onSet="setCurrentIndex" />
    <!-- 添加虚拟点 -->
    <add-virtual-point-dialog :isVisible.sync="isShowVirtualPoint" :title.sync="pointTitle" :nodeType.sync="nodeType" @onUpdate="init" />
    <!-- 更新圈数 -->
    <update-path-line-dialog :isVisible.sync="isShowPathLine" :selectedObject.sync="selectedObject" @onUpdate="init" />
    <!-- 设置检修区 -->
    <setting-repair-area-dialog :isVisible.sync="isShowRepairArea" @onUpdate="update" />
  </div>
</template>

<script>
import MapBuilder from '@/plugins/map/mapbuilder'
import paintRos from '@/plugins/map-ros'
import MapBuilderConstant from '@/plugins/map/mapbuilder-constant'
import { updateRobotMapPath, deleteRobotMapNode } from '@/api/map'
import { getSiteIsUsing } from '@/api/setting/site'
import SelectNodeGroupDialog from './components/SelectNodeGroupDialog'
import AddVirtualPointDialog from './components/AddVirtualPointDialog'
import UpdatePathLineDialog from './components/UpdatePathLineDialog'
import SettingRepairAreaDialog from './components/SettingRepairAreaDialog'
export default {
  name: 'Map',
  components: {
    SelectNodeGroupDialog,
    AddVirtualPointDialog,
    UpdatePathLineDialog,
    SettingRepairAreaDialog
  },
  data() {
    return {
      currentIndex: '3',
      // 节点列表
      nodeTreeData: [
        {
          name: this.$store.state.robot.stationName,
          disabled: true,
          children: []
        }
      ],
      nodeProps: {
        children: 'children',
        label: (data, node) => {
          if (!data.nodeType) {
            return data.name
          } else {
            if (data.nodeType === 1) return '地图点 ' + data.sort
            if (data.nodeType === 2) return '虚拟点 ' + data.sort
            if (data.nodeType === 3) return '充电点 ' + data.sort
            if (data.nodeType === 5) return '辅助点 ' + data.sort
          }
        }
      },
      obstacleOption: [],
      currentObject: {
        angle: '', // 线条弯曲角度
        bodyAngle: '',
        level: '',
        steelNo: '',
        distance: '',
        speed: '',
        obstacleEndSteel: '',
        chspeedEndSteel: ''
      },
      mapBuilder: null,
      selectedObject: null,
      obj: null,
      isShowNodeGroup: false, // 轨道组询问框显示
      nodeType: 2,
      pointTitle: '添加虚拟点',
      isShowVirtualPoint: false,
      isShowPathLine: false,
      isShowRepairArea: false,
      imgSrc: ''
    }
  },
  async created() {
    const res = await getSiteIsUsing()
    const originPoint = [res.data[0].originX, res.data[0].originY]
    const originZeroPoint = [res.data[0].originZeroX, res.data[0].originZeroY]
    this.$storage.setItem('scaling', JSON.stringify(res.data[0].scaling))
    this.$storage.setItem('originPoint', JSON.stringify(originPoint))
    this.$storage.setItem('originZeroPoint', JSON.stringify(originZeroPoint))
    this.$storage.setItem('pxToPos', JSON.stringify(res.data[0].resolution))
  },
  mounted() {
    this.init()
    this.loadDicts()
  },
  methods: {
    init() {
      Promise.all([paintRos.load(), paintRos.loadDocumentList($('#inspectionMap')), this.bindMap()]).then(res => {
        // mapBuilder.mapController.redrawPath()
        this.mapBuilder.load(true)
      })
    },
    bindMap() {
      return new Promise((resolve, reject) => {
        // 开始画图
        // draw();
        const self = this
        var canvas = document.getElementsByTagName('canvas')[0]
        var copy = document.getElementsByClassName('copy')[0]
        var xp = $('.xp')[0]
        var cobj = canvas.getContext('2d')
        var mapBuilder = null
        mapBuilder = new MapBuilder()
        var MapBuilderM = mapBuilder

        //var obj=new shape(copy,cobj,xp,mapBuilder);
        // var obj = new shape(mapBuilder)
        // this.obj = obj
        mapBuilder.bindToDiv($('.canvas'))
        this.mapBuilder = MapBuilderM

        // 轨道节点列表
        mapBuilder.updateNodeList = list => {
          this.nodeTreeData[0].children.push(...list)
        }
        // 默认选中指针工具
        MapBuilderM.setTool(MapBuilderConstant.TOOL_SELECT)
        MapBuilderM.setToolMode(MapBuilderConstant.TOOL_SELECT_MODE_DEFAULT)

        //属性栏响应事件
        mapBuilder.onSelectedObjectChanged = function (mb) {
          if (mb.selectedObject.length > 1) {
            // self.showGroupObjectProperties(mb);
          } else {
            self.showSelectedObjectProperties(mb)
          }
        }
        mapBuilder.onSelectedPropertyChanged = function (mb) {
          self.updatePropertiesBox(mb)
        }
        //添加节点组事件
        mapBuilder.onAddNodeGroup = function (mb, toolhandler) {
          self.isShowNodeGroup = true
          self.$refs.nodeGroupDialog &&
            self.$refs['nodeGroupDialog'].setDialogData({
              mapBuilder: mb,
              toolhandler: toolhandler
            })
        }
        resolve('bind')
      })
    },
    loadDicts() {
      this.getDicts('obstacle_end_steel').then(response => {
        this.obstacleOption = response.data
      })
    },
    // 选择元件
    selectComponent(index) {
      this.currentIndex = index
      if (index == '3') {
        this.mapBuilder.setTool(MapBuilderConstant.TOOL_SELECT)
        this.mapBuilder.setToolMode(MapBuilderConstant.TOOL_SELECT_MODE_DEFAULT)
      } else {
        switch (parseInt(index)) {
          case MapBuilderConstant.TOOL_ADD_PATHNODE_LINE:
            this.mapBuilder.setTool(MapBuilderConstant.TOOL_ADD_PATHNODE)
            this.mapBuilder.setToolMode(MapBuilderConstant.TOOL_ADD_PATHNODE_LINE)
            this.nodeType = 1
            break
          case MapBuilderConstant.TOOL_ADD_PATHNODE_ARC90:
            this.mapBuilder.setTool(MapBuilderConstant.TOOL_ADD_PATHNODE)
            this.mapBuilder.setToolMode(MapBuilderConstant.TOOL_ADD_PATHNODE_ARC90)
            break
          case MapBuilderConstant.TOOL_ADD_PATHNODE_ARC90MINUS:
            this.mapBuilder.setTool(MapBuilderConstant.TOOL_ADD_PATHNODE)
            this.mapBuilder.setToolMode(MapBuilderConstant.TOOL_ADD_PATHNODE_ARC90MINUS)
            break
          case 5:
            this.isShowVirtualPoint = true
            this.nodeType = 2
            this.pointTitle = '添加虚拟点'
            break
          case 6:
            this.isShowVirtualPoint = true
            this.nodeType = 3
            this.pointTitle = '添加充电点'
            break
          case 7:
            this.isShowVirtualPoint = true
            this.nodeType = 5
            this.pointTitle = '添加画图辅助点'
            break
          case 8:
            if (this.mapBuilder.selectedObject.length) {
              console.log(this.mapBuilder.selectedObject)
              this.selectedObject = this.mapBuilder.selectedObject
              this.isShowPathLine = true
              this.pointTitle = '更新圈数'
            } else {
              this.$myMessage.warning('请选择一个点')
            }
            break
          case 9:
            this.mapBuilder.setTool(MapBuilderConstant.TOOL_SELECT)
            this.mapBuilder.setToolMode(MapBuilderConstant.TOOL_SELECT_MODE_DEFAULT)
            this.isShowRepairArea = true
            break
        }
        /*
          if ($(this).attr("data-role")=="bian"){
              obj.biannum=prompt("请输入边数",5)
          }
          if ($(this).attr("data-role")=="jiao"){
              obj.jiaonum=prompt("请输入角",5)
          }*/

        // this.obj.draw();
      }
    },
    // 设置当前工具
    setCurrentIndex(index) {
      this.currentIndex = index
    },
    // 设备列表点击
    handleClick(data, checked, node) {
      if (checked) {
        this.$refs.nodeTree.setCheckedNodes([])
      }
    },
    // 轨道节点点击
    handleNodeClick(data, checked, node) {
      if (checked) {
        this.$refs.nodeTree.setCheckedNodes([data])
        this.currentObject = this.mapBuilder.pathNodeList.find(item => item.id === data.id)
        // 查询点
        var selectedObj = this.mapBuilder.toolsList[3].findPropInPoint(
          this.mapBuilder,
          this.currentObject.mapNodeX,
          this.currentObject.mapNodeY,
          this.currentObject.id
        )
        this.mapBuilder.removeAllSelectedObject()
        this.mapBuilder.addSelectedObject(selectedObj)
      }
    },
    showSelectedObjectProperties(mapBuilderSelf) {
      if (mapBuilderSelf.selectedObject.length == 1) {
        //进入单图例标记状态
        this.currentObject = mapBuilderSelf.selectedObject[0].info
      }
    },
    updatePropertiesBox() {},
    // 撤销
    handleRevoke() {
      this.mapBuilder.revoke()
    },
    // 编辑保存
    async save() {
      if (!this?.currentObject?.id) {
        this.$myMessage.warning('请选择一个地图点')
        return
      }
      await updateRobotMapPath(this.currentObject)

      this.$myMessage.success('保存成功')
      this.nodeTreeData[0].children = []
      this.init()
    },
    // 删除
    async handleDelete() {
      const ids = this.mapBuilder.selectedObject.map(item => item.info.id)
      if (!ids.length) {
        this.$myMessage.warning('请选择一个点')
      }
      try {
        await deleteRobotMapNode(ids.join(','))
        this.mapBuilder.remove()
      } catch (error) {}
    },
    // 左对齐
    handleAlignLeft() {
      this.mapBuilder.alignLeft()
    },
    // 右对齐
    handleAlignRight() {
      this.mapBuilder.alignRight()
    },
    // 上对齐
    handleAlignTop() {
      this.mapBuilder.alignTop()
    },
    // 下对齐
    handleAlignBottom() {
      this.mapBuilder.alignBottom()
    },
    update() {
      this.mapBuilder.mapController.reLoadPath()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@assets/styles/css/canvas.css';
@import '~@assets/styles/css/mapbuilder.css';
.map {
  padding: 20px;
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  .left-board {
    width: 200px;
    padding-right: 30px;
    position: absolute;
    left: 20px;
    top: 0;
    height: 100vh;
    text-align: right;
    .component-ul {
      li {
        height: 30px;
        line-height: 30px;
        cursor: pointer;
        &.active {
          color: $menuActiveText;
        }
      }
    }
  }
  .center-board {
    height: calc(100vh - 84px - 40px);
    width: auto;
    margin: 0 330px 0 200px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    .action-wrap {
      margin-bottom: -10px;
      button {
        margin-bottom: 10px;
      }
    }
    .canvas {
      width: 100%;
      float: left;
      position: relative;
      height: 500px;
      overflow: auto;
      .canvas-body {
        width: 100%;
        // height: 438px;
      }
    }
  }
  .right-board {
    width: 330px;
    position: absolute;
    height: calc(100vh - 84px - 40px);
    right: 20px;
    top: 20px;
    .node-tabs {
      height: 50%;
      ::v-deep .el-tabs__content {
        height: calc(100% - 39px);
        overflow-y: scroll;
      }
    }
    .prop-card {
      height: 50%;
      ::v-deep {
        .el-form-item {
          margin-bottom: 0;
        }
        .el-card__body {
          height: calc(100% - 39px);
          overflow-y: scroll;
        }
        .el-radio {
          margin-right: 20px;
          &:last-child {
            margin-right: 0;
          }
        }
        .el-input-number {
          width: 100%;
        }
        .mini-input {
          width: 120px;
        }
      }
      .prop-card-body {
        .prop-item {
          @include fb(center);
          .label {
            width: 100px;
            display: inline-block;
            text-align: right;
          }
        }
      }
      .speedMode-slider {
        width: 90px;
        display: inline-block;
        margin-left: 10px;
      }
    }
  }
}
</style>
