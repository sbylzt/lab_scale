<template>
    <div class="class1">
        <h1 style="background-color:lightgreen;height:40px;line-height: 40px;">Book In 入库</h1>
        <el-row>
            <el-col :span="24">
                <el-descriptions   :column="1" size="default" border>
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
            <el-form :inline="true" :model="formInline" class="demo-form-inline" size="large" :rules="formInline.rules" ref="dataForm">
                <el-form-item label="Quantity" style="width:20%" prop="qty">
                    <el-input v-model.number="formInline.qty" placeholder="Number 数字" type="number" step="0.5" min="0" max="100"/>
                </el-form-item>
                <el-form-item label="Batch" style="width:20%" prop="batch">
                    <el-input v-model.number="formInline.batch" placeholder="Number 数字" type="number" min="0" max="100"/>
                </el-form-item>                
                <el-form-item label="place" style="width:20%" prop="place">
                    <el-cascader :options="options.place" v-model="formInline.place" clearable :show-all-levels="true"/>
                </el-form-item> 
                <el-form-item label="User" style="width:20%" prop="user">
                    <el-select  v-model="formInline.user" clearable >
                        <el-option v-for="item in options.user" :value="item"/>
                    </el-select>
                </el-form-item>            
                <el-form-item label="Remark 备注" style="width:100%">
                    <el-input class="remark" v-model="formInline.remark" placeholder="Remark 备注" type="textarea" resize="none" :rows="2"/>
                </el-form-item>                 
            </el-form> 
            <div class="sub_tab"><tab_edit ref="tab_edit_data"/></div>
        </el-row>
        <el-button class="submit" type="success" @click="onSubmit" size="large">Commit 提交</el-button>  
        
    </div>  
</template>
  
<script>
import { ref,reactive} from 'vue';
import httpHelper from '../../src/api/httpHelper';
import { alertProps, ElMessageBox } from 'element-plus';
import { ElMessage } from 'element-plus';
import tab_edit from "./tab_edit.vue";

 export default{
    name:'sub_bookin',
    props:["recipe_info"],
    components:{tab_edit},
    emits: ["close","sub_bookin_close"],
    setup(props,context){
        let tab_edit_data=ref(null)
        const dataForm=ref();
        const formInline = reactive({
        qty: '',
        place:'',
        user: '',
        remark:'',
        batch:props.recipe_info.batch_set,
        closed:false,
        rules:{
            qty:[{required:true,message:'请输入重量',trigger:'blur'}],
            place:[{required:true,message:'请选择库位',trigger:'blur'}],
            user:[{required:true,message:'请选择操作员',trigger:'blur'}],
        },
      });
      const options=reactive({
        'place':[
            {
            value:'LA',
            label:'LA',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LB',
            label:'LB',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LC',
            label:'LC',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LD',
            label:'LD',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LE',
            label:'LE',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LF',
            label:'LF',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LG',
            label:'LG',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LH',
            label:'LH',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LI',
            label:'LI',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LJ',
            label:'LJ',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LK',
            label:'LK',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LL',
            label:'LL',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LM',
            label:'LM',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
                {
            value:'LN',
            label:'LN',
            children:[
                {value:'01',
                label:'01'},
                {value:'02',
                label:'02'},
                {value:'03',
                label:'03'},]},
        ],
        'user':['Xue Guo','Li Mingyao','Zhou Mianqing'],
    });

    const onSubmit = () => {
        dataForm.value.validate((valid)=>{
            if(valid){
                ElMessageBox.confirm('compound book in?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    if(formInline.batch>=props.recipe_info.batch_set-props.recipe_info.batch_now){formInline.closed=true};
                    httpHelper.post('/labbook/lab_inout', 
                        {'flag':'bookin','entry':formInline,'recipe_info':props.recipe_info,'son_table':tab_edit_data.value.data.tableData}, 
                    function (res) {
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
                    context.emit("sub_bookin_close");
                });
            }
        })

        
      };

    return{options,formInline,onSubmit,dataForm,tab_edit_data}
    }
  }
  
</script>

<style>
    .demo-form-inline{
        width: 100%;
        height: 100%;
    }
    .submit{
        min-width: 100%;
        min-height: 80px;
    }
    .sub_tab{
        background-color:lightgray;
        width: 100%;
        margin: 10px;
        padding:10px;
    }
</style>
  