<template>
    <div class="container">
       <div class="header">
           <a-select mode="multiple" placeholder="选择渠道" style="width: 200px" @change="handleChange('way',$event)">
                <a-select-option v-for="(i,index) in ways" :key="index">{{i.name}}</a-select-option>
            </a-select>
       </div>
       <div class="content">
            <div class="timepicker">
                <a-date-picker :disabledDate="disabledStartDate" showTime format="YYYY-MM-DD HH:mm:ss" v-model="startValue" placeholder="选择录单开始时间" @openChange="handleStartOpenChange" style="margin-right:5px;width: 200px;"/>
                <a-date-picker :disabledDate="disabledEndDate" showTime format="YYYY-MM-DD HH:mm:ss" placeholder="选择录单结束时间" v-model="endValue" :open="endOpen" @openChange="handleEndOpenChange" style="width: 200px"/>
            </div>
            <div id="sankey" style="width: 100%;height: 500px;margin-top:20px;"></div>
       </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            ways:[
                {
                    name:'官网meb'
                },
                {
                    name:'小程序'
                },
                {
                    name:'地推'
                },
            ],
            startValue: null,
            endValue: null,
            endOpen: false,
            data_:{
                links:[
                    {
                        source: "Total",
                        target: "Environment",
                        value: 0.342284047256003
                    },
                    {
                        source: "Environment",
                        target: "Land use",
                        value: 0.32322870366987
                    },
                    {
                        source: "Land use",
                        target: "Cocoa butter (Organic)",
                        value: 0.177682517071359
                    },
                    {
                        source: "Land use",
                        target: "Cocoa mass (Organic)",
                        value: 0.137241325342711
                    },
                    {
                        source: "Land use",
                        target: "Cane sugar (Organic)",
                        value: 0.00296956039863467
                    },
                    {
                        source: "Land use",
                        target: "Vegetables (Organic)",
                        value: 0.00100453712203756
                    },
                    {
                        source: "Environment",
                        target: "Climate change",
                        value: 0.0112886157414413
                    },
                    {
                        source: "Climate change",
                        target: "Cocoa butter (Organic)",
                        value: 0.00676852971933996
                    },
                    {
                        source: "Climate change",
                        target: "Cocoa mass (Organic)",
                        value: 0.00394686874786743
                    },
                    {
                        source: "Climate change",
                        target: "Cane sugar (Organic)",
                        value: 0.000315972058711838
                    },
                    {
                        source: "Climate change",
                        target: "Hazelnuts (Organic)",
                        value: 0.000218969462265292
                    },
                    {
                        source: "Climate change",
                        target: "Vegetables (Organic)",
                        value: 0.0000382757532567656
                    },
                    {
                        source: "Environment",
                        target: "Harmful substances",
                        value: 0.00604275542495656
                    },
                    {
                        source: "Harmful substances",
                        target: "Cocoa mass (Organic)",
                        value: 0.0055125989240741
                    },
                    {
                        source: "Harmful substances",
                        target: "Cocoa butter (Organic)",
                        value: 0.000330017607892127
                    },
                    {
                        source: "Harmful substances",
                        target: "Cane sugar (Organic)",
                        value: 0.000200138892990337
                    },
                    {
                        source: "Harmful substances",
                        target: "Hazelnuts (Organic)",
                        value: 0
                    },
                    {
                        source: "Harmful substances",
                        target: "Vegetables (Organic)",
                        value: 0
                    },
                ],
                nodes:[
                    {
                        name:'Total'
                    },
                    {
                        name:'Environment'
                    },
                    {
                        name:'Land use'
                    },
                    {
                        name:'Cocoa butter (Organic)'
                    },
                    {
                        name:'Cocoa mass (Organic)'
                    },
                    {
                        name:'Hazelnuts (Organic)'
                    },
                    {
                        name:'Cane sugar (Organic)'
                    },
                    {
                        name:'Vegetables (Organic)'
                    },
                    {
                        name:'Climate change'
                    },
                    {
                        name:'Harmful substances'
                    },
                ]
            }
        }
    },
    mounted(){
        this.init_sankey();
    },
    methods:{
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
        /** 桑吉图 */
        init_sankey(){
            var dom = document.getElementById("sankey");
            var myChart = this.$echarts.init(dom);
            var app = {},option = null;
            myChart.showLoading();
            // myChart.hideLoading();
            option = {
                tooltip: {
                    trigger: 'item',
                    triggerOn: 'mousemove'
                },
                series: [
                    {
                        type: 'sankey',
                        data: this.data_.nodes,
                        links: this.data_.links,
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
            this.$nextTick(function() {
                if(document.getElementById('sankey')){
                    var div = document.getElementById("sankey");
                    div.removeAttribute("_echarts_instance_");
                    var chart = this.$echarts.init(div, null, {
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
    },
    watch: {
        startValue(val) {
            console.log('startValue', val);
        },
        endValue(val) {
            console.log('endValue', val);
        },
    },
}
</script>

<style>
    .container .content{
        margin-top: 20px;
    }
</style>