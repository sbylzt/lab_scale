<template>
  <div class="scale-container">
    <div class="left-panel">
      <div v-if="loading" class="loading">加载中...</div>
      <el-table v-else highlight-current-row :data="scaleList" 
        @current-change="handleRowSelect"
        style="font-size:14px; height: calc(100vh - 20px);"
        :row-style="{height:'50px'}"
        :header-cell-style="{
            'text-align':'center',
            'background':'#f5f7fa',
            'color':'#606266',
            'height':'25px',
            'font-size':'12px'
          }"
        :cell-style="{padding:'2px','text-align':'center'}"
        height="calc(100vh - 20px)">
        <el-table-column width="85">
          <template #header>
            <div style="text-align: center;">
              <div style="font-weight: bold; margin-bottom: 5px;">SN</div>
            </div>
          </template>
          <template #default="{ row }">
            <div style="display: flex; flex-direction: column; height: 100%;">
              <div style="font-weight: bold;">{{ row.billno }}</div>

            </div>
          </template>
        </el-table-column>
        <el-table-column width="130">
          <template #header>
            <div style="text-align: center;">
              <div style="font-weight: bold; margin-bottom: 5px;">ID/Name</div>
            </div>
          </template>
          <template #default="{ row }">
            <div style="font-size: 12px; color: #666;">{{ row.Recipe }}</div>
            <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
              {{ row.Name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column width="80">
          <template #header>
            <div style="text-align: center;">
              <div style="font-weight: bold; margin-bottom: 5px;">QTY/Batch</div>
            </div>
          </template>
          <template #default="{ row }">
            <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
              {{ formatQty(null, null, row.QTY) }}
            </div>
            <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
              {{ row.batches }}
            </div> 
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="right-panel">
      <div v-if="rightLoading" class="loading">加载中...</div>
      <div v-else>
        <div class="selected-info">
          <div class="selected-info-content">
            <span>ID: {{ selectedRow?.billno || '无' }}</span>
            <span>Recipe: {{ selectedRow?.Recipe || '无' }}</span>
            <span>Now Batch: {{ selectedRow?.batch_scaled+1 || '无' }}</span>
          </div>
          <div class="confirm-button-container">
            <el-button type="primary" @click="handleConfirm" :disabled="!isAllRowsComplete" class="confirm-button">保存</el-button>
          </div>
        </div>
        <el-table :data="entryList" 
          @row-dblclick="handleDblClick"
          :row-class-name="tableRowClassName"
          style="font-size:14px;width:100%; "
          :row-style="{height:'45px'}"
          :header-cell-style="{
            'text-align':'center',
            'background':'#f5f7fa',
            'color':'#606266',
            'height':'40px'
          }"
          :cell-style="{
            padding:'2px',
            'text-align':'center'
          }">
          <el-table-column type="index" align="center" :index="indexMethod" width="40">
            <template #header>
              <div style="text-align: center;">
                <div style="font-weight: bold; line-height: 1.2;">SN</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="material" align="center" :show-overflow-tooltip="true" width="120">
            <template #header>
              <div style="text-align: center;">
                <div style="font-weight: bold; line-height: 1.2;">Material</div>
                <div style="font-size: 11px; line-height: 1.2;">物料ID</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="m_name" align="center" :show-overflow-tooltip="true" width="120">
            <template #header>
              <div style="text-align: center;">
                <div style="font-weight: bold; line-height: 1.2;">Name</div>
                <div style="font-size: 11px; line-height: 1.2;">物料名</div>
              </div>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="step" align="center" width="50">
            <template #header>
              <div style="text-align: center;">
                <div style="font-weight: bold; line-height: 1.2;">Step</div>
                <div style="font-size: 11px; line-height: 1.2;">段位</div>
              </div>
            </template>
          </el-table-column> -->
          <el-table-column prop="input" align="center" width="60">
            <template #header>
              <div style="text-align: center;">
                <div style="font-weight: bold; line-height: 1.2;">Input</div>
                <div style="font-size: 11px; line-height: 1.2;">投料号</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="QTY" align="center" :formatter="formatQty" width="85">
            <template #header>
              <div style="text-align: center;">
                <div style="font-weight: bold; line-height: 1.2;">Target</div>
                <div style="font-size: 11px; line-height: 1.2;">目标值</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="lotid" align="center" width="110">
            <template #header>
              <div style="text-align: center;">
                <div style="font-weight: bold; line-height: 1.2;">LotID</div>
                <div style="font-size: 11px; line-height: 1.2;">批次</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="sqty" align="center" >
            <template #header>
              <div style="text-align: center;">
                <div style="font-weight: bold; line-height: 1.2;">Actual</div>
                <div style="font-size: 11px; line-height: 1.2;">实际重量</div>
              </div>
            </template>
          </el-table-column>
        </el-table>
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
import { ref, reactive, onMounted, computed } from "vue";
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
      const enrichedEntryList = entryList.value
        .filter(item => !item.material.startsWith('Step'))
        .map((item, index) => ({
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

    const isAllRowsComplete = computed(() => {
      return entryList.value.every(item => 
        item.material.startsWith('Step') || (item.lotid && item.sqty>=0)
      );
    });

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
      isAllRowsComplete,
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
  overflow-y: auto;
}

.right-panel {
  flex: 2;
  height: 98%;
  overflow: hidden;
  position: relative; /* 添加相对定位 */
}

.right-panel .el-table {
  max-height: calc(100vh - 30px); /* 调整高度，避免覆盖确认按钮 */
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
  margin-bottom: 5px;
  font-size: 20px;
  color: #333;
  background-color: #f0b791; /* 添加橙色背景 */
  padding: 5px; /* 添加内边距使背景更美观 */
  border-radius: 4px; /* 添加圆角 */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-info-content {
  text-align: left;
}

.selected-info-content span {
  margin-right: 15px;
}

.confirm-button-container {
  display: flex;
  align-items: center;
}

.confirm-button {
  font-size: 20px;
  padding: 5px 15px;
  min-width: 120px;
  height: 40px;
}

.confirm-button:disabled {
  background-color: #909399;
  border-color: #909399;
  color: #c0c4cc;
}
</style>
