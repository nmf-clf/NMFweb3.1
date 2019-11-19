import React,{ Component } from 'react';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import { Table, Divider, Tag,Pagination } from 'antd';
import { dataSource,columns } from './data'

  
class TableData extends Component{
	
	constructor(props){
        super(props);
        console.log("表格组件this::",this.page)
	}

	componentDidMount(){
	}

	

	render(){
		const { dataSource,columns } = this.props;
		return (
            <div>
                <Table 
                    dataSource={dataSource} 
                    columns={columns}
                    pagination={false}
                    onChange={(pagination)=>{
                        console.log("表格上的分页器::",pagination)
                    }}
                />
                <Pagination
                    showSizeChanger 
                    showQuickJumper 
                    style={{float:"right",marginTop:'20px'}}
                    size="small" 
                    total={this.props.total}
                    showTotal={total => `共 ${total} 条`}
                    //current={} //当前页数
                    //defaultCurrent={1} //默认的当前页数
                    defaultPageSize={10} //默认的每页条数
                    disabled={false} //是否禁用
                    //loading={true} //页面是否加载中 未生效
                    //hideOnSinglePage={true} //只有一页时是否隐藏分页器 未生效
                    //pageSize={10} //每页条数
                    onChange={(page,pageSize)=>{ //页码改变的回调，参数是改变后的页码及每页条数
                        console.log("page+pageSize::",page,pageSize)
                        this.currentPage = page;
                        this.pageSize = pageSize;   
                        this.props.onChangePage(page,pageSize)
                    }}
                />
            </div>
		)
	}
}

export default TableData;