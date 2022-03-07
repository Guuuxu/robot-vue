<template>
  <div class="inspect-detail app-container" v-loading="loading">
    <div class="title">一：总体情况</div>
    <el-table :data="taskVoInfo" class="detail-table">
      <el-table-column label="站所名称" align="center" prop="stationName">
      </el-table-column>
      <el-table-column label="巡检任务名称" align="center" prop="taskName">
      </el-table-column>
      <el-table-column label="测点数" align="center" prop="sensorNum" />
      <el-table-column
        label="关联测点数"
        align="center"
        prop="sensorRelationNum"
      />
      <el-table-column
        label="未处理数"
        align="center"
        prop="abnormalSensorNum"
      />
      <el-table-column label="巡检时间" align="center" prop="startTime" />
    </el-table>

    <div class="title">二：分项预览</div>
    <el-table :data="sensorTypeItems">
      <el-table-column label="类别" align="center" prop="sensorTypeName">
      </el-table-column>
      <el-table-column label="测点数" align="center" prop="totalNum">
      </el-table-column>
      <el-table-column label="未处理异常数" align="center" prop="warningNum" />
    </el-table>

    <div class="title">三：关联设备</div>
    <el-table :data="relationList">
      <el-table-column label="名称" align="center" prop="relName">
      </el-table-column>
      <el-table-column label="检测值" align="center" prop="analyzeResult">
      </el-table-column>
      <el-table-column label="巡检时间" align="center" prop="createTime" />
      <el-table-column label="状态" align="center" prop="judgment" />
      <el-table-column label="操作" align="center" prop="warningNum">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            >查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="title">四：明细</div>
    <el-table :data="cpResultList">
      <el-table-column label="序号" align="center" type="index" />
      <el-table-column label="设备名称" align="center" prop="deviceName">
      </el-table-column>
      <el-table-column label="检测内容" align="center" prop="sensorName" />
      <el-table-column
        label="巡检结果"
        align="center"
        prop="inspectionResult"
      />
      <el-table-column label="图片" align="center" prop="visibleLightFile">
        <template slot-scope="scope">
          <el-image
            style="width: 90px; height: 60px"
            :src="scope.row.visibleLightFile"
            fit="contain"
            :preview-src-list="[scope.row.visibleLightFile]"
          >
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="judgment" />
      <el-table-column label="巡检时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" prop="warningNum">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleHistoryView(scope.row)"
            >查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-show="cpResultList.length > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="loadInspectionResultList(taskId)"
    />
    <div class="footer mt10">
      <el-button type="primary" @click="handleDown">下载报告</el-button>
    </div>
    <!-- 关联设备详情 -->
    <relation-device-detail-dialog
      :is-visible.sync="isShowRelation"
      :detail.sync="relationDetail"
    />

    <detail-history-dialog
      :is-visible.sync="isShowDetailHistory"
      :time.sync="inspectTime"
      :sensor-id.sync="sensorId"
    />
  </div>
</template>

<script>
import { getInspectionDetail, getInspectionDetailList } from "@/api/inspect";
import {
  getResultList,
  getResultInspectionDetail
} from "@/api/setting/relationSensor";
import { downLoadZip } from "@/utils/zipdownload";
import RelationDeviceDetailDialog from "./components/RelationDeviceDetailDialog";
import DetailHistoryDialog from "./components/DetailHistoryDialog";
export default {
  name: "inspectDetail",
  components: { RelationDeviceDetailDialog, DetailHistoryDialog },
  data() {
    return {
      loading: false,
      taskVoInfo: [], // 总体情况
      sensorTypeItems: [], // 分项预览
      cpResultList: [], // 明细
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      taskId: 0,
      srcList: [],
      relationList: [], // 关联设备
      isShowRelation: false,
      relationDetail: [],
      isShowDetailHistory: false,
      inspectTime: "",
      sensorId: "",
      obj: {
        sensorType: "",
        sensorName: "",
        unit: ""
      },
      detailRow: {}
    };
  },
  // 父组件中返回要传给下级的数据
  provide() {
    return {
      obj: this.obj
    };
  },
  created() {
    const taskId = this.$route?.params?.taskId;
    this.taskId = taskId;
    this.loadInspectionDetail(this.taskId);
    this.loadInspectionResultList(this.taskId);
    this.loadRelationSensor();
  },
  methods: {
    preview(src) {
      this.srcList.push(src);
    },
    async loadInspectionDetail(taskId) {
      this.loading = true;
      const res = await getInspectionDetail(taskId);
      const arr = [];
      arr.push(res.data.taskVoInfo);
      this.taskVoInfo = arr;
      this.sensorTypeItems = res.data.sensorTypeItems;

      this.loading = false;
    },
    // 巡检明细
    async loadInspectionResultList(taskId) {
      const res = await getInspectionDetailList({
        taskId,
        ...this.queryParams
      });
      this.cpResultList = res.rows;
      this.total = res.total;
    },
    // 关联设备列表
    async loadRelationSensor() {
      const res = await getResultList(this.taskId);
      this.relationList = res.rows;
    },
    async handleView(row) {
      this.isShowRelation = true;
      const res = await getResultInspectionDetail(row.id);
      this.relationDetail = res.data;
    },
    // 明细对比
    handleHistoryView(row) {
      this.isShowDetailHistory = true;
      this.inspectTime = row.createTime;
      this.sensorId = row.sensorId;
      this.obj.sensorType = row.sensorType;
      this.obj.sensorName = row.sensorName;
      this.obj.unit = row.unit;
    },
    // 下载报告
    async handleDown() {
      downLoadZip("/inspect/result/export?taskId=" + this.taskId);
    }
  }
};
</script>

<style lang="scss" scoped>
.inspect-detail {
  .pagination-container {
    box-sizing: content-box;
  }
  .title {
    font-weight: bold;
    margin-bottom: 10px;
    line-height: 30px;
    text-align: center;
  }
  .detail-table {
    width: 100%;
  }
  .el-table {
    margin-bottom: 20px;
    .file {
      width: 90px;
      height: 60px;
    }
  }
  .footer {
    text-align: center;
    width: 100%;
  }
}
</style>
