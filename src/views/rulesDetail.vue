<template>
    <div class="container">
        <a-form :form="form" @submit="handleSubmit">
            <a-form-item label="规则名称" :label-col="{ span: 2 }" :wrapper-col="{ span: 5 }" style="border-bottom:1px solid rgb(236, 236, 236);padding:0 0 20px 0;">
                <a-input v-decorator="['name', { rules: [{ required: true, message: '请输入规则名称!' }] }]"/>
            </a-form-item>

            <p class="createNote"><span>规则创建时间 ： {{nowDate}}</span><span>规则更新时间 ： {{nowDate}}</span><span>已分配用户 ：{{user}} 人</span></p>

            <p class="formTitle">满足下列条件的流量</p>
            <div class="chooseBox chooseBox1" v-for="(item,index) in conditions" :key="index">
                <a-form-item :wrapper-col="{ span: 5 }" style="margin-left:30px;">
                    <a-select showSearch optionFilterProp="children" @change="handleSelectChange('ways',$event)" :filterOption="filterOption" style="width:300px;">
                        <a-select-option v-for="(item_1,index_1) in item.titles" :key="index_1" :value="item_1.name">{{item_1.name}}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item :wrapper-col="{ span: 5 }" style="margin-left:30px;">
                    <a-select mode="tags" style="width: 300px" @change="handleSelectChange('value_condition',$event)">
                        <a-select-option v-for="(item_2,index_2) in item.selections" :key="index_2" :value="item_2.name">{{item_2.name}}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-button type="link" style="color:red;" @click="deletes(index)">删除</a-button>
            </div>
            <a-button type="link" @click="addSort('condition')" :class="conditions.length==5?'gray':''" style="margin-bottom:20px">添加条件</a-button>

            <p class="formTitle">按以下分组分配</p>
            <div class="chooseBox chooseBox2" v-for="(item,index_total) in tags" :key="'total'+index_total">
                <span class="sort-span sortNum">{{num}}</span>
                <a-form-item :wrapper-col="{ span: 2 }" style="margin-left:10px;">
                    <a-select defaultValue="50%" style="width: 100px" @change="handleSelectChange('flow',$event)">
                        <a-select-option v-for="(item,index) in flows" :key="'num'+index" :value="item">{{item}}</a-select-option>
                    </a-select>
                </a-form-item>
                <span class="sort-span sortTxt">流量</span>
                <span class="sort-span sortTxt">分配给</span>
                <div class="chooseBox chooseBox1">
                    <a-form-item :wrapper-col="{ span: 5 }" style="margin-left:15px;">
                        <a-select showSearch optionFilterProp="children" @change="handleSelectChange('sort',$event)" :filterOption="filterOption" style="width:150px;">
                            <a-select-option v-for="(item_1,index) in item.titles" :key="'total'+index" :value="item_1.name">{{item_1.name}}</a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item :wrapper-col="{ span: 5 }" style="margin-left:15px;">
                        <a-select mode="tags" style="width: 200px" @change="handleSelectChange('value_flow',$event)">
                            <a-select-option v-for="(item_2,index) in item.selections" :key="'selection'+index" :value="item_2.name">{{item_2.name}}</a-select-option>
                        </a-select>
                    </a-form-item>
                    <span class="sort-span sortTxt">的咨询师</span>
                    <a-button type="link" style="color:red;margin-top:2px;" @click="deletes(index_total)">删除</a-button>
                </div>
            </div>
            <!-- 这里判断颜色的条件需要改变 是所有百分比加起来是100%就不能添加了 -->
            <a-button type="link" @click="addSort('flow')" :class="tags.length==5?'gray':''" style="margin-bottom:20px">添加分组</a-button>
            <div class="conflictTip">
                <a-alert message="规则1 和 规则2 覆盖流量有重叠，发生冲突时优先执行规则1" banner class="metion"/>
                <span class="view" @click="viewManner">点击查看关联规则<a-icon type="right" style="margin-left:5px;"/></span>
            </div>
            <!-- <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
                <a-button type="primary" html-type="submit">
                    Submit
                </a-button>
            </a-form-item> -->
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
export default {
    props:['index','length'],
    data() {
        return {
            formLayout: 'inline',
            form: this.$form.createForm(this, { name: 'rules' }),
            nowDate:'',         //当前时间
            user:'',         //已分配用户 -- 新建默认为0
            conditions:[         //筛选条件数组
                {
                    titles:[
                        {
                            name:'渠道'
                        },
                        {
                            name:'意向项目'
                        },
                        {
                            name:'大区'
                        },
                        {
                            name:'省份'
                        },
                        {
                            name:'城市'
                        }
                    ],
                    selections:[
                        {
                            name:'官网meb'
                        },
                        {
                            name:'搜索引擎SEM'
                        },
                    ]
                },
                {
                    titles:[
                        {
                            name:'渠道'
                        },
                        {
                            name:'意向项目'
                        },
                        {
                            name:'大区'
                        },
                        {
                            name:'省份'
                        },
                        {
                            name:'城市'
                        }
                    ],
                    selections:[
                        {
                            name:'眼部整形'
                        },
                        {
                            name:'抽脂'
                        },
                        {
                            name:'削骨'
                        },
                        {
                            name:'埋线'
                        },
                    ]
                },
                {
                    titles:[
                        {
                            name:'渠道'
                        },
                        {
                            name:'意向项目'
                        },
                        {
                            name:'大区'
                        },
                        {
                            name:'省份'
                        },
                        {
                            name:'城市'
                        }
                    ],
                    selections:[
                        {
                            name:'西南'
                        },
                        {
                            name:'东北'
                        },
                        {
                            name:'西北'
                        },
                        {
                            name:'东南'
                        },
                        {
                            name:'华中'
                        },
                    ]
                },
                {
                    titles:[
                        {
                            name:'渠道'
                        },
                        {
                            name:'意向项目'
                        },
                        {
                            name:'大区'
                        },
                        {
                            name:'省份'
                        },
                        {
                            name:'城市'
                        }
                    ],
                    selections:[
                        {
                            name:'眼部整形'
                        },
                        {
                            name:'抽脂'
                        },
                        {
                            name:'削骨'
                        },
                        {
                            name:'埋线'
                        },
                    ]
                },
                {
                    titles:[
                        {
                            name:'渠道'
                        },
                        {
                            name:'意向项目'
                        },
                        {
                            name:'大区'
                        },
                        {
                            name:'省份'
                        },
                        {
                            name:'城市'
                        }
                    ],
                    selections:[
                        {
                            name:'眼部整形'
                        },
                        {
                            name:'抽脂'
                        },
                        {
                            name:'削骨'
                        },
                        {
                            name:'埋线'
                        },
                    ]
                },
            ],
            num:1,              //分组 -- 排序
            flows:['10%','20%','30%','40%','50%','60%','70%','80%','90%','100%'],           //流量百分比
            tags:[
                {
                    titles:[
                        {
                            name:'眼部转化率'
                        },
                        {
                            name:'入职时间'
                        },
                        {
                            name:'其他啥的随便'
                        },
                    ],
                    selections:[
                        {
                            name:'40%~60%'
                        },
                        {
                            name:'40%'
                        },
                        {
                            name:'60%'
                        },
                        {
                            name:'20%~30%'
                        },
                        {
                            name:'20%'
                        },
                        {
                            name:'30%'
                        },
                    ]
                },
                {
                    titles:[
                        {
                            name:'眼部转化率'
                        },
                        {
                            name:'入职时间'
                        },
                        {
                            name:'其他啥的随便'
                        },
                    ],
                    selections:[
                        {
                            name:'近半年'
                        },
                        {
                            name:'近一年'
                        },
                        {
                            name:'近两年'
                        }
                    ]
                }
            ],
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
            ]
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
                name: this.index==0 ? '规则' + this.length : '规则' + this.index,
            });
        },
        /** 切换下拉框 */
        handleSelectChange(type,value) {
            console.log(type,value)
            // this.form.setFieldsValue({
            //     name: `Hi, ${value === 'male' ? 'man' : 'lady'}!`,
            // });
        },
        filterOption(input, option) {
            return (
                option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
            );
        },
        /** 删除 */
        deletes(index){
            console.log(index)
            this.conditions.splice(index,1)
        },
        /** 添加条件 */
        addSort(type){
            switch (type) {
                case 'condition':
                    if(this.conditions.length == 5){
                        this.$error({
                            title: '最多5个条件！'
                        });
                    }
                    break;
                case 'flow':
                    if(this.tags.length == 5){
                        this.$error({
                            title: '百分比必须等于100%！'
                        });
                    }
                    break;
                default:
                    break;
            }
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
        /** 提交表单 */
        handleSubmit(e) {
            e.preventDefault();
            this.form.validateFields((err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values);
                }
            });
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
