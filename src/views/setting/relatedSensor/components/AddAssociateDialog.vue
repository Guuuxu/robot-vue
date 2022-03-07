<template>
  <el-dialog
    class="associate-dialog"
    :title="title"
    :visible.sync="isVisible"
    width="80%"
    append-to-body
    :close-on-click-modal="false"
    :before-close="cancel"
  >
    <el-row class="associate-row" :gutter="40">
      <el-col :span="8" class="left-area">
        <el-form
          :model="leftForm"
          ref="leftForm"
          label-width="110px"
          :rules="rules"
        >
          <el-form-item label="关联关系名称" prop="relogicName">
            <el-input v-model="leftForm.relogicName" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="告警内容" prop="warnValue">
            <el-input v-model="leftForm.warnValue" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="告警等级" prop="warnRank">
            <el-select v-model="leftForm.warnRank" placeholder="请选择">
              <el-option
                v-for="item in warnRankOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="关联条件" prop="text">
            <el-input type="textarea" :rows="4" v-model="leftForm.text" />
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="8" class="middle-area">
        <div class="area-title">添加设备</div>
        <ul>
          <li
            v-for="item in checkPoint"
            :key="item.id"
            @click="addDeviceToRst(item)"
          >
            {{ item.lable }}
          </li>
        </ul>
      </el-col>
      <el-col :span="8" class="right-area">
        <div class="area-title">添加状态</div>
        <!-- 各种运算符 -->
        <div class="op-name">逻辑运算符</div>
        <div class="op-list">
          <el-button
            size="mini"
            class="op-btn"
            v-for="ops in ops_logic"
            :key="ops.value"
            @click="addToRst(ops)"
            >{{ ops.value }}
          </el-button>
        </div>
        <div class="op-name">数学运算符</div>
        <div class="op-list">
          <el-button
            size="mini"
            class="op-btn"
            v-for="ops in ops_arithmetic"
            :key="ops.value"
            @click="addToRst(ops)"
            >{{ ops.value }}
          </el-button>
        </div>
        <div class="op-name">条件关联</div>
        <div class="op-list">
          <el-button
            size="mini"
            class="op-btn"
            v-for="ops in ops_condition"
            :key="ops.value"
            @click="addToRst(ops)"
            >{{ ops.value }}
          </el-button>
        </div>
        <!-- 手动输入 -->
        <div class="custom-ipt mb10">
          <el-input type="text" class="common-input" v-model="customVal" />
        </div>
        <!-- 撤销，重做 -->
        <div class="btn-row">
          <el-button size="mini" type="success" plain @click="addCustomToRst"
            >填入
          </el-button>
          <el-button size="mini" type="success" plain @click="undo"
            >撤销
          </el-button>
          <el-button size="mini" type="success" plain @click="redo"
            >重做
          </el-button>
        </div>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit" :loading="loading"
        >保 存
      </el-button>
      <el-button @click="clearExp">清 空</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  getRelationLogic,
  checkRelationExp
} from "@/api/setting/relationSensor";
export default {
  name: "AddAssociateDialog",
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "新增关联关系"
    },
    checkPoint: {
      type: Array,
      default: () => []
    },
    deviceId: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    isVisible(val) {
      // 为测点增加代数，方便检测公式是否正确
      var alphaBeta = [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z"
      ];
      this.checkPoint.forEach((item, i) => {
        // 在字母表中找对应序号的字母，作为此测点的代数
        item.algebra = alphaBeta[i];
      });
      this.$nextTick(() => {
        this.$refs?.leftForm.clearValidate();
      });
    }
  },
  data() {
    return {
      warnRankOption: [
        {
          value: "0",
          label: "告知"
        },
        {
          value: "1",
          label: "告警1"
        },
        {
          value: "2",
          label: "告警2"
        },
        {
          value: "3",
          label: "告警3"
        }
      ],
      leftForm: {
        relogicName: "",
        warnValue: "",
        warnRank: "",
        text: ""
      },
      // 表单校验
      rules: {
        relogicName: [
          { required: true, message: "请输入关联关系名称", trigger: "blur" }
        ],
        warnValue: [
          { required: true, message: "请输入告警内容", trigger: "blur" }
        ],
        warnRank: [
          { required: true, message: "请选择告警等级", trigger: "change" }
        ],
        text: [{ required: true, message: "请输入编辑结果", trigger: "change" }]
      },
      loading: false,
      ops_logic: [
        { value: "!=", text: "&#8800;" },
        { value: "<", text: "&#60;" },
        { value: ">", text: "&#62;" },
        { value: "<=", text: "&#8804;" },
        // &ge、&le不起作用，w、t、f
        { value: ">=", text: "&#8805;" }
      ],
      ops_arithmetic: [
        { value: "+", text: "+" },
        { value: "-", text: "-" },
        { value: "*", text: "&#215;" },
        { value: "/", text: "&#247;" },
        { value: "==", text: "=" }
      ],
      ops_condition: [
        { value: "&&", text: "且" },
        { value: "||", text: "或" },
        { value: "(", text: "(" },
        { value: ")", text: ")" }
      ],
      undoStack: [],
      redoStack: [],
      // 自定义输入框
      customVal: "",
      association: {
        // 记录要在页面上展示的表达式，包含了一些空格在里面
        text: "",
        // 记录要传给后台的表达式，里面会包含代数
        value: "",
        // 记录checkpionts在表达式中的顺序表(对应代数)
        ptsOrder: []
      }
    };
  },
  methods: {
    // 将选中的内容添加到结果中, 此时清空redoStack
    addToRst(datum) {
      // 保存当前关联关系
      const crntAssociate = this.association;
      // 压入undo栈, 用于回退
      this.undoStack.push(crntAssociate);
      // 当前关联关系更新, accmulate会生成新的，叠加的输入结果
      this.accumulate(datum);
      // this.association(crntAssociate.accumulate(datum));
      //redo栈清空
      this.redoStack = [];
    },
    // 前端展示每次输入追加一个空格，增加美观，然而是空值的时候是不用加的
    accumulate(datum) {
      var newText = this.association.text
        ? this.association.text + "\xa0" + datum.text
        : datum.text;
      // 默认的新累加值是当前值加上新输入的值
      var newValue = this.association.value + datum.value;
      // 复制一个测点顺序数组，不然引用传递会导致新旧状态无法隔离
      var newPtsOrder = [];
      this.association.ptsOrder.forEach(function(pt) {
        newPtsOrder.push(pt);
      });

      // 如果datum里存在代数，则累加代数，并把真实测点ID压入测点表达式顺序表
      if (datum.algebra) {
        var newValue = this.association.value + datum.algebra;

        newPtsOrder.push(datum.value);
      }
      this.association = {
        text: newText,
        value: newValue,
        ptsOrder: newPtsOrder
      };
      this.leftForm.text = newText;
    },
    // 向输入结果中追加设备信息
    addDeviceToRst(datum) {
      this.addToRst({
        text: datum.lable,
        value: datum.deviceId,
        algebra: datum.algebra
      });
    },
    // 填入自定义
    addCustomToRst() {
      let text = this.customVal;
      if (text !== "") {
        let value = text;
        // 如果不是纯数字就要加上引号
        if (!text.match(/^\d+$/g)) {
          value = '"' + text + '"';
          text = "&#34;" + text + "&#34;";
        }
        // 向输入结果中追加自定义值
        this.addToRst({ value: value, text: text });
        // 清空输入框
        this.customVal = "";
      } else {
        this.$myMessage.warning("输入框为空！");
      }
    },
    // 撤销
    undo() {
      if (this.undoStack.length) {
        this.redoStack.push(this.association);
        this.association = this.undoStack.pop();
        this.leftForm = this.association;
      }
    },
    // 重做
    redo() {
      if (this.redoStack.length) {
        this.undoStack.push(this.association);
        this.association = this.redoStack.pop();
        this.leftForm = this.association;
      }
    },
    // 清空
    clearExp() {
      this.undoStack = [];
      this.redoStack = [];
      this.association = {
        ...this.association,
        text: "",
        value: ""
      };
      this.leftForm.text = "";
    },
    // 保存
    async submit() {
      this.loading = true;
      try {
        await checkRelationExp(this.association.value);
        await getRelationLogic({
          //关联关系名称
          relogicName: this.leftForm.relogicName,
          //告警内容
          warnValue: this.leftForm.warnValue,
          //告警级别
          warnType: this.leftForm.warnRank,
          //关联关系类型，现在是自定义关联关系 ,固定为9
          relationType: 9,
          //关联条件(展示)
          relation: this.association.text,
          //关联条件(与后台对接)
          relationExp: this.association.value,
          //关联设备id
          reId: this.deviceId.join(",")
        });
        this.loading = false;
        this.msgSuccess("新建成功");
        this.$emit("update:isVisible", false);
      } catch ({ msg }) {
        this.loading = false;
      }
    },
    cancel() {
      this.$emit("update:isVisible", false);
      this.resetForm("leftForm");
    }
  }
};
</script>

<style lang="scss" scoped>
.associate-dialog {
  .area-title {
    font-weight: bold;
  }
  .middle-area {
    ul {
      margin-top: 10px;
      li {
        line-height: 30px;
        cursor: pointer;
        &:hover {
          color: $menuActiveText;
        }
      }
    }
  }
  .right-area {
    .op-name {
      line-height: 30px;
      color: #439699;
    }
    .op-list {
      margin-bottom: 10px;
      .op-btn {
        width: 30px;
        height: 30px;
        padding: 0;
      }
    }
  }
  .dialog-footer {
    text-align: center;
  }
}
</style>
