<template>
    <div class="container">
        <a-form :form="form" @submit="handleSubmit">
            <div style="border-bottom:1px solid rgb(236, 236, 236);margin:0 0 20px 0;display:flex;flex-decoration:row;justify-content:space-between;">
                <a-form-item label="规则名称" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
                    <a-input v-decorator="['name', { rules: [{ required: true, message: '请输入规则名称!' }] }]"/>
                </a-form-item>
                <div style="margin-right:20px;">
                    <span>启用规则</span>
                    <a-switch @change="onChange" :checked="enabled"/>
                </div>
            </div>

            <p class="createNote"><span>规则创建时间 ： {{ rules[index] ? rules[index].createTime : '' }}</span><span>规则更新时间 ： {{ rules[index] ? rules[index].updateTime : '' }}</span><span>已分配用户 ：{{ details ? details.usersDelivered : '' }} 人</span></p>

            <p class="formTitle">满足下列条件的流量</p>
            <div class="chooseBox chooseBox1" v-for="(item,index) in matchers" :key="index">
            <!-- 左侧下拉列表 -->
                <a-form-item :wrapper-col="{ span: 5 }" style="margin-left:30px;">
                    <!-- 给select绑定value 即编辑时的表单返回的值 -->
                    <a-select showSearch optionFilterProp="children" :value='item.TypeId' @change="handleSelectChange('types',$event,index)" style="width:300px;">
                        <a-select-option v-for="(item_1,index_1) in matchTypes" :key="index_1" :value="item_1.id">{{item_1.name}}</a-select-option>
                    </a-select>
                </a-form-item>
            <!-- 右侧下拉列表 -->
                <a-form-item :wrapper-col="{ span: 5 }" style="margin-left:30px;">
                    <a-select mode="multiple" style="width: 300px" :value='item.Values' @change="handleSelectChange('values',$event,index)" @dropdownVisibleChange="(open)=> handleDropdownRight(item.TypeId,index,open)">
                        <a-select-option v-for="(item_2,index_2) in item.rightList" :key="index_2" :labelInValue="true" :value="(item_2.key).toString() || item_2.val">{{item_2.val}}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-button type="link" style="color:red;" @click="deletes('flow',index)">删除</a-button>
            </div>
            <a-button type="link" @click="addSort('condition')" style="margin-bottom:20px" :disabled="condition_btn">添加条件</a-button>

            <p class="formTitle">按以下分组分配</p>
            <div class="chooseBox chooseBox2" v-for="(item,index_total) in tags" :key="'total'+index_total">
                <span class="sort-span sortNum">{{index_total+1}}</span>
                <a-form-item :wrapper-col="{ span: 4 }" style="margin-left:10px;">
                    <a-select style="width: 80px" :value="item.Rate==0?'':(item.Rate+'%')" @change="handleSelectChange('flow',$event,index_total)"  @dropdownVisibleChange="(open)=> handleDropdown('flow',index_total,open)" >
                        <a-select-option v-for="(_item,index) in item.scope" :key="'num'+index" :value="_item">{{_item}}</a-select-option>
                    </a-select>
                </a-form-item>
                <span class="sort-span sortTxt">流量</span>
                <span class="sort-span sortTxt">依据</span>
            <!-- 分组分配数组 -->
                <div class="chooseBox chooseBox1">
                    <a-form-item :wrapper-col="{ span: 12 }" style="margin-left:15px;">
                        <a-select showSearch optionFilterProp="children" :value="item.TypeId" @change="handleSelectChange('sort',$event,index_total)" style="width:200px;">
                            <a-select-option v-for="(item_1,index) in deliverTypes" :key="'total'+index" :labelInValue="true" :value="item_1.id || item_1.name">{{item_1.name}}</a-select-option>
                        </a-select>
                    </a-form-item>
                    <span class="sort-span sortTxt">分配</span>
                    <a-button type="link" style="color:red;margin-top:2px;" @click="deletes('sorts',index_total)">删除</a-button>
                </div>
            </div>
            <a-button type="link" @click="addSort('flow')" style="margin-bottom:20px">添加分组</a-button>
            
            <div class="conflictTip" v-if="isConflict">
                <a-alert :message='curMessage' banner class="metion"/>
                <span class="view" @click="viewManner">点击查看关联规则<a-icon type="right" style="margin-left:5px;"/></span>
            </div>
            <a-form-item :wrapper-col="{ span: 12 }">
                <a-button type="primary" html-type="submit"> 保存 </a-button>
            </a-form-item>
        </a-form>
        <a-modal title="关联规则" v-model="visible" @ok="handleOk" class="popup" :maskClosable='false'>
            <p>{{curMessage}}</p>
            <ul>
                <li v-for="(item,index) in manner" :key="index"><span>{{index+1}}</span><span>{{item.name}}</span><a-icon class="arrow arrup" type="arrow-up" v-if="index!=0" @click="arrowClick('up',index)"/><a-icon class="arrow arrdw" type="arrow-down" v-if="index!=manner.length-1" @click="arrowClick('down',index)"/></li>
            </ul>
        </a-modal>
    </div>
</template>

<script>
export default {
    props:['index','length','rules','details'],
    data() {
        return {
            isUpdate:false,             //检测冲突 新增为false 修改为true
            manner_name:'',         //规则名称
            formLayout: 'inline',
            form: this.$form.createForm(this, { name: 'rules' }),
            enabled:false,
            condition_btn:false,             //添加条件 - 按钮权限
            matchTypes:[],          //左侧下拉列表 - 匹配类型
            deliverTypes:[],           // 分配类型
            matchers:[],                //匹配条件
            num:1,              //分组 -- 排序
            sort:[],                //规则排序
            flows:['10%','20%','30%','40%','50%','60%','70%','80%','90%','100%'],           //流量百分比
            tags:[],                    
            isConflict:false,               //是否冲突
            visible:false,               //弹窗
            curMessage:'',                 //
            manner:[],                  //弹窗规则数组
            arr:[],                     //暂存总的规则数组
            flowSetNum:'',               //分组分配流量
            isDeal:false,                   //是否已经处理了冲突
        }
    },
    mounted(){
        this.changeForm();
        this.getListLeft();
        this.sort = [];             //先清空该数组
        if(JSON.stringify(this.rules)!='[]'&&this.rules.length!=0){
            for(let i = 0; i < this.rules.length; i++){
                this.sort.push(this.rules[i].id);
            }
        }
    },
    methods:{
        /** 切换规则时 对应修改表单展示 */
        changeForm(){
            /** 改变规则名称 */
            this.form.setFieldsValue({
                name:this.rules ? this.rules[this.index].name : (('规则' + (this.index + 1)))
            });
            this.matchers = [];     //如果为新增 清空之前获取到的details
            this.tags = [];
            this.arr = [];
            this.isConflict = false;
            this.isDeal = false;
        },
        /** 停用按钮 - 只是个页面样式 */
        onChange(checked){
            if(this.rules[this.index].id == 0){       //如果是新增 则停用按钮不起作用
                return
            }else{
                this.enabled = checked;             //先给页面样式 如果不点保存 则不生效 点击保存时 同时请求表单提交接口和按钮接口
            }
        },
        /** 添加条件 */
        addSort(type){
            switch (type) {
                case 'condition':           //添加满足条件的流量
                    this.matchers.push({
                        id:this.rules[this.index].id,
                        TypeId:'',
                        Values:[],
                        rightList:[]
                    })
                    if(this.matchTypes.length==0){     //如果已经请求到 不重复请求
                        this.getListLeft();             //获取接口数据
                    }
                    if(this.matchers.length == 5){
                        this.$error({ title: '最多5个条件！' });
                        this.condition_btn = true;
                    }
                    break;
                case 'flow':
                    this.tags.push({
                        id:this.rules[this.index].id,
                        scope:JSON.parse(JSON.stringify(this.flows)),
                        value:0,
                        TypeId:'',
                        Rate:''
                    });
                    if(this.deliverTypes.length==0){     //如果已经请求到 不重复请求
                        this.getListBottom();
                    }
                    break;
                default:
                    break;
            }
        },
        handleDropdown(type,index,open){
            if(open){
                let allValue=0, resultScope = [];
                this.tags.map((item,idx)=>{
                    if(index!=idx){
                        allValue+=item.value
                    }
                })
                this.tags[index].scope = this.flows.slice(0,(100-allValue)/10);
            }
        },
        /** 切换下拉框 */
        handleSelectChange(type,value,index) {
            switch (type) {
                case 'types':
                    this.matchers[index].Values = [];
                    this.handleDropdownRight(value,index,true);
                    for(let i = 0; i < this.matchers.length; i++){
                        if(this.matchers[i].TypeId == value){
                            this.$error({title:'不能重复选择！'});
                        }
                    }
                    this.matchers[index].TypeId = value;
                    break;
                case 'values':
                    this.matchers[index].Values = value;
                    break;
                case 'flow':
                    this.tags[index].Rate = parseInt(value);
                    this.tags[index].value = parseInt(value);
                    break;
                case 'sort':
                    this.tags[index].TypeId = value;
                    break;
                default:
                    break;
            }
        },
        /** 获取满足条件流量  左侧下拉列表的值 */
        getListLeft(){
            var _this = this;
            this.$getRuleMatchTypes()
            .then(res=>_this.matchTypes = res.data);

            // this.$doRequest("Rules/GetMatchTypes",{} , 'get' , res => {
            //     if(res.code==0){
            //         this.matchTypes = res.data;
            //     }
            // });
        },
        /** 右侧下拉列表的值 -- 与左侧为联动关系 */
        handleDropdownRight(typeId,index,open){  //根据 左边的id  重新更新可选列表
            if(open && typeId){
                this.$getRuleMatchValues(typeId)
                .then(res=>{
                    this.matchers[index].rightList = res.data;
                });
                // this.$doRequest("Rules/GetMatchValues",{ id:typeId } , 'get' , res => {
                //     if(res.code==0){
                //         this.matchers[index].rightList = res.data;
                //     }
                // });
            }
        },
        /** 分组分配下拉列表的值 */
        getListBottom(){
            var _this = this;
            this.$getRuleDeliverTypes()
            .then(res=>_this.deliverTypes = res.data);

            // this.$doRequest("Rules/GetDeliverTypes",{} , 'get' , res => {
            //     if(res.code==0){
            //         this.deliverTypes = res.data;
            //     }
            // });
        },
        /** 删除 */
        deletes(type,index){        //type -- flow-流量 sorts-分组
            if(type=='flow'){
                this.matchers.splice(index,1);
            }else{
                this.tags.splice(index,1);
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
            this.matchers.map((item,index)=>{
                delete item.rightList;
            })
            this.tags.map((item,index)=>{
                delete item.scope;
                delete item.value;
            })
            this.jsonData = {
                id:this.rules[this.index].id,
                Name:this.manner_name,
                Enabled:this.rules[this.index].id==0?true:this.enabled,
                Matchers:this.matchers,
                Delivers:this.tags,
                Sort:JSON.stringify(this.sort)=='[]'?'[]':this.sort
            }
            if(this.jsonData.Enabled){      //没有启用的规则不用检测冲突
                this.checkConflict();
            }else{
                this.submitForm(null);
            }
        },
        /** 判断是否冲突 */
        checkConflict(){
            this.manner = [];           //不管是否有冲突 判断之前先将该数组清空
            if(this.rules[this.index].id==0){       //新增
                this.isUpdate = false;
            }else{
                this.isUpdate = true;
            }
            this.$doRequest("Rules/CheckConflict",{ 
                    ...this.jsonData,
                    isUpdate:this.isUpdate
                } , 'post' , res => {
                if(res.code==0){        //没有冲突或者冲突已经解决 将hash带到表单提交接口
                    if((JSON.stringify(res.data.conflicts)=='[]'&&res.data.conflicts.length==0)||this.isDeal){
                        this.submitForm(res.data.hash);
                    }else{
                        this.curMessage = this.manner_name + '和以下规则覆盖流量有重叠，请确认执行顺序';
                        this.isConflict = true;
                        this.rules.map((item,index)=>{
                            this.arr.push(item.id);
                            res.data.conflicts.map((i,idx)=>{
                                if(item.id==i){
                                    this.arr[index]=null;
                                    this.manner.push(item);
                                }
                            })
                        })
                        this.sort = this.arr;
                    }
                }
                else{
                    this.$message.error(res.msg);
                }
            });
        },
        /** 最后确认提交表单 */
        submitForm(hash){
            var url_ = '';
            if(this.rules[this.index].id==0){       //新增
                url_ = "Rules/AddRule?hash="+hash
            }else{
                url_ = "Rules/UpdateRule?hash="+hash
            }
            this.$doRequest(url_, { 
                ...this.jsonData
            } , 'post' , res => {
                if(res.code==0){
                    if(this.rules[this.index].id==0){       //新增
                        this.$message.success('新增成功！');
                    }else{
                        this.$message.success('修改成功！');
                    }
                    this.manner = [];
                    this.arr = [];
                    this.$emit('refresh');
                }
            });
        },
        /** 启用规则按钮 接口 */
        startManner(){
            this.$doRequest("Rules/EnableRule",{
                id:this.rules[this.index].id,
                enable:this.enabled
            } , 'post' , res => {
                if(res.code==0){
                    console.log(res.msg)
                }
            });
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
                    this.manner.splice(index-1,1,...this.manner.splice(index, 1 , this.manner[index-1]));
                    break;
                case 'down':
                    this.manner.splice(index+1,1,...this.manner.splice(index, 1 , this.manner[index+1]));
                    break;
                default:
                    break;
            }
        },
        /** 弹窗确定事件 */
        handleOk(e){
            this.manner.map((item,index)=>{
                let i = this.arr.indexOf(null);
                if(i!==-1){
                    this.arr[i]=item.id;
                }
            })
            this.isDeal = true;
            this.visible = false;
        },
    },
    watch:{
        index:function(){
            this.changeForm();
        },
        matchers:function(){
            if(this.matchers.length<5){
                this.condition_btn = false;
            }
        },
        details:function(){
            if(JSON.stringify(this.details)!=='{}'){
                this.enabled = this.details.enabled;
                this.matchers = [];         //切换tab时初始化，防止重复添加
                this.tags = [];
                this.details.matches.map((item,idx)=>{
                    let itemObj = {
                        id:item.id,
                        TypeId:item.typeId,
                        Values:JSON.parse(item.values),
                        rightList:[]
                    };
                    this.matchers.push(itemObj);
                    this.handleDropdownRight(item.typeId,this.matchers.length-1,true);
                });
                this.details.delivers.map((item_2,idx_2)=>{
                    let itemObj_2 = {
                        id:item_2.id,
                        scope:JSON.parse(JSON.stringify(this.flows)),
                        value:item_2.rate,
                        TypeId:item_2.typeId,
                        Rate:item_2.rate,
                    };
                    this.tags.push(itemObj_2);
                    this.getListBottom();
                })
            }
        },
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
        padding-left: 2.5%;
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
        margin-bottom: 20px;
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
