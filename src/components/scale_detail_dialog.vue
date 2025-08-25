<template>
  <div class="dialog-mask">
    <div class="dialog-content">
      <div class="dialog-header">
        <h3 class="dialog-title">称量详情</h3>
        <div class="qr-code">
          <QrcodeVue
            :value="qrtext" 
            :size="60" 
          />
        </div>     
        <div class="qr-code">
          <QrcodeVue
            :value="qrqty" 
            :size="60" 
          />
        </div>
        
      </div>
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
        <div class="footer-buttons">
          <el-button type="danger" @click="handleManual" class="left-button">手动</el-button>
          <el-button type="primary" class="center-button" @click="handleConfirm">确定</el-button>
          <el-button @click="$emit('close')" class="right-button">取消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, nextTick, onMounted } from 'vue';
import QrcodeVue from 'qrcode.vue';

export default {
  props: {
    detailData: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'confirm'],
  components:{QrcodeVue},
  setup(props, { emit }) {
    const message = ref('提示信息');
    const messageType = ref('normal');
    const errorMessage = ref('');
    const qrtext = ref(`${props.detailData.material};${props.detailData.m_name};lot_test;01/01/2025;12/12/2025;100`) ;
    const qrqty = ref(String(Number(props.detailData.QTY+0.05) ));
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
          lotidInput.value.input.readOnly = true;
          setTimeout(() => {
            lotidInput.value.input.readOnly = false;
          }, 200);
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
      
      const deviation = Math.abs(targetQty - actualQty);
      if (deviation > 0.1) {
        setError('实际重量与目标重量偏差超过±0.1，请检查');
        form.sqty = '';
        return;
      }

      setSuccess('实际重量验证通过');
      form.sqty = actualQty.toFixed(3);
      handleConfirm();
    };

    const handleManual = () => {
      emit('confirm', {
        ...props.detailData,
        lotid: 'other',
        sqty: 0
      });
      emit('close');
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
      if (parts.length < 6) {
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
      if (!lifetimeValid.value) {
        setError('批号已过期或日期格式无效');
        form.tempInput = '';
        return;
      }
      
      setSuccess('扫描通过');
      form.lotid = lotid;
      nextTick(() => {
        if (sqtyInput.value) {
          sqtyInput.value.focus();
          sqtyInput.value.input.readOnly = true;
          setTimeout(() => {
            sqtyInput.value.input.readOnly = false;
          }, 200);
        }
      });
    };

    return {
      form,
      lotidInput,
      sqtyInput,
      scannedInfo,
      matMatch,
      lifetimeValid,
      qrtext,
      qrqty,
      formatQty,
      handleConfirm,
      handleLotIdScan,
      handleQtyValidate,
      handleManual,
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
  padding: 20px;
  border-radius: 8px;
  width: 600px;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.dialog-title {
  font-size: 25px;
  flex-shrink: 0;
  margin: 0;
}

.form-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  font-size: 30px;
  font-weight: bold;
}

.form-item label {
  width: 230px;
  text-align: right;
  margin-right: 20px;
  flex-shrink: 0;  
  color: rgb(150, 149, 149);
}

.form-item .el-input {
  width: 200px;
  font-size: 18px;
  height: 36px;
  font-weight: bold;
}

.dialog-footer {
  margin-top: auto;
  padding-top: 10px;
  flex-shrink: 0;
}

.footer-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.center-button {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 30px;
  padding: 16px 32px;
  min-width: 120px;
  min-height: 40px;
}



.right-button {
  margin-left: auto;
}

.dialog-footer button {
  font-size: 24px;
  padding: 12px 24px;
}

.lotid-input-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 200px;
}

.scan-info {
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 16px;
  display: flex;
  justify-content: flex-start;
  gap: 15px;
  margin-bottom: 12px;
  padding: 8px;
  flex-wrap: wrap;
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
  margin: 0 0 8px 0;
  padding: 6px;
  border-radius: 4px;
  font-size: 18px;
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
