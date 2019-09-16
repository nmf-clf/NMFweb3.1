/*
* @Author: TomChen
* @Date:   2018-08-16 17:14:09
* @Last Modified by:   TomChen
* @Last Modified time: 2018-08-17 09:13:06
*/
import React,{ Component } from 'react';

//定义组件
//必须继承React.Component
class App extends Component{
	constructor(props) {
		super(props);
		this.state = {
			id: "myid",
			name: "myname"
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleClick = this.handleClick.bind(this);
	}
 
	handleClick(id, name, e) {
		console.log(this.state.id);
		console.log(name);
		console.log(e.target.value);
	}
 	handleChange(e){
 		console.log(e.target.value)
 	}
	render() {
		return(<div>
			<input onChange={this.handleChange} />
			<button onClick={(e) => this.handleClick(1,2,e)}>click</button>
		</div>)
	}

	//必须有一个render方法
	/*render(){
		return(
			<h1>Hello word</h1>
		)
	}*/
}

//导出组件 ==  module.exports = App
export default App;