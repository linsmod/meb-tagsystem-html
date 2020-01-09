<template>
    <div class="container">
       <div class="header">
            <a-select showSearch placeholder="选择渠道" optionFilterProp="children" style="width: 200px" @change="handleChange" :filterOption="filterOption">
                <a-select-option v-for="(i,index) in ways" :key="index" :value="i.id">{{i.name}}</a-select-option>
            </a-select>
            <div class="timepicker">
                <a-date-picker
                    style="width:200px"
                    format="YYYY-MM-DD"
                    v-model="startValue"
                    placeholder="请选择开始时间"
                    @openChange="handleStartOpenChange"
                    />
                    <span> - </span>
                    <a-date-picker
                    style="width:200px"
                    format="YYYY-MM-DD"
                    placeholder="请选择结束时间"
                    v-model="endValue"
                    :open="endOpen"
                    @openChange="handleEndOpenChange"
                />
            </div>
            <a-button type="primary" @click="search">搜索</a-button>
       </div>
       <div class="content">
            <div id="sankey" style="width: 100%;height: 500px;margin-top:20px;"></div>
       </div>
       
    </div>
</template>

<script>
export default {
    data() {
        return {
            ways:[],                //推广渠道 下拉框数组
            spreadtypeId:'',            //推广类别
            startValue: null,           //开始时间
            endValue: null,             //结束时间
            endOpen: false,
        }
    },
    mounted(){
        this.getWays();
    },
    methods:{
        /** 获取推广渠道 */
        getWays(){
            this.$doRequest("/rules/GetSpreadTypes",{} , 'get' , res => {
                if(res.code==0){
                    this.ways = res.data;
                }
            }); 
        },
        /** 推广渠道 下拉框change事件 */
        handleChange(value) {
            this.spreadtypeId = value;
        },
        /** 带筛选的下拉框 */
        filterOption(input, option) {
            return (
                option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
            );
        },
        /** 时间控件相关事件 */
        disabledStartDate(startValue) {
            const endValue = this.endValue;
            if (!startValue || !endValue) {
                return false;
            }
            return startValue.valueOf() > endValue.valueOf();
        },
        disabledEndDate(endValue) {
            const startValue = this.startValue;
            if (!endValue || !startValue) {
                return false;
            }
            return startValue.valueOf() >= endValue.valueOf();
        },
        handleStartOpenChange(open) {
            if (!open) {
                this.endOpen = true;
            }
        },
        handleEndOpenChange(open) {
            this.endOpen = open;
        },
        /** 搜索时判断 是否筛选项均有值 */
        search(){
            if(this.spreadtypeId==''){
                this.$error({title:'请选择渠道！'});
            }else if(this.startValue==null&&this.endValue==null){
                this.$error({title:'请选择时间！'});
            }else if(this.startValue==null&&this.endValue!=null){
                this.$error({title:'请选择开始时间！'});
            }else if(this.startValue!=null&&this.endValue==null){
                this.$error({title:'请选择结束时间！'});
            }
            if(this.spreadtypeId&&this.startValue&&this.endValue){
                this.init_sankey();
            }
        },
        /** 桑吉图 */
        init_sankey(){
            var dom = document.getElementById("sankey");
            var myChart = this.$echarts.init(dom);
            var app = {},option = null,that = this;
            myChart.showLoading();
            this.$doRequest("/rules/GetDeliverSankey",{
                spreadtypeId:this.spreadtypeId,
                dtFrom:this.startValue.format('YYYY-MM-DD'),
                dtTo:this.endValue.format('YYYY-MM-DD')
            } , 'get' , res => {
                if(res.code==0){
                    myChart.hideLoading(); 
                    option = {
                        tooltip: {
                            trigger: 'item',
                            triggerOn: 'mousemove'
                        },
                        series: [
                            {
                                type: 'sankey',
                                data: res.data.nodes,
                                links: res.data.links,
                                focusNodeAdjacency: true,
                                levels: [{
                                    depth: 0,
                                    itemStyle: {
                                        color: '#fbb4ae'
                                    },
                                    lineStyle: {
                                        color: 'source',
                                        opacity: 0.6
                                    }
                                }, {
                                    depth: 1,
                                    itemStyle: {
                                        color: '#b3cde3'
                                    },
                                    lineStyle: {
                                        color: 'source',
                                        opacity: 0.6
                                    }
                                }, {
                                    depth: 2,
                                    itemStyle: {
                                        color: '#ccebc5'
                                    },
                                    lineStyle: {
                                        color: 'source',
                                        opacity: 0.6
                                    }
                                }, {
                                    depth: 3,
                                    itemStyle: {
                                        color: '#decbe4'
                                    },
                                    lineStyle: {
                                        color: 'source',
                                        opacity: 0.6
                                    }
                                }],
                                lineStyle: {
                                    normal: {
                                        curveness: 0.5
                                    }
                                }
                            }
                        ]
                    };
                    that.$nextTick(function() {
                        if(document.getElementById('sankey')){
                            var div = document.getElementById("sankey");
                            div.removeAttribute("_echarts_instance_");
                            var chart = that.$echarts.init(div, null, {
                                renderer: 'canvas',
                                width: 'auto'
                            });
                            chart.setOption(option,true);
                        }
                        window.addEventListener("resize", function() {
                            chart.resize();
                        });
                    }) 
                }
            });
        }
    },
    watch: {
      startValue(val) {
          this.startValue = val;
      },
      endValue(val) {
          this.endValue = val;
      },
    },
}
</script>

<style>
    .container .header{
        display: flex;
        flex-direction: row;
    }
    .container .header .timepicker{
        margin-left: 20px;
        margin-right: 20px;
    }
    .container .content{
        margin-top: 20px;
    }
</style>