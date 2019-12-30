<template>
	<div class="container">
		<a-row class="row-box">
      		<a-col :span="5" class="col-left">
				<ul>
					<li>规则<a-button type="primary" class="button" @click="addRule">添加规则</a-button></li>
					<li v-for="(item,index) in rules" :key="index" @click="changeTab(index)" :class="isActive==index?'active':''">{{item}}<a-icon type="right" class="icon"/></li>
				</ul>
			</a-col>
			<a-col :span="19" class="col-right">
				<RulesDetail :index="isActive" :length="rules.length" v-if="(rules&&rules.length!=0)||isShow"></RulesDetail>
				<div v-else class="noRule">暂无规则，请先添加规则！</div>
			</a-col>
		</a-row>
	</div>
</template>

<script>
import RulesDetail from './rulesDetail'
import requestData from '../requestMethod'
export default {
	components:{
		RulesDetail
	},
	data() {
		return {
			rules:[],
			isActive:0,
			isShow:false
		};
	},
	mounted(){
		this.getList();
	},
	methods:{
		getList(){
			requestData('GetRules ',{},'get').then((res)=>{
				// if(res.code==0){
				this.rules = res.data;
				// }else{
				// 	alert(res.message);
				// }
            },(err)=>{
                console.log(err)
            })
		},
		/** 添加规则 */
		addRule(){
			// this.isActive = 0;
			this.rules.push('规则'+(this.rules.length+1));
		},
		/** 切换规则 */
		changeTab(index){
			this.isActive = index;
			this.isShow = true;
		},

	}
};
</script>

<style>
	.container .row-box .col-left{
		overflow: auto;
	}
	.container .row-box .col-left ul{
		padding: 0;
		height: 800px;
		background-color: rgba(236, 236, 236, 0.514);
		border-left: 1px solid rgba(179, 176, 176, 0.459);
		border-right: 1px solid rgba(179, 176, 176, 0.459);
	}
	.container .row-box .col-left ul li{
		padding: 0 0 0 15px;
		border-bottom: 1px solid rgba(179, 176, 176, 0.459);
		list-style: none;
		height: 50px;
		line-height: 50px;
	}
	.active{
		background-color: rgb(223, 219, 219);
	}
	.container .row-box .col-left ul li .button{
		float: right;
		margin: 10px 10px 0 0;
	}
	.container .row-box .col-left ul li .icon{
		float: right;
		margin: 20px 10px 0 0;
	}
	.container .row-box .col-left ul li:first-child{
		background-color: rgb(223, 219, 219);
	}
	.container .row-box .col-left ul li:hover{
		cursor: pointer;
		background-color: rgb(218, 218, 218);
	}
	.container .row-box .col-right{
		padding: 0 0 0 30px;
	}
	.container .row-box .col-right .noRule{
		height: 600px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		font-size: 16px;
	}
</style>
