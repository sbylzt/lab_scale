<template>
    <div class="class1">
        <h1 style="background-color:Orange;height:60px;line-height: 60px;">Book Out 出库</h1>
        <el-row>
            <el-col :span="24">
            <el-descriptions   :column="1" size="large" border>
            <el-descriptions-item 
            v-for="(val,key) in recipe_info" 
            :label="key"
            align="center" label-align="center">
            {{val}}
            </el-descriptions-item>
            </el-descriptions>
        </el-col>
        </el-row>
        <!-- <el-row style="height: 100px;"></el-row> -->
        <el-row>
            <el-form :inline="true" :model="formInline" class="demo-form-inline" size="large" ref="dataForm" :rules="formInline.rules">
                <el-form-item label="Quantity" style="width:30%" prop="qty">
                    <!-- <el-input v-model.number="formInline.qty" placeholder="Number" oninput="value=value.replace(/[^0-9.]/g,'')"/> -->
                    <el-input v-model="formInline.qty" placeholder="Number 数字" clearable/>
                </el-form-item> 
                <el-form-item style="width:8%"><el-button  type="primary" @click="formInline.setmax">MAX</el-button></el-form-item>     
                <el-form-item label="User" style="width:40%" prop="user">
                    <el-select  v-model="formInline.user" clearable >
                        <el-option v-for="item in options.user" :value="item"/>
                    </el-select>
                </el-form-item>           
                <el-form-item label="Remark" style="width:100%">
                    <el-input class="remark" v-model="formInline.remark" placeholder="Remark 备注" type="textarea" resize="none" :rows="3"/>
                </el-form-item> 
                <el-button class="submit" type="warning" @click="onSubmit" size="large">Book Out 出库</el-button>                   
            </el-form>
            
            
        </el-row>
    </div>  
</template>
  
<script>
import { ref,reactive} from 'vue';
import httpHelper from '../api/httpHelper';
import { ElMessageBox } from 'element-plus';
import { ElMessage } from 'element-plus'

 export default{
    name:'sub_bookout',
    props:["recipe_info"],
    emits: ["close"],
    setup(props,context){
        const dataForm=ref();
        const formInline = reactive({
        qty: '',
        user: '',
        remark:'',
        // closed:false,
        rules:{
            qty:[{required:true,message:'请输入重量',trigger:'blur'},{min:0,max:props.recipe_info.QTY,type:'number',message:'超出范围',trigger:'blue'}],
            user:[{required:true,message:'请选择操作员',trigger:'blur'}],
        },
        setmax:()=>{formInline.qty=props.recipe_info.QTY}
      });
      const options=reactive({'user':['Xue Guo','Li Mingyao','Zhou Mianqing'],});

    const onSubmit = () => {
        dataForm.value.validate((valid)=>{
            if(valid){
                ElMessageBox.confirm('compound book in?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // if(formInline.batch==props.recipe_info.Batch_Amount){formInline.closed=true};
                    console.log(formInline)
                    httpHelper.post('/labbook/lab_inout', {'flag':'bookout','entry':formInline,'recipe_info':props.recipe_info}, function (res) {
                    // console.log(res.data)
                    if(res.data.status){
                        ElMessage.success({
                        message: '成功!'
                        });
                        context.emit("close");
                    }else{
                        ElMessage.warning({
                        message: '失败!'
                        });
                    }
                })
                }).catch(() => {
                    ElMessage.info({
                    message: '已取消'
                    });
                    context.emit("bookin_close");
                });
            }
        })
      };
      return{options,formInline,onSubmit,dataForm}
    }
  }
  
</script>

<style></style>
  