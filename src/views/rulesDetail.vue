<template>
    <div class="container">
        <a-form :form="form" @submit="handleSubmit">
            <div style="border-bottom:1px solid rgb(236, 236, 236);margin:0 0 20px 0;display:flex;flex-decoration:row;justify-content:space-between;">
                <a-form-item label="规则名称" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                    <a-input v-decorator="['name', { rules: [{ required: true, message: '请输入规则名称!' }] }]"/>
                </a-form-item>
                <div style="margin-right:20px;">
                    <span>停用规则</span>
                    <a-switch @change="onChange" />
                </div>
            </div>

            <p class="createNote"><span>规则创建时间 ： {{nowDate}}</span><span>规则更新时间 ： {{nowDate}}</span><span>已分配用户 ：{{user}} 人</span></p>

            <p class="formTitle">满足下列条件的流量</p>
            <div class="chooseBox chooseBox1" v-for="(item,index) in conditions" :key="index">
            <!-- 左侧下拉列表 -->
                <a-form-item :wrapper-col="{ span: 5 }" style="margin-left:30px;">
                    <a-select showSearch optionFilterProp="children" @change="handleSelectChange('types',$event,index)" style="width:300px;">
                        <a-select-option v-for="(item_1,index_1) in matchTypes" :key="index_1" :value="item_1.id">{{item_1.name}}</a-select-option>
                    </a-select>
                </a-form-item>
            <!-- 右侧下拉列表 -->
                <a-form-item :wrapper-col="{ span: 5 }" style="margin-left:30px;">
                    <a-select mode="tags" style="width: 300px" @change="handleSelectChange('values',$event,index)">
                        <a-select-option v-for="(item_2,index_2) in matchValues" :key="index_2" :value="item_2.key">{{item_2.val}}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-button type="link" style="color:red;" @click="deletes('flow',index)">删除</a-button>
            </div>
            <a-button type="link" @click="addSort('condition')" :class="conditions.length==5?'gray':''" style="margin-bottom:20px">添加条件</a-button>

            <p class="formTitle">按以下分组分配</p>
            <div class="chooseBox chooseBox2" v-for="(item,index_total) in tags" :key="'total'+index_total">
                <span class="sort-span sortNum">{{index_total+1}}</span>
                <a-form-item :wrapper-col="{ span: 4 }" style="margin-left:10px;">
                    <a-select style="width: 80px" @change="handleSelectChange('flow',$event,index_total)">
                        <a-select-option v-for="(item,index) in flows" :key="'num'+index" :value="item">{{item}}</a-select-option>
                    </a-select>
                </a-form-item>
                <span class="sort-span sortTxt">流量</span>
                <span class="sort-span sortTxt">依据</span>
            <!-- 分组分配数组 -->
                <div class="chooseBox chooseBox1">
                    <a-form-item :wrapper-col="{ span: 12 }" style="margin-left:15px;">
                        <a-select showSearch optionFilterProp="children" @change="handleSelectChange('sort',$event,index_total)" style="width:200px;">
                            <a-select-option v-for="(item_1,index) in deliverTypes" :key="'total'+index" :value="item_1.id">{{item_1.name}}</a-select-option>
                        </a-select>
                    </a-form-item>
                    <span class="sort-span sortTxt">分配</span>
                    <a-button type="link" style="color:red;margin-top:2px;" @click="deletes('sorts',index_total)">删除</a-button>
                </div>
            </div>
            <!-- 这里判断颜色的条件需要改变 是所有百分比加起来是100%就不能添加了 -->
            <a-button type="link" @click="addSort('flow')" :class="tags.length==5?'gray':''" style="margin-bottom:20px">添加分组</a-button>
            <div class="conflictTip" v-if="isConflict">
                <a-alert message="规则1 和 规则2 覆盖流量有重叠，发生冲突时优先执行规则1" banner class="metion"/>
                <span class="view" @click="viewManner">点击查看关联规则<a-icon type="right" style="margin-left:5px;"/></span>
            </div>
            <a-form-item :wrapper-col="{ span: 12 }">
                <a-button type="primary" html-type="submit"> 保存 </a-button>
            </a-form-item>
        </a-form>
        <a-modal title="关联规则" v-model="visible" @ok="handleOk" class="popup">
            <p>规则1和以下规则覆盖流量有重叠，请确认执行顺序</p>
            <ul>
                <li v-for="(item,index) in manner" :key="index"><span>{{index+1}}</span><span>{{item.name}}</span><a-icon class="arrow arrup" type="arrow-up" v-if="index!=0" @click="arrowClick('up',index)"/><a-icon class="arrow arrdw" type="arrow-down" v-if="index!=manner.length-1" @click="arrowClick('down',index)"/></li>
            </ul>
        </a-modal>
    </div>
</template>

<script>
import requestData from '../requestMethod'
export default {
    props:['index','length'],
    data() {
        return {
            id:0,                   //新增规则id为0 修改规则 id为规则自己的id
            isUpdate:false,             //检测冲突 新增为false 修改为true
            manner_name:'',         //规则名称
            formLayout: 'inline',
            form: this.$form.createForm(this, { name: 'rules' }),
            enabled:false,          //是否停用规则
            nowDate:'',         //当前时间
            user:'',         //已分配用户 -- 新建默认为0
            conditions:[],         //筛选条件数组
            matchTypes:[],          //左侧下拉列表 - 匹配类型
            matchValues:[],         //右侧下拉列表 - 匹配值     -- 与左侧为联动关系
            deliverTypes:[],           // 分配类型
            matchers:[],                //匹配条件
            delivers:[],                   //分配条件
            num:1,              //分组 -- 排序
            sort:[],                //规则排序
            flows:['10%','20%','30%','40%','50%','60%','70%','80%','90%','100%'],           //流量百分比
            tags:[],                    
            isConflict:false,               //是否冲突
            visible:false,               //弹窗
            manner:[                    //弹窗规则数组
                {
                    name:'规则1'
                },                   //弹窗规则数组
                {
                    name:'规则2'
                },                   //弹窗规则数组
                {
                    name:'规则3'
                },
            ],
            flowSetNum:'',               //分组分配流量
        }
    },
    mounted(){
        this.changeForm();
    },
    methods:{
        /** 切换规则时 对应修改表单展示 */
        changeForm(){
            /** 改变规则名称 */
            this.form.setFieldsValue({
                name: this.index==0 ? ('规则' + this.length) : ('规则' + (this.index + 1)),
            });
        },
        /** 停用按钮 - 确认弹窗 */
        onChange(checked){
            if(this.index==0){      //新增时点停用规则不判断
                return
            }else{
                requestData('EnableRule',{
                    id:this.id,
                    enabled:checked
                },'post').then((res)=>{
                    console.log(res)
                },(err)=>{
                    console.log(err)
                })
            }
            // this.enabled = checked;
        },
        /** 添加条件 */
        addSort(type){
            switch (type) {
                case 'condition':           //添加满足条件的流量
                    this.conditions.push({});
                    if(this.matchTypes.length==0){     //如果已经请求到 不重复请求
                        this.getListLeft();             //获取接口数据
                    }
                    if(this.conditions.length == 5){
                        this.$error({ title: '最多5个条件！' });
                    }
                    break;
                case 'flow':
                    this.tags.push({});
                    if(this.deliverTypes.length==0){
                        this.getListBottom();
                    }
                    break;
                default:
                    break;
            }
        },
        /** 切换下拉框 */
        handleSelectChange(type,value,index) {
            switch (type) {
                case 'types':
                    this.getListRight(value);
                    for(let i = 0; i < this.matchers.length; i++){
                        if(this.matchers[i].TypeId == value){
                            this.$error({title:'不能重复选择！'});
                        }
                    }
                    this.matchers.push({
                        id:0,
                        TypeId:value,
                        Values:[]
                    })
                    break;
                case 'values':
                    this.matchers[index].Values = value;
                    break;
                case 'flow':
                    this.flowSetNum = Number(this.flowSetNum) + parseInt(value);
                    if(this.flowSetNum > 100){
                        this.$error({ title: '百分比必须等于100%！' });
                    }
                    this.delivers.push({
                        id:0,
                        Rate:parseInt(value),
                        TypeId:''
                    })
                    break;
                case 'sort':
                    this.delivers[index].TypeId = value;
                    break;
                default:
                    break;
            }
        },
        /** 获取满足条件流量  左侧下拉列表的值 */
        getListLeft(){
            requestData('GetMatchTypes',{},'get').then((res)=>{
				this.matchTypes = res;
            },(err)=>{
                console.log(err)
            })
        },
        /** 右侧下拉列表的值 -- 与左侧为联动关系 */
        getListRight(id){
            requestData('GetMatchValues',{
                id:id
            },'get').then((res)=>{
				this.matchValues = res;
            },(err)=>{
                console.log(err)
            })
        },
        /** 分组分配下拉列表的值 */
        getListBottom(){
            requestData('GetDeliverTypes',{},'get').then((res)=>{
				this.deliverTypes = res;
            },(err)=>{
                console.log(err)
            })
        },
        /** 删除 */
        deletes(type,index){        //type -- flow-流量 sorts-分组
            if(type=='flow'){
                this.conditions.splice(index,1);
                this.matchers.splice(index,1);
            }else{
                this.tags.splice(index,1);
                this.delivers.splice(index,1);
            }
        },
        /** 第一次提交表单 -- 整合数据 */
        handleSubmit(e) {
            e.preventDefault();
            var that = this;
            this.form.validateFields((err, values) => {
                if (!err) {
                    that.manner_name = values.name;
                }
            })
            this.jsonData = {
                id:this.id,
                Name:this.manner_name,
                Enabled:this.enabled,
                Matchers:this.matchers,
                Delivers:this.delivers,
                Sort:this.sort
            }
            this.checkConflict();
        },
        /** 判断是否冲突 */
        checkConflict(){
            requestData('CheckConflict',{
                ...this.jsonData,
                isUpdate:this.isUpdate
            },'post').then((res)=>{
                if(res.code==0){        //没有冲突 将hash带到表单提交接口
                    this.submitForm(res.data.hash);
                }
            },(err)=>{
                console.log(err)
            })
        },
        /** 最后确认提交表单 */
        submitForm(hash){
            requestData('AddRule?hash='+hash,{
                ...this.jsonData,
                Sort:['']
            },'post').then((res)=>{
				console.log(res)
            },(err)=>{
                console.log(err)
            })
        },
        /** 查看冲突规则 */
        viewManner(){
            //弹窗
            this.visible = true;
        },
        /** 箭头点击事件 */
        arrowClick(type,index){
            switch (type) {
                case 'up':
                    console.log('向上排名',index);
                    break;
                case 'down':
                    console.log('向下排名',index);
                    break;
                default:
                    break;
            }
        },
        /** 弹窗确定事件 */
        handleOk(e){
            this.visible = false;
        },
    },
    watch:{
        index:function(){
            this.changeForm();
        }
    }
}
</script>

<style>
    .container .createNote span{
        margin-right: 20px;
        color: rgb(138, 136, 136);
    }
    .container .chooseBox{
        display: flex;
        flex-direction: row;
    }
    .container .chooseBox .ant-form-item{
        margin-bottom: 16px;
    }
    .container .formTitle{
        color: rgb(59, 59, 59);
    }
    .container .chooseBox2{
        display: flex;
        flex-direction: row;
        align-items: flex-start;
    }
    .container .chooseBox2 .sort-span{
        margin-top: 8px;
    }
    .container .chooseBox2 .sortNum{
        display: block;
        width: 20px;
        height: 20px;
        background-color: #1890ff;
        text-align: center;
        line-height: 20px;
        color: #fff;
    }
    .container .chooseBox2 .sortTxt{
        color: rgb(150, 146, 146);
        margin-left: 10px;
    }
    .container .conflictTip{
        position: relative;
    }
    .container .conflictTip .metion{
        width: 60%;
    }
    .container .conflictTip .view{
        color: #1890ff;
        position: absolute;
        right: 42%;
        top: 20%;
        cursor: pointer;
    }
    .gray{
        color: gray;
    }
    .popup ul li{
        list-style: none;
        margin-bottom: 10px;
    }
    .popup ul li span{
        margin-right: 20px;
    }
    .popup ul li span:first-child{
        width: 20px;
        height: 20px;
        background-color: #1890ff;
        text-align: center;
        line-height: 20px;
        color: #fff;
        display: inline-block;
    }
    .popup ul li .arrow{
        cursor: pointer;
        margin-right: 10px;
    }
</style>
