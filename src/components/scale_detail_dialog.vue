<template>
  <div class="dialog-mask">
    <div class="dialog-content">
      <h3 class="dialog-title">称量详情</h3>
      <div class="form-item">
        <label>M_ID 物料ID:</label>
        <span>{{ detailData.material }}</span>
      </div>
      <div class="form-item">
        <label>Name 物料名:</label>
        <span>{{ detailData.m_name }}</span>
      </div>
      <div class="form-item">
        <label>Input 进料:</label>
        <span>{{ detailData.input }}</span>
      </div>
      <div class="form-item">
        <label>Target 目标重量:</label>
        <span>{{ formatQty(detailData.QTY) }}</span>
      </div>
      <div class="form-item">
        <label>QR 扫描:</label>
        <div class="lotid-input-container">
          <el-input 
            ref="lotidInput" 
            v-model="form.tempInput"
            placeholder="请扫描二维码" 
            @keyup.enter="handleLotIdScan"
          />
        </div>    
      </div>
      <div class="scan-info">
            <div class="scan-item">
              <span class="scan-label">Material:</span>
              <span :class="{'match': matMatch, 'mismatch': !matMatch}">
                {{scannedInfo.mat}}
              </span>
            </div>
            <div class="scan-item">
              <span class="scan-label">Lot ID:</span>
              <span>{{scannedInfo.lotid}}</span>
            </div>
            <div class="scan-item">
              <span class="scan-label">Lifetime:</span>
              <span :class="{'match': lifetimeValid, 'mismatch': !lifetimeValid}">
                {{scannedInfo.lifetime}}
              </span>
            </div>
        </div>
      <div class="form-item">
        <label>QTY 实际重量:</label>
        <el-input 
          ref="sqtyInput"
          v-model="form.sqty" 
          placeholder="请输入实际重量"
          @keyup.enter="handleQtyValidate"
        />
      </div>
      <div class="dialog-footer">
        <h3 class="message" :class="messageType">{{ message }}</h3>
        <el-button @click="$emit('close')">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, nextTick, onMounted } from 'vue';

export default {
  props: {
    detailData: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'confirm'],
  setup(props, { emit }) {
    const message = ref('提示信息');
    const messageType = ref('normal');
    const errorMessage = ref('');
    const form = reactive({
      lotid: '',
      sqty: '',
      tempInput: ''
    });

    const scannedInfo = reactive({
      mat: '',
      lotid: '',
      lifetime: ''
    });

    const matMatch = ref(false);
    const lifetimeValid = ref(false);
    const lotidInput = ref(null);
    const sqtyInput = ref(null);

    onMounted(() => {
      nextTick(() => {
        if (lotidInput.value) {
          lotidInput.value.focus();
        }
      });
    });

    const formatQty = (value) => {
      return value ? Number(value).toFixed(3) : '0.000';
    };

    const setError = (msg) => {
      message.value = msg;
      messageType.value = 'error';
    };

    const setSuccess = (mes) => {
      message.value = mes;
      messageType.value = 'success';
    };

    const handleQtyValidate = () => {
      const numberPattern = /^\d+(\.\d+)?$/;
      if (!numberPattern.test(form.sqty)) {
        setError('实际重量必须为有效数字');
        form.sqty = '';
        return;
      }

      const targetQty = Number(props.detailData.QTY);
      const actualQty = Number(form.sqty);
      
      if (isNaN(actualQty)) {
        setError('实际重量格式不正确');
        form.sqty = '';
        return;
      }
      
      const deviation = Math.abs(targetQty - actualQty) / targetQty * 100;
      if (deviation > 50) {
        setError('实际重量与目标重量偏差超过50%，请检查');
        form.sqty = '';
        return;
      }

      setSuccess('实际重量验证通过');
    };

    const handleConfirm = () => {
      if (!form.lotid || !form.sqty) {
        setError('请填写完整信息');
        return;
      }

      emit('confirm', {
        ...props.detailData,
        lotid: form.lotid,
        sqty: Number(form.sqty)
      });
      setTimeout(() => emit('close'), 1000);
    };

    const isValidDate = (dateStr) => {
      const date = new Date(dateStr);
      return !isNaN(date.getTime());
    };

    const isNotExpired = (dateStr) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(dateStr);
      return checkDate >= today;
    };

    const handleLotIdScan = () => {
      const parts = form.tempInput.split(';');
      console.log('Scanned QR Code:', parts);
      if (parts.length !== 7) {
        setError('二维码格式错误，请重新扫描');
        form.tempInput = '';
        return;
      }

      const mat = parts[0];
      const lotid = parts[2];
      const lifetime = parts[4];
      
      Object.assign(scannedInfo, { mat, lotid, lifetime });

      matMatch.value = mat === props.detailData.material;
      if (!matMatch.value) {
        setError('material不匹配');
        form.tempInput = '';
        return;
      }

      lifetimeValid.value = isValidDate(lifetime) && isNotExpired(lifetime);
      // lifetimeValid.value = isValidDate(lifetime) ;
      if (!lifetimeValid.value) {
        setError('批号已过期或日期格式无效');
        form.tempInput = '';
        return;
      }
      
      setSuccess('扫描通过'); // 添加成功提示
      form.lotid = lotid;
      nextTick(() => {
        sqtyInput.value?.focus();
      });
    };

    return {
      form,
      lotidInput,
      sqtyInput,
      scannedInfo,
      matMatch,
      lifetimeValid,
      formatQty,
      handleConfirm,
      handleLotIdScan,
      handleQtyValidate,
      errorMessage,
      message,
      messageType
    };
  }
};
</script>

<style scoped>
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.dialog-content {
  background: white;
  padding: 40px;
  border-radius: 8px;
  width: 800px;
  min-height: 600px;
}

.dialog-title {
  font-size: 24px;
  margin-bottom: 30px;
  text-align: center;
}

.form-item {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  font-size: 30px;
}

.form-item label {
  width: 300px;
  text-align: right;
  margin-right: 100px;
  font-weight: bold;
}

.form-item .el-input {
  width: 300px;
  font-size: 30px;
  height: 50px; /* 增加高度 */
}

.dialog-footer {
  text-align: right;
  margin-top: 40px;
}

.dialog-footer button {
  font-size: 18px;
  padding: 12px 25px;
  margin-left: 20px;
}

.lotid-input-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
}

.scan-info {
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 25px;
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px; /* 添加与 form-item 一致的下边距 */
}

.scan-item {
  display: flex;
  align-items: center;
  margin: 0;
  white-space: nowrap;
}

.scan-label {
  font-weight: bold;
  margin-right: 10px;
  color: #606266;
}

.match {
  color: #67c23a;
}

.mismatch {
  color: #f56c6c;
}

.message {
  margin: 0 0 10px 0;
  padding: 8px;
  border-radius: 4px;
  font-size: 16px;
  text-align: center;
}

.normal {
  color: #606266;
  background-color: #f4f4f5;
}

.success {
  color: #67c23a;
  background-color: #f0f9eb;
}

.error {
  color: #f56c6c;
  background-color: #fef0f0;
}
</style>
