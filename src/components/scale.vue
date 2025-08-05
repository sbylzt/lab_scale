<template>
  <div class="scale-container">
    <div class="left-panel">
      <div v-if="loading" class="loading">加载中...</div>
      <el-table v-else highlight-current-row :data="scaleList" 
        @current-change="handleRowSelect"
        style="font-size:14px"
        :row-style="{height:'35px'}"
        :header-cell-style="{
            'text-align':'center',
            'background':'#f5f7fa',
            'color':'#606266',
            'height':'25px',
            'font-size':'12px'
          }"
        :cell-style="{padding:'2px','text-align':'center'}">
        <el-table-column prop="billno" label="SN" width="85" />
        <el-table-column prop="Recipe" label="ID" :show-overflow-tooltip="true" width="130" />
        <el-table-column prop="Name" label="Name" :show-overflow-tooltip="true" width="130"/>
        <el-table-column prop="QTY" label="QTY" width="80" :formatter="formatQty"/>
        <el-table-column prop="batches" label="Set/Scaled" />
      </el-table>
    </div>
    <div class="right-panel">
      <div v-if="rightLoading" class="loading">加载中...</div>
      <div v-else>
        <div class="selected-info">
          <span>ID: {{ selectedRow?.billno || '无' }}</span>
          <span>Recipe: {{ selectedRow?.Recipe || '无' }}</span>
          <span>Now Batch: {{ selectedRow?.batch_scaled+1 || '无' }}</span>
        </div>
        <el-table :data="entryList" 
          @row-dblclick="handleDblClick"
          :row-class-name="tableRowClassName"
          style="font-size:14px;width:100%"
          :row-style="{height:'40px'}"
          :header-cell-style="{
            'text-align':'center',
            'background':'#f5f7fa',
            'color':'#606266',
            'height':'30px'
          }"
          :cell-style="{
            padding:'2px',
            'text-align':'center'
          }">
          <el-table-column type="index" label="SN" align="center" :index="indexMethod" />
          <el-table-column prop="material" label="Material物料ID" align="center"  />
          <el-table-column prop="m_name" label="Name物料名" align="center" :show-overflow-tooltip="true" width="120" />
          <el-table-column prop="step" label="Step段位" align="center" />
          <el-table-column prop="input" label="Input投料号" align="center"  />
          <el-table-column prop="QTY" label="Target目标值" align="center"  :formatter="formatQty"/>
          <el-table-column prop="lotid" label="LotID批次" align="center" />
          <el-table-column prop="sqty" label="Actual实际重量" align="center" />
        </el-table>
        <div class="confirm-button-container">
          <el-button type="primary" @click="handleConfirm" class="confirm-button">确认</el-button>
        </div>
      </div>
    </div>
  </div>
  <scale-detail-dialog
    v-if="dialogVisible"
    :detail-data="currentRow"
    @close="dialogVisible = false"
    @confirm="handleDialogConfirm"
  />
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from 'element-plus';
import httpHelper from "../api/httpHelper";
import ScaleDetailDialog from './scale_detail_dialog.vue';

export default {
  name: "scale",
  components: { ScaleDetailDialog },
  setup() {
    const scaleList = ref([]);
    const entryList = ref([]);
    const loading = ref(true);
    const rightLoading = ref(false);
    const dialogVisible = ref(false);
    const currentRow = ref({});
    const selectedRow = ref(null);

    function handleRowSelect(row) {
      if (!row) return;
      selectedRow.value = row;
      rightLoading.value = true;
      httpHelper.post('/labbook/lab_stock', { 
        'flag': 'scale_listentry',
        'billno': row.billno 
      }, (res) => {
        entryList.value = res.data.data;
        rightLoading.value = false;
      });
    }

    const handleDblClick = (row) => {
      if (row.material === 'Step1 Compound' || row.material === 'Step2 Compound') {
        alert('该物料无需称量，已跳过');
        return;
      }
      currentRow.value = row;
      dialogVisible.value = true;
    };

    const indexMethod = (index) => {
      return index + 1;
    }

    const formatQty = (row, column, cellValue) => {
      return cellValue ? Number(cellValue).toFixed(3) : '0.000';
    }

    const handleDialogConfirm = (data) => {
      const index = entryList.value.findIndex(item => 
        item.material === data.material && item.input === data.input
      );
      if (index > -1) {
        entryList.value[index] = { ...entryList.value[index], ...data };
      }
      dialogVisible.value = false;

      // 自动跳转到下一行未称量的子窗口
      const nextIndex = entryList.value.findIndex((item, i) => 
        i > index && !item.sqty && item.material !== 'Step1 Compound' && item.material !== 'Step2 Compound'
      );
      if (nextIndex !== -1) { // 确保找到未称量的行
        setTimeout(() => {
          currentRow.value = entryList.value[nextIndex];
          dialogVisible.value = true;
        }, 300); // 添加延迟以确保子窗口关闭后再打开
      }
    };

    const handleConfirm = () => {
      const incompleteRows = entryList.value.filter(item => !item.lotid || !item.sqty);
      if (incompleteRows.length > 0) {
        alert('请确保所有批次和实际重量都已填写');
        return;
      }

      const enrichedEntryList = entryList.value.map((item, index) => ({
        material: item.material,
        input: item.input,
        lotid: item.lotid,
        qty: item.sqty,
        billno: selectedRow.value.billno,
        recipe: selectedRow.value.Recipe,
        charge: selectedRow.value.batch_scaled + 1,
        id: `${selectedRow.value.billno}${String(selectedRow.value.batch_scaled + 1).padStart(2, '0')}${String(index + 1).padStart(3, '0')}`
      }));

      httpHelper.post('/labbook/lab_stock', {
        flag: 'scale_input',
        data: enrichedEntryList
      }, (res) => {
        if (res.data.status) {
          ElMessage.success('提交成功');
          const currentBillno = selectedRow.value.billno;
          // 刷新左侧列表
          httpHelper.post('/labbook/lab_stock', { 'flag': 'scale_list' }, (res) => {
            scaleList.value = res.data.data.map(item => ({
              ...item,
              batches: `${item.batch_set || '无'} / ${item.batch_scaled || '0'}`
            }));
            // 重新选中之前选中的行
            const selectedIndex = scaleList.value.findIndex(item => item.billno === currentBillno);
            if (selectedIndex !== -1) {
              handleRowSelect(scaleList.value[selectedIndex]);
            } else {
              // 如果找不到对应行，清空右侧数据
              entryList.value = [];
              selectedRow.value = null;
            }
          });
        } else {
          alert(res.data.error || '提交失败');
        }
      });
    };

    const tableRowClassName = ({ row }) => {
      return row.sqty ? 'measured-row' : '';
    };

    onMounted(() => {
      httpHelper.post('/labbook/lab_stock', { 'flag': 'scale_list' }, (res) => {
        scaleList.value = res.data.data.map(item => ({
          ...item,
          batches: `${item.batch_set || '无'} / ${item.batch_scaled || '0'}` // 新增 batches 字段
        }));
        console.log(scaleList.value);
        loading.value = false;
      });
    });

    return { 
      scaleList, 
      entryList, 
      loading, 
      rightLoading, 
      handleRowSelect,
      indexMethod,
      formatQty,
      dialogVisible,
      currentRow,
      handleDblClick,
      handleDialogConfirm,
      handleConfirm,
      tableRowClassName,
      selectedRow,
    };
  },
};
</script>

<style scoped>
.scale-container {
  display: flex;
  height: 100%;
}

.left-panel {
  flex: 1;
  border-right: 1px solid #ddd;
  padding: 10px;
  overflow-y: auto;
}

.right-panel {
  flex: 2;
  padding: 10px;
  height: 100%;
  overflow: hidden;
  position: relative; /* 添加相对定位 */
}

.right-panel .el-table {
  max-height: calc(100vh - 160px); /* 调整高度，避免覆盖确认按钮 */
  overflow-y: auto;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #999;
  padding: 20px;
}

.placeholder {
  text-align: center;
  font-size: 16px;
  color: #666;
  padding: 20px;
}

:deep(.el-table__row.measured-row) {
  background-color: #ddf8ce !important;
}

:deep(.el-table__row.measured-row:hover) > td {
  background-color: #ddf8ce !important;
}


:deep(.el-table__row.current-row td) {
  background-color: #8ea2b8 !important;
  color: #ffffff !important;
}

.selected-info {
  margin-bottom: 10px;
  font-size: 30px;
  color: #333;
  background-color: #f0b791; /* 添加橙色背景 */
  padding: 10px; /* 添加内边距使背景更美观 */
  border-radius: 4px; /* 添加圆角 */
}
.selected-info span {
  margin-right: 15px;
}

.confirm-button-container {
  position: absolute;
  bottom: 20px;
  right: 0;
  left: 0;
  margin: auto;
  text-align: center;
  width: fit-content; /* 宽度适应内容 */
}

.confirm-button {
  font-size: 40px;
  padding: 30px 60px;
  min-width: 200px; /* 确保按钮最小宽度 */
}
</style>
