<template>
  <div class="related-sensor app-container">
    <el-row class="related-sensor-row" :gutter="40">
      <el-col :span="6" class="device-col">
        <el-card class="device-card">
          <div slot="header" class="clearfix">
            <span>关联设备列表</span>
          </div>
          <div class="device-body" ref="deviceBody">
            <el-tree
              ref="tree"
              :data="deviceOptions"
              :props="defaultProps"
              default-expand-all
              show-checkbox
              highlight-current
              @check-change="handleCheckChange"
              @node-click="handleNodeClick"
              @node-contextmenu="handleNodeRightClick"
            />
            <!-- 右击柜体对话框 -->
            <ul v-show="isShowMenu" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
              <li>
                <el-button @click="editSelectedDevice()" type="primary" size="mini">编辑</el-button>
              </li>
            </ul>
          </div>
          <div class="device-footer">
            <el-button class="device-add-btn" @click="handleAdd" type="primary">新增</el-button>
            <el-button class="device-add-btn" @click="handleDelete" type="primary">删除</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" class="middle-col">
        <div class="sensor-wrap">
          <!-- 使用树形穿梭框组件 -->
          <tree-transfer
            ref="treeTransfer"
            class="sensor-transfer"
            :title="title"
            :from_data="fromData"
            :to_data="toData"
            node_key="deviceId"
            :defaultExpandedKeys="defaultExpandedKeys"
            :defaultProps="{ label: 'label' }"
            :button_text="['添加', '移除']"
            :defaultCheckedKeys="sensorChecked"
            :defaultTransfer="defaultTransfer"
            :mode="mode"
            height="100%"
            @remove-btn="remove"
          />
        </div>
        <div class="relation-wrap">
          <!-- 关联关系模板穿梭框组件 -->
          <el-transfer
            v-model="toRelationData"
            :titles="titleRelated"
            :data="fromRelationOptions"
            :props="{ label: 'relogicName', key: 'reshipId' }"
            :button-texts="['移除', '添加模板']"
            height="100%"
          ></el-transfer>
          <el-button class="relation-add" type="primary" @click="handleAssociateAdd">新建关系</el-button>
        </div>
        <div class="middle-footer">
          <el-button type="primary" @click="handleSave" :loading="loading">保存</el-button>
        </div>
      </el-col>
    </el-row>
    <!-- 新增关联设备列表对话框 -->
    <add-related-sensor-dialog :title.sync="sensorTitle" :isVisible.sync="isShow" :row.sync="detail" @onUpdate="updateList" />
    <!-- 新增关联关系对话框 -->
    <add-associate-dialog :isVisible.sync="isShowAssociate" :checkPoint.sync="checkPointList" :device-id.sync="ids" />
  </div>
</template>

<script>
import treeTransfer from 'el-tree-transfer'
import AddRelatedSensorDialog from './components/AddRelatedSensorDialog'
import AddAssociateDialog from './components/AddAssociateDialog'
import {
  getListNotPage,
  deleteRelationSensor,
  getRelationSensor,
  insertRelationLogic,
  getTreeListForRelSensorSelect
} from '@/api/setting/relationSensor'
export default {
  name: 'relatedSensor',
  components: { treeTransfer, AddRelatedSensorDialog, AddAssociateDialog },
  data() {
    return {
      isShow: false,
      isShowMenu: false,
      left: 0,
      top: 0,
      // 关联设备树选项
      deviceOptions: [
        {
          reName: '全部',
          children: []
        }
      ],
      currentDevice: {}, //当前选中的设备
      defaultProps: {
        children: 'children',
        label: 'reName'
      },
      mode: 'transfer', // transfer addressList
      title: ['巡检测点列表', '已选测点列表'],
      titleRelated: ['关联关系模板', '已选关系'],
      fromData: [],
      toData: [],
      defaultExpandedKeys: [],
      sensorChecked: ['31'],
      defaultTransfer: true,
      checkPointList: [], // 已选测点列表
      fromRelationOptions: [],
      toRelationData: [], // 已选关系分配数组
      ids: [], // 选中id数组
      sensorTitle: '',
      currentObj: undefined, //右击当前关联设备
      detail: undefined, // 关联设备详情
      isShowAssociate: false, // 显示新增关联关系模板
      relationType: [],
      loading: false
    }
  },
  watch: {
    fromData: {
      handler(val) {
        this.fromData = val
      },
      deep: true
    },
    isShowMenu(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  created() {
    this.loadDeviceTreeList()
    this.loadListNotPage()
    this.loadDicts()
  },
  methods: {
    // 关联设备列表
    async loadListNotPage() {
      const res = await getListNotPage()
      this.deviceOptions[0].children = res.data
    },
    // 巡检测点列表
    async loadDeviceTreeList() {
      const res = await getTreeListForRelSensorSelect()
      this.fromData = res.data
      const treeList = this.fromData.filter(item => item.pid === '0')

      // this.parseTreeList(this.fromData, treeList)
    },
    // 树形数据处理
    parseTreeList(data, treeList) {
      treeList.map(item => {
        item.pid = parseInt(item.pid)
        item.id = item.deviceId
        const hasList = data.filter(v => v.pid === item.deviceId)
        item.children = hasList
        return item
      })
      this.fromData = treeList
      console.log(treeList)
    },
    // 字典查询
    async loadDicts() {
      const res = await this.getDicts('robot_relation_type')
      this.relationType = res.data
    },
    // 关系类型字典翻译
    relationTypeFormat(row) {
      var actions = []
      Object.keys(this.relationType).some(key => {
        if (this.relationType[key].dictLabel == '' + row.relogicName) {
          actions.push(this.relationType[key].dictValue)
          return true
        }
      })
      return actions.join('')
    },
    // 新增操作
    handleAdd() {
      this.reset()
      this.isShow = true
      this.sensorTitle = '新增关联列表'
    },
    // 删除关联设备
    handleDelete() {
      if (!this.ids.length) {
        this.$myMessage.warning('请勾选关联设备！')
        return
      }
      this.$confirm('确定删除关联设备吗？一经删除无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const ids = this.ids.join(',')
        await deleteRelationSensor(ids)
        this.msgSuccess('已删除')
        this.updateList()
      })
    },
    // 关联设备节点选中
    handleCheckChange(data, checked, indeterminate) {
      if (checked && data?.id) {
        this.ids.push(data.id)
      } else {
        const index = this.ids.findIndex(val => data.id === val)
        if (index > -1) {
          this.ids.splice(index, 1)
        }
      }
    },
    // 点击节点操作
    async handleNodeClick(obj, Node, comp) {
      console.log(obj)
      if (obj.id) {
        this.isShowMenu = false
        const res = await getRelationSensor(obj.id)
        this.currentDevice = obj
        this.fromRelationOptions = res.data.sensorRelationLogic
        // 已选关系回显
        this.toRelationData = res.data?.methodRelation ? [res.data?.methodRelation?.reshipId] : []
        // 已选测点回显
        const selectReRelationList = res.data.reRelationList
        if (selectReRelationList.length > 0) {
          let toData = []
          selectReRelationList.map(item => {
            toData.push({
              label: item.sensorName,
              deviceId: item.sensorId,
              pid: item.deviceId
            })
          })
          this.toData = [
            {
              pid: 0,
              deviceId: selectReRelationList[0].deviceId,
              label: selectReRelationList[0].deviceName,
              children: toData
            }
          ]
        } else {
          this.toData = []
        }
      }
    },
    // 右击操作
    handleNodeRightClick(e, obj, node) {
      this.isShowMenu = true
      this.left = e.clientX
      this.top = e.clientY
      this.currentObj = obj
    },
    // 关闭右键菜单
    closeMenu() {
      this.isShowMenu = false
    },
    // 关联设备编辑操作
    async editSelectedDevice() {
      const res = await getRelationSensor(this.currentObj.id)
      this.detail = res.data.rrs
      this.sensorTitle = '编辑关联列表'
      this.isShow = true
    },
    // 监听穿梭框组件移除
    remove(fromData, toData, obj) {
      // 树形穿梭框模式transfer时，返回参数为左侧树移动后数据、右侧树移动后数据、移动的{keys,nodes,halfKeys,halfNodes}对象
      obj.nodes.map(nd => {
        const i = this.toData[0]?.children.findIndex(ld => ld.deviceId === nd.deviceId)
        if (i > -1) this.toData[0].children.splice(i, 1)
      })
    },
    // 关联关系新增操作
    handleAssociateAdd() {
      this.checkPointList = this.toData[0]?.children
      console.log(this.toData)
      if (!this.currentDevice.reId) {
        this.$myMessage.warning('请先选择一个关联设备！')
        return
      }
      if (!this.checkPointList?.length) {
        this.$myMessage.warning('请选择测点！')
        return
      }
      this.isShowAssociate = true
    },
    // 保存
    async handleSave() {
      const form = {}
      if (!this.currentDevice.reId) {
        this.$myMessage.warning('请选择关联设备！')
        return
      }
      if (!this.toData.length) {
        this.$myMessage.warning('请选择测点！')
        return
      }
      if (!this.toRelationData[0]) {
        this.$myMessage.warning('请选择模板关系！')
        return
      }
      if (this.toRelationData.length > 1) {
        this.$myMessage.warning('只能选择一个关系！')
        return
      }
      this.loading = true
      const relationObj = this.fromRelationOptions.find(item => item.reshipId === this.toRelationData[0])
      const relationType = this.relationTypeFormat(relationObj) //关系类型
      form.robotRelationMethod = {
        reshipName: relationObj.relogicName,
        reshipId: relationObj.reshipId,
        reId: this.currentDevice.reId,
        reName: this.currentDevice.reName,
        relationType
      }

      const toData = this.toData[0].children // 已选测点
      const sensorId = []
      const sensorName = []
      const relationOrders = []
      toData.forEach((ele, i) => {
        sensorId.push(ele.deviceId)
        sensorName.push(ele.label)
        relationOrders.push(i + 1)
      })
      form.robotResensorRelation = {
        sensorId: sensorId.join(','),
        sensorName: sensorName.join(','),
        reId: this.currentDevice.reId,
        relationOrders: relationOrders.join(',')
      }
      try {
        const res = await insertRelationLogic(form)
        this.loading = false
        this.$myMessage.success(res.msg)
      } catch ({ msg }) {
        this.$myMessage.error(msg)
        this.loading = false
      }
    },
    // 更新
    updateList() {
      this.loadListNotPage()
    },
    // 表单重置
    reset() {
      this.detail = {}
    }
  }
}
</script>

<style lang="scss">
.related-sensor {
  min-height: calc(100vh - 84px);
  .related-sensor-row {
    height: 100%;
    min-height: calc(100vh - 124px);
    .device-col {
      min-height: calc(100vh - 124px);
      position: relative;

      .device-card {
        min-height: calc(100vh - 124px);
        .monitoring-body {
          position: relative;
        }
        .contextmenu {
          margin: 0;
          background: #fff;
          z-index: 3000;
          position: fixed;
          list-style-type: none;
          padding: 5px 0;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 400;
          color: #333;
          box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
          li {
            margin: 0;
            padding: 7px 16px;
            cursor: pointer;
          }
        }
        .device-footer {
          position: absolute;
          padding: 0 10px;
          bottom: 30px;
          left: 0;
          right: 0;
          margin-bottom: -10px;
          @include fb(center);
          flex-wrap: wrap;
          .device-add-btn {
            margin-bottom: 10px;
          }
        }
      }
    }
    .middle-col {
      @include fb(space-between, center, column);
      height: calc(100vh - 124px);
      .sensor-wrap {
        height: 55%;
        width: 100%;
      }
      .relation-wrap {
        height: 35%;
        width: 100%;
        position: relative;
        .el-transfer {
          width: 100%;
          height: 100%;
          @include fb(space-between);
          .el-transfer-panel {
            width: 40%;
          }
          .el-transfer__buttons {
            position: absolute;
            top: 50%;
            left: 40%;
            width: 20%;
            transform: translateY(-50%);
            text-align: center;
            @include fb(center, center, column);
            .el-transfer__button:first-child {
              margin-bottom: 60px;
            }
          }
        }
        .relation-add {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .transfer-center-item {
          &:last-child {
            margin-top: 30px;
          }
        }
      }
    }
    .transfer-title {
      margin: 0;
    }
  }
}
</style>
