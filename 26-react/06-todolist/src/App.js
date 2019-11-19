import React,{ Component } from 'react';

import Item from './Item';
import TableData from './table';
import { columns,total } from './data'
import Test from './Test';

import axios from 'axios';

//引入css
import './App.css';

//定义组件
//必须继承React.Component
class App extends Component{
	
	constructor(props){
		super(props);
		//初始化state,state代表当前页面中的数据
		this.state = {
			value :'',
			list:['aa'],
			ShowData:[],
			dataSource:[]
		}
		this.handleChange = this.handleChange.bind(this);
		this.handleAdd = this.handleAdd.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
		console.log('App constructor....');
		//this.getData(1,10)
	}
	getData(page,pageSize){
		const { dataSource } = this.state;
		console.log("page啊啊啊啊::",page,pageSize)
		console.log(dataSource.length)
		//data, //当前页展示数据，数组
        //page, //当前页码
        //pageSize, //每页最多显示条数
		//length, //总的数据条数
		const length = dataSource.length;
		//console.log('原数组总长度::',length)
		let newData = []; 
		if( pageSize >= length ){ //如果pageSize大于总数据条数，则只展示一页
			newData = dataSource;
			page = 1;
		}else{ //pageSize小于总的数据长度，则展示多页，需要分页
			const num = pageSize * (page - 1);//计算当前页（不含）之前的所有数据总条数
			if( num < length ){ //如果当前页之前所有数据总条数小于（不能等于）总的数据集长度，则说明当前页码没有超出最大页码
				const startIndex = num;//当前页第一条数据在总数据集中的索引
				//console.log("startIndex::",startIndex)
				const endIndex = num + pageSize - 1;//当前页最后一条数据索引
				//console.log("endIndex::",endIndex)
				//当前页数据条数小于每页最大条数时，也按最大条数范围筛取数据
				newData = dataSource.filter((_, index) => index >= startIndex && index <= endIndex);
				console.log("嘿嘿嘿嘿嘿::",newData)
			}else{ //当前页码超出最大页码，则计算实际最后一页的page，自动返回最后一页数据
				const size = parseInt(length / pageSize); //取商
				const rest = length % pageSize; //取余数
				if (rest > 0) { //余数大于0，说明实际最后一页数据不足pageSize，应该取size+1为最后一条的页码
					page = size + 1;//当前页码重置，取size+1
					newData = dataSource.filter((_, index) => index >= (pageSize * size) && index <= length);
				}else if( rest === 0 ){ //余数等于0，最后一页数据条数正好是pageSize
					page = size;//当前页码重置，取size
					newData = dataSource.filter((_, index) => index >= (pageSize * (size - 1)) && index <= length);
				} //注：余数不可能小于0a
			}
		}
		console.log("呼呼呼::",newData)
		this.setState({
			ShowData:newData,
			total:total
		},()=>{
			console.log("拿到了吗222??",this.state.ShowData)
		})
		console.log("拿到了吗？？",this.state.ShowData)
		//return newData;
	}
	/*
	static getDerivedStateFromProps(nextProps, prevState){
		console.log('App getDerivedStateFromProps',nextProps, prevState)
	
		return {
			list:['bb','cc']
		}
	
		if(prevState.value == 1){
			return {
				list:['111']
			}			
		}else{
			return {
				list:['bb','cc']
			}			
		}
	}
	*/
	/*
	shouldComponentUpdate(nextProps, nextState){
		console.log('App shouldComponentUpdate',nextProps, nextState)
		return true;
	}
	getSnapshotBeforeUpdate(prevProps, prevState){
		console.log('App getSnapshotBeforeUpdate',prevProps, prevState)
		return 111;
	}
	componentDidUpdate(prevProps, prevState,snapshot){
		console.log('App componentDidUpdate',prevProps, prevState,snapshot)
	}
	componentDidMount(){
		console.log('App componentDidMount')
	}
	*/
	componentDidMount(){
		//发送ajax请求
		axios
		.get('http://127.0.0.1:3000/api/getData',{
			params:{
				'ID':'123456'
			}
		})
		.then((data)=>{
			console.log('data::',data);
			// this.setState({
			// 	list:data.data
			// })
			this.setState({
				dataSource:data.data
			},()=>{
				this.getData(1,10)
			})
		})
		.catch((e)=>{
			console.log('err:::',e);
		})
		//this.getData(1,10)
		console.log(777777)
	}
	/* componentWillMount(){
		this.mounted = true;
		//this.getData(1,10);
	}
	
	componentWillUnmount() {
		this.mounted = false;
	} */
	handleAdd(){
		// setState方法是一个异步方法
		this.setState((preState)=>({
			list:[...preState.list,preState.value],
			value:''
		}),()=>{
			console.log(this.ul.querySelectorAll('li'))
		});
		
	}
	handleChange(e){
		// console.log(this.input)
		// const value = e.target.value;
		const value = this.input.value;
		this.setState((preState)=>({
			value
		}));

	}

	handleDelete(index){

		this.setState((preState)=>{
			const list = [...preState.list];
			list.splice(index,1)
			return {
				list
			}			
		})	
	}
	getItems(){
		return	this.state.list.map((item,index)=>{
					return(
						<Item 
							key={index} 
							content={item} 
							index={index}
							handleDelete={this.handleDelete}
						/>	
					)
				})
	}
	/* showTotal(total) {
		return `Total ${total} items`;
	  } */
	//必须有一个render方法
	//JSX语法
	render(){
		console.log('App render...')
		const { ShowData } = this.state;
		//const ShowData2 = this.getData(1);
		//console.log("return的data::",ShowData2)
		//return 只能返回一个
		return(
			<div className="App">
				{/* <input 
					value={this.state.value} 
					onChange={this.handleChange} 
					ref={(input)=>{
						// console.log(input)
						this.input = input
					}}
				/>
				<button onClick={this.handleAdd}>新增</button>
				<ul ref={(ul)=>{this.ul = ul}}>
					{
						this.getItems()
					}
				</ul> */}
				<TableData 
					dataSource={ShowData}
					columns={columns}
					total={this.state.total}
					onChangePage={(page,pageSize)=>{
						this.getData(page,pageSize)
					}}
				/>
			</div>				
		)
	}
}
//导出组件 ==  module.exports = App
export default App;