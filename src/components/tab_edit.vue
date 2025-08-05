<template>
    <el-table border :data="data.tableData" :cell-style="{padding:'10px'}">
        <el-table-column prop="name" label="STEP 步骤" align="center">
            <template #default="scope">
                <h2>{{scope.row.name}}</h2>
            </template>
        </el-table-column>
        <el-table-column prop="suser" label="Scaling OP 称量员" align="center">
            <template #default="scope">
                <el-select size="large" v-model="scope.row.suser" clearable >
                    <el-option v-for="item in user" :value="item"/>
                </el-select>
            </template>
        </el-table-column>  
        <el-table-column prop="sdate" label="Scale Date 称量日期" align="center">
            <template #default="scope">
            <el-date-picker size="large"
                align="center"
                type="date"
                v-model="scope.row.sdate"
                placeholder="date 日期"/>
            </template>
        </el-table-column> 
        <el-table-column prop="muser" label="Mixing OP 混炼员" align="center">
            <template #default="scope">
            <el-select size="large" v-model="scope.row.muser" clearable >
                <el-option v-for="item in user" :value="item"/>
            </el-select>
            </template>
        </el-table-column>   
        <el-table-column prop="mdate" label="Mixing Date 混炼日期" align="center">
            <template #default="scope">
            <el-date-picker size="large"
                align="center"
                type="date"
                v-model="scope.row.mdate"
                placeholder="date 日期"/>
            </template>
        </el-table-column>  
        <el-table-column prop="time" label="Time 时长(min)" align="center">
            <template #default="scope">
            <el-input size="large"
                type="number"
                v-model="scope.row.time"
                maxlength="20"
                placeholder="Number 数字"
            />
            </template>
        </el-table-column>  
        <el-table-column prop="temp" label="Temp 温度" align="center">
            <template #default="scope">
            <el-input size="large"
                type="number"
                v-model="scope.row.temp"
                maxlength="20"
                placeholder="Number 数字"
            />
            </template>
        </el-table-column>  
        
        <el-table-column prop="QTY" label="QTY 重量" align="center">
            <template #default="scope">
            <el-input size="large"
                type="number"
                v-model="scope.row.qty"
                maxlength="20"
                placeholder="Number 数字"
            />
            </template>
        </el-table-column>    
        <el-table-column prop="remark" label="Remark 异常" align="center">
            <template #default="scope">
            <el-input size="large"
                v-model="scope.row.remark"
                maxlength="20"
                placeholder="String 文字"
            />
            </template>
        </el-table-column>  
    </el-table>    
</template>

<script>

import { ref,reactive} from 'vue';
export default {
    setup(){
        const today=Date.now()
        let data=reactive({
            tableData:[
            {name:'1段',suser:'',sdate:'',muser:'',mdate:'',time:'',temp:'',qty:'',remark:''},
            {name:'2段',suser:'',sdate:'',muser:'',mdate:'',time:'',temp:'',qty:'',remark:''},
            {name:'3段',suser:'',sdate:'',muser:'',mdate:'',time:'',temp:'',qty:'',remark:''}
            ]
        })
        let user=ref(['Xue Guo','Li Mingyao','Zhou Mianqing'])
        return{data,user}
    }
}
</script>
