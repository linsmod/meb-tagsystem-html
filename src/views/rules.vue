<template>
	<div class="container">
		<a-row class="row-box">
      		<a-col :span="5" class="col-left">
				<ul>
					<li>规则<a-button type="primary" class="button" @click="addRule">添加规则</a-button></li>
					<li v-for="(item,index) in rules" :key="index" @click="changeTab(index)" :class="isActive==index+1?'active':''">{{item}}<a-icon type="right" class="icon"/></li>
				</ul>
			</a-col>
			<a-col :span="19" class="col-right"><RulesDetail :index="isActive" :length="rules.length"></RulesDetail></a-col>
		</a-row>
	</div>
</template>

<script>
import RulesDetail from './rulesDetail'
export default {
	components:{
		RulesDetail
	},
	data() {
		return {
			rules:['规则1','规则2','规则3','规则4','规则5','规则6','规则7','规则8','规则9'],
			isActive:1,
		};
	},
	methods:{
		/** 添加规则 */
		addRule(){
			this.isActive = 0;
			this.rules.push('规则'+(this.rules.length+1));
		},
		/** 切换规则 */
		changeTab(index){
			this.isActive = index+1;
		},

	}
};
</script>

<style>
	.container .row-box .col-left{
		overflow: auto;
		max-height: 800px;
	}
	.container .row-box .col-left ul li{
		list-style: none;
		padding: 0 0 0 15px;
		height: 50px;
		border-left: 1px solid rgba(179, 176, 176, 0.459);
		border-bottom: 1px solid rgba(179, 176, 176, 0.459);
		border-right: 1px solid rgba(179, 176, 176, 0.459);
		line-height: 50px;
	}
	.active{
		background-color: rgb(223, 219, 219);
	}
	.container .row-box .col-left ul li .button,.container .row-box .col-left ul li .icon{
		float: right;
		margin: 10px 10px 0 0;
	}
	.container .row-box .col-left ul li:first-child{
		background-color: rgb(223, 219, 219);
	}
	.container .row-box .col-left ul li:hover{
		cursor: pointer;
		background-color: rgb(236, 236, 236);
	}
	.container .row-box .col-right{
		padding: 0 0 0 30px;
	}
</style>
