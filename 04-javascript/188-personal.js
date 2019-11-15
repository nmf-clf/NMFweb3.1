import React, { Component } from 'react';
import { Icon, Table, Form, Input, Button, Upload, Tabs, InputNumber } from 'antd';
import './index.less';
import { connect } from 'react-redux';
import PageModal from '../../modules/pageModal/pageModal';
import NewFormula from '../../modules/NewFormula/NewFormula';
import PageModule from '../../modules/pageModule/pageModule';
import LayoutInModule from '../../modules/layoutInModule/layoutInModule';
import PopConfirm from '@/components/popConfirm';
import creatHistory from 'history/createBrowserHistory';
import InputGrid from '../../modules/inputGrid/inputGrid';
import Title from '../../modules/title/title';
import * as action from '../store/action';
import { Toast } from 'antd-mobile';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { read } from 'fs';

import {  LMZtest } from '../store/action'
import { bindActionCreators } from 'redux';

const history = creatHistory();
const TabPane = Tabs.TabPane;

// 表格假数据
const tableData = [{
  name: '富卫终身寿险附件医疗补偿',
  operation: <PopConfirm onConfirm={() => { }}>
    <Icon type="delete" />
  </PopConfirm>
}, {
  name: '富卫终身寿险附件医疗补偿',
  operation: <PopConfirm onConfirm={() => { }}>
    <Icon type="delete" />
  </PopConfirm>
}];

class GroupStep3Page extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 第二步的责任列表数据
      liabilityStep2List: [],
      // 上一次保存的数据
      liabilityObj: {},
      productObj: {},

      //L:责任层，P:产品层
      hierarchyType: 'L'
    }

    const code = this.getQueryString(this.props.location.search, 'code');
    if (code) {
      this.getData(code);
    }
    //console.log('haha::',this.refs.childComponent)


  }
  componentDidMount(){
    const {  LMZtest,_list }  = this.props;
    console.log(234,_list)
    LMZtest('niu','222222')
  }

  // 获取url参数
  getQueryString(urlSearch, name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = urlSearch.substr(1).match(reg);
    if (r != null) {
      return unescape(r[2]);
    }
    return null;
  }



  // 保存时上传的参数
  readyData = {
    productCode: '',

    // 责任层 和 产品层
    relationRateVoList: [{
      relationType: 'P',
      // 责任层或产品层code
      relationCode: '',
      // 费率循环
      attachmentFormulaVoList: [],
      riskAmountFormulaList: [{ id: '123' }]
    }]


  }

  // 责任层临时对象数据
  liabilityReadyData = {
    // 结构
    // code:{
    //   // 责任层或产品层标识
    //   relationType:'L',
    //   // 责任层或产品层code
    //   relationCode:'',
    //   // 费率循环
    //   attachmentFormulaVoList:[]
    // }


  }
  liabilityForm = {}



  getData(code, callBack) {
    this.props.tableData({
      url: '/product/getProductFormRedis?productCode=' + code,
      data: {}
    }, (res) => {
      //保存ProductCode
      this.readyData.productCode = res.productAddVo.preProductCode;
      this.readyData.relationRateVoList[0].relationCode = res.productLiabilityVo.productBusscode;

      // 判断责任列表的信息是否存在
      const step2List = res.productLiabilityVo.productLiabilityInsureCopyVoList;

      if (window.responsibilitySecondStepProductLiability) {
        this.setState({
          liabilityStep2List: step2List,
          liabilityObjList: this.getLiabilityObj(window.responsibilitySecondStepProductLiability, 'liabilityCode')
        });
      } else {
        let navList = [];
        step2List.forEach((i, n) => {
          this.getLiabilityData(i.liabilityCode, (res) => {
            navList.push(res);
            if (navList.length === step2List.length) {
              window.responsibilitySecondStepProductLiability = navList;
              this.setState({
                liabilityStep2List: step2List,
                liabilityObjList: this.getLiabilityObj(navList, 'liabilityCode')
              });
            }
          });
        });
      }

      // 放入旧数据
      const RateVo = res.productRateVo;
      if (RateVo) {

        let liabilityObj = {};
        let productObj = {}

        RateVo.relationRateVoList && RateVo.relationRateVoList.forEach((i, n) => {
          if (i.relationType === 'P') {
            productObj = i
          } else {
            liabilityObj[i.relationCode] = i
          }
          if (n === RateVo.relationRateVoList.length - 1) {
            this.setState({
              productObj,
              liabilityObj
            });
            this.liabilityReadyData = liabilityObj;
          }
        });



      }




      if (callBack) callBack();
    });
  }

  static contextTypes = {
    router: PropTypes.object
  }
  //通过子组件向父组件传值
  getReadyData = (data)=>{
     //console.log('是否拿到了？：：',data)
     //this.readyData.relationRateVoList[0].attachmentFormulaVoList = data;
     //console.log('')
  }
  // 保存数据
  saveData(data, callBack) {
    
    const {  _list }  = this.props;
    console.log(222222,_list)
    //console.log("ReadyData~~~~~~::",this.readyData)
    //console.log("保存数据data::",data)
    const data2 = data;
    //console.log("保存数据遍历数据源::",data2.relationRateVoList)
    // 删除列表内多余的数据
    data2.relationRateVoList && data2.relationRateVoList.forEach((rateVoList, rateVoListNum) => {
      //console.log("是否进入data2遍历::")
      let attachmentFormulaVoList = [];
      rateVoList.attachmentFormulaVoList && rateVoList.attachmentFormulaVoList.forEach && rateVoList.attachmentFormulaVoList.forEach((i, n) => {
        if (i.productCode !== '' && i.attachment.id) attachmentFormulaVoList.push(data2.relationRateVoList[rateVoListNum].attachmentFormulaVoList[n]);
      });
      data2.relationRateVoList[rateVoListNum].attachmentFormulaVoList = attachmentFormulaVoList;
    });

    this.props.saveData({
      url: '/product/saveProductThirdStep',
      data: { ...data }
    }, (res) => {
      if (callBack) callBack(res);
    });
  }

  // 完成配置
  saveFinish(data, callBack) {
    //console.log("完成配置::",data)
    const data2 = data;
    //console.log("完成配置遍历数据源::",data2.relationRateVoList)
    // 删除列表内多余的数据
    //debugger;
    data2.relationRateVoList.forEach((rateVoList, rateVoListNum) => {
      //console.log(rateVoList)
      let attachmentFormulaVoList = [];
      rateVoList.attachmentFormulaVoList && rateVoList.attachmentFormulaVoList.forEach && rateVoList.attachmentFormulaVoList.forEach((i, n) => {
        if (i.productCode !== '' && i.attachment.id) attachmentFormulaVoList.push(data2.relationRateVoList[rateVoListNum].attachmentFormulaVoList[n]);
      });
      data2.relationRateVoList[rateVoListNum].attachmentFormulaVoList = attachmentFormulaVoList;
    });

    this.props.saveData({
      url: '/product/saveProductAndComplete',
      data: { ...data2 }
    }, (res) => {
      if (callBack) callBack(res);
    });
  }

  getLiabilityData(code, callBack) {
    this.props.tableData({
      url: '/liability/getLiabilityByCode?liabilityCode=' + code,
      data: {}
    }, (res) => {
      if (callBack) callBack(res);
    });
  }

  // 数组转为对象
  getLiabilityObj(arr, key) {
    let newObj = {}
    arr.forEach((i, n) => {
      newObj[i[key]] = i;
    });
    return newObj
  }

  // 对象转为数组
  getLiabilityArr(obj) {
    console.log("obj::",obj)
    let data = JSON.parse(JSON.stringify(this.readyData));
    Object.keys(obj).map((k) => {
      //临时增加riskAmountFormulaList
      obj[k].riskAmountFormulaList = [{ id: '123' }];

      data.relationRateVoList.push(obj[k]);
    });
    return data
  }

  queryFormulaList = (data, callBack) => {
    this.props.selectTableData({
      url: '/formulaPool/formulaPoolFindPage',
      data: { ...data }
    }, (res) => {
      if (callBack) callBack(res);
    });
  }
  render() {
    const { messages } = this.props.intl;
    return (
      <div className='groupStep3'>

        <PageModule
          btn={[{
            content: <button
              className='grayBtn'
              onClick={() => {
                history.goBack();
              }}
            >{messages['Button.Previous']}</button>
          }, {
            content: <button
              className='yellowBtn'
              onClick={() => {

                let navErrors = null;
                // 校验数据是否输入
                for (let k in this.liabilityForm) {
                  this.liabilityForm[k].form.validateFieldsAndScroll({
                    force: true,
                    scroll: {
                      offsetTop: 200
                    }
                  }, (errors, values) => {
                    if (errors) {
                      this.setState({
                        hierarchyType: this.liabilityForm[k].hierarchyType
                      });
                      navErrors = errors;
                      return false
                    } else {
                      navErrors = null;
                    }
                  });
                  if (navErrors) return false;

                }

                // 完成配置操作
                const data = this.getLiabilityArr(this.liabilityReadyData);
                if (data && !navErrors) {
                  this.saveFinish(data, () => {
                    Toast.success(messages['ProductCenter.ConfigurationComplete'], 2);
                    setTimeout(() => {
                      this.props.history.push('/product/product/BasicProductsPage');
                    }, 1000);
                  })
                }


              }}
            >{messages['Button.CompleteConfiguration']}</button>
          }, {
            content: <button
              className='yellowBtn'
              onClick={() => {
                /* this.props.form.validateFieldsAndScroll((errors, values) => {
                  console.log("获取表单数据::",values)
                  this.props.form.validateFields((errors, values) => {
                    console.log("获取表单数据2::",values)
                  })
                }) */
                //console.log("ReadyData::",this.readyData)
                this.saveData(this.getLiabilityArr(this.liabilityReadyData), (res) => {
                  if(res){
                    Toast.success(messages['Popconfirm.SuccessfulPreservation'], 2);
                    // setTimeout(() => {
                    //   this.props.history.push('/product/product/BasicProductsPage');
                    // }, 1000);
                  }
                })
              }}
            >{messages['Button.Save']}</button>
          }]}
        >

          {/* 产品层 */}
          {
            this.readyData.productCode !== '' &&
            <Rate
              //ref="childComponent" 
              wrappedComponentRef={(ref) => {
                console.log("ref::",ref)
                this.formRef = ref;
                this.readyData.relationRateVoList[0].attachmentFormulaVoList = ref && ref.readyData;
                this.liabilityForm[this.readyData.productCode] = ref && ref.props;
              }}
              hierarchyType={'P'}
              upDate={this.props.upDate}
              code={this.readyData.productCode}
              oldData={this.state.productObj}
              queryFormulaList={this.queryFormulaList}
              getReadyData={this.getReadyData}
            />
          }

        </PageModule>


      </div>
    );
  }
}
1

const mapStateToProps = (state) => {
  return {
    _list:state.lmztest,
  }
}
// redux 绑定dispath
const mapDispatchToProps = (dispatch) => {
  return {
    LMZtest: bindActionCreators(LMZtest, dispatch)
  }
}


const GroupStep3PageForm = Form.create()(injectIntl(GroupStep3Page));
// const ggggg = connect(mapStateToProps, mapDispatchToProps)(GroupStep3PageForm)
export default connect(state => {
  const { RoleReducer } = state;
  return {
    RoleReducer
  }
}, action)(GroupStep3PageForm);
// export default connect(mapStateToProps, mapDispatchToProps)(GroupStep3PageForm)

// 费率List
class RatePrototype extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //是否存在文件
      A1fileList: [],
      A2fileList: [],
      A3fileList: [],
      A4fileList: [],

    }
    // 放入旧的文件数据
    const oldData = this.props.oldData;
    if (oldData && oldData.attachmentFormulaVoList) {
      const list = oldData.attachmentFormulaVoList;

      list.forEach((i, n) => {
        switch (i.formulaType) {
          case 'A1':
            this.setListState(1, i);
            break;
          case 'A2':
            this.setListState(2, i);
            break;
          case 'A3':
            this.setListState(3, i);
            break;
          case 'A4':
            this.setListState(4, i);
            break;
        }
      });
    }
  }

  // 设置上传过的东西
  setListState(n, i) {
    // 判断是否有已经上传过得文件
    if (i.attachment.id) {
      this.state['A' + n + 'fileList'] = [{
        uid: '-' + n,      // 文件唯一标识，建议设置为负数，防止和内部产生的 id 冲突
        name: i.attachment.newName,   // 文件名
        status: 'done', // 状态有：uploading done error removed
        url: i.attachment.path, // 下载链接额外的 HTML 属性
      }];
    }

    // 判断是否有已经上传过的公式
    if (i.costCalculateFormula.formulaExpression) {
      this.state['formulaExpression' + n] = i.costCalculateFormula.formulaExpression;
    }
    this.readyData[n - 1] = i;
  }

  columns = [{
    align: 'left',
    title: '附加险',
    dataIndex: 'name',
  }, {
    align: 'center',
    title: '操作',
    dataIndex: 'operation'
  }]

  readyData = [{
    //A1:保费费率 A2:职业加费 A3:健康加费 A4:价值费率 A5:风险保额
    formulaType: "A1",
    //产品或责任code
    productCode: this.props.code,

    // 文件数据
    attachment: {},
    //计算公式
    costCalculateFormula: {}
  }, {
    //A1:保费费率 A2:职业加费 A3:健康加费 A4:价值费率 A5:风险保额
    formulaType: "A2",
    //产品或责任code
    productCode: this.props.code,

    // 文件数据
    attachment: {},
    //计算公式
    costCalculateFormula: {}
  }, {
    //A1:保费费率 A2:职业加费 A3:健康加费 A4:价值费率 A5:风险保额
    formulaType: "A3",
    //产品或责任code
    productCode: this.props.code,

    // 文件数据
    attachment: {},
    //计算公式
    costCalculateFormula: {}
  }, {
    //A1:保费费率 A2:职业加费 A3:健康加费 A4:价值费率 A5:风险保额
    formulaType: "A4",
    //产品或责任code
    productCode: this.props.code,

    // 文件数据
    attachment: {},
    //计算公式
    costCalculateFormula: {}
  }]

  // 上传文件方法
  saveFile(file, name, callBack) {
    let param = new FormData(); //创建form对象
    param.append('file', file);
    param.append('fileType', name);
    param.append('relationCode', this.props.code);
    this.props.upDate({
      url: '/UploadAttachmentController/uploadFiles',
      data: param
    }, (res) => {
      console.log("上传成功返回的数据::",res)
      if (callBack) callBack(res);
    });
  }

  selectFormula = (type) => {
    this.state.selectType = type;
    this.formulaModal.onShow();
  }

  render() {
    const { messages } = this.props.intl;
    const { getFieldDecorator } = this.props.form;
    // 放入旧的文件数据
    const oldData = this.props.oldData;
    if (oldData && oldData.attachmentFormulaVoList) {
      const list = oldData.attachmentFormulaVoList;

      list.forEach((i, n) => {
        switch (i.formulaType) {
          case 'A1':
            this.setListState(1, i);
            break;
          case 'A2':
            this.setListState(2, i);
            break;
          case 'A3':
            this.setListState(3, i);
            break;
          case 'A4':
            this.setListState(3, i);
            break;
        }
      });
    }
    return (
      <div style={this.props.style}>

        {
          this.props.hierarchyType === 'L' ?
            <Title
              title={this.props.title}
              type='h2'
            /> : null
        }

        <LayoutInModule label={messages['ProductCenter.BasicRate']} style={{ marginBottom: '25px', marginTop: '25px' }}>
          {/* <Upload className='upFileDiv'> */}
          {/* <div className='upFileDiv'><Icon type="plus-circle" theme="filled" /><span>{messages['ProductCenter.RateFile']}</span></div> */}
          {/* </Upload> */}
          <InputGrid
            dataInModule={[{
              content: <Form.Item label={messages['ProductCenter.PremiumRate']}>
                {getFieldDecorator('fileA1', {
                  rules: [{ required: !this.state.A1fileList, message: messages['Tips.PleaseUploadBasicRate'] }]
                })(
                  <Upload
                    style={{ display: 'inline-block' }}
                    name='fileA1'
                    fileList={this.state.A1fileList}
                    defaultFileList={this.state.A1fileList}
                    onRemove={() => {
                      this.setState({
                        A1fileList: [],
                      });
                      this.readyData[0].attachment = null;
                    }}
                    beforeUpload={(file) => {
                      this.saveFile(file, 'A1', (res) => {
                        //console.log("新增团险上传返回::",res)
                        const newFile = JSON.parse(JSON.stringify(file));
                        let data = res;
                        // 传入code
                        data.relationCode = this.props.code;
                        this.readyData[0].attachment = data;
                        this.readyData[0].productCode = this.props.code;
                        this.props.getReadyData(this.readyData)
                        //console.log('我要死了::',this.readyData)
                        newFile.url = res.path;
                        //newFile.name = res.newName;
                        newFile.name = res.uploadFileName;
                        newFile.status = 'done';
                        //console.log("newFile::",newFile)
                        this.setState({
                          A1fileList: [newFile],
                        });
                        return false
                      });
                      return false
                    }}
                  >
                    <Button><Icon type="upload" /> {messages['Button.UploadFile']}</Button>
                  </Upload>
                )}
              </Form.Item>
            }, {
              content: <Form.Item label={messages['ProductCenter.FormulaConfiguration']}>
                {getFieldDecorator('formulaExpressionA1', {
                  rules: [{ required: true, message: messages['Public.PleaseInput'] + messages['ProductCenter.FormulaConfiguration'] }],
                  initialValue: this.readyData[0].costCalculateFormula.formulaExpression
                })(
                  <Input
                    onBlur={(e) => {
                      console.log("e:::",e.target.value)
                      this.readyData[0].costCalculateFormula.formulaExpression = e.target.value;
                      this.readyData[0].productCode = this.props.code;
                      this.readyData[0].formulaType = 'A1';
                      this.props.getReadyData(this.readyData)
                    }}
                  />
                )}
                <Icon type="search" onClick={() => this.selectFormula('A1')} />
              </Form.Item>
            }]}
          />
        </LayoutInModule>


        <LayoutInModule label={messages['ProductCenter.TollRate']} style={{ marginBottom: '15px' }}>
          {/* <div className='upFileDiv'>
            <div><Icon type="plus-circle" theme="filled" /><span>费率文件</span></div>
          </div> */}
          <InputGrid
            dataInModule={[{
              content: <Form.Item label={messages['ProductCenter.OccupationalFee']}>
                <Upload
                  style={{ display: 'inline-block' }}
                  name='fileA2'
                  fileList={this.state.A2fileList}
                  defaultFileList={this.state.A2fileList}
                  onRemove={() => {
                    this.setState({
                      A2fileList: [],
                    });
                    this.readyData[1].attachment = null;
                  }}
                  beforeUpload={(file) => {
                    this.saveFile(file, 'A2', (res) => {
                      const newFile = JSON.parse(JSON.stringify(file));
                      let data = res;
                      // 传入code
                      data.relationCode = this.props.relationCode;
                      this.readyData[1].attachment = data;
                      this.readyData[1].productCode = this.props.code;
                      newFile.url = res.path;
                      newFile.name = res.newName;
                      newFile.status = 'done';
                      this.setState({
                        A2fileList: [newFile],
                      });
                      return false
                    });
                  }}
                >
                  <Button><Icon type="upload" /> {messages['Button.UploadFile']}</Button>
                </Upload>
              </Form.Item>
            }, {
              content: <Form.Item label={messages['ProductCenter.FormulaConfiguration']}>
                {getFieldDecorator('formulaExpressionA2', {
                  rules: [{ required: this.state.A2fileList.length > 0, message: messages['Public.PleaseSelect'] + messages['ProductCenter.FormulaConfiguration'] }],
                  initialValue: this.readyData[1].costCalculateFormula.formulaExpression
                })(
                  <Input
                    onBlur={(e) => {
                      this.readyData[1].costCalculateFormula.formulaExpression = e.target.value;
                      this.readyData[1].productCode = this.props.code;
                      this.readyData[1].formulaType = 'A2';
                    }}
                  />
                )}
                <Icon type="search" onClick={() => this.selectFormula('A2')} />
              </Form.Item>
            }, {
              content: <Form.Item label={messages['ProductCenter.HealthFee']}>
                <Upload
                  style={{ display: 'inline-block' }}
                  name='fileA3'
                  fileList={this.state.A3fileList}
                  defaultFileList={this.state.A3fileList}
                  onRemove={() => {
                    this.setState({
                      A3fileList: [],
                    });
                    this.readyData[2].attachment = null;
                  }}
                  beforeUpload={(file) => {
                    this.saveFile(file, 'A3', (res) => {
                      const newFile = JSON.parse(JSON.stringify(file));
                      let data = res;
                      // 传入code
                      data.relationCode = this.props.relationCode;
                      this.readyData[2].attachment = data;
                      this.readyData[2].productCode = this.props.code;
                      newFile.url = res.path;
                      newFile.name = res.newName;
                      newFile.status = 'done';
                      this.setState({
                        A3fileList: [newFile],
                      });
                      return false
                    });
                    return false
                  }}
                >
                  <Button><Icon type="upload" /> {messages['Button.UploadFile']}</Button>
                </Upload>
              </Form.Item>
            }, {
              content: <Form.Item label={messages['ProductCenter.FormulaConfiguration']}>
                {getFieldDecorator('formulaExpressionA3', {
                  rules: [{ required: this.state.A3fileList.length > 0, message: messages['Public.PleaseSelect'] + messages['ProductCenter.FormulaConfiguration'] }],
                  initialValue: this.readyData[2].costCalculateFormula.formulaExpression
                })(
                  <Input
                    onBlur={(e) => {
                      this.readyData[2].costCalculateFormula.formulaExpression = e.target.value;
                      this.readyData[2].productCode = this.props.code;
                      this.readyData[2].formulaType = 'A3';
                    }}
                  />
                )}
                <Icon type="search" onClick={() => this.selectFormula('A3')} />
              </Form.Item>
            }]}
          />
        </LayoutInModule>

        <LayoutInModule label={messages['ProductCenter.ValueRate']} style={{ marginBottom: '15px' }}>
          {/* <Upload className='upFileDiv'> */}
          {/* <div><Icon type="plus-circle" theme="filled" /><span>费率文件</span></div> */}
          {/* </Upload> */}

          {/* <div className='upFileDiv'>
            <div><Icon type="plus-circle" theme="filled" /><span>费率文件</span></div>
          </div> */}

          <InputGrid
            dataInModule={[{
              content: <Form.Item label={messages['ProductCenter.ValueRate']}>
                {getFieldDecorator('fileA4', {
                  rules: [{ required: this.state.A4fileList.length > 0, message: '请上传费率文件' }],
                  initialValue: this.state.formulaExpression4
                })(
                  <Upload
                    style={{ display: 'inline-block' }}
                    name='fileA4'
                    fileList={this.state.A4fileList}
                    defaultFileList={this.state.A4fileList}
                    onRemove={() => {
                      this.setState({
                        A4fileList: [],
                      });
                      this.readyData[3].attachment = null;
                    }}
                    beforeUpload={(file) => {
                      this.saveFile(file, 'A4', (res) => {
                        const newFile = JSON.parse(JSON.stringify(file));
                        let data = res;
                        // 传入code
                        data.relationCode = this.props.code;
                        this.readyData[3].attachment = data;
                        this.readyData[3].productCode = this.props.code;
                        newFile.url = res.path;
                        newFile.name = res.newName;
                        newFile.status = 'done';
                        this.setState({
                          A4fileList: [newFile],
                        });
                        return false
                      });
                      return false
                    }}
                  >
                    <Button><Icon type="upload" /> {messages['Button.UploadFile']}</Button>
                  </Upload>
                )}
              </Form.Item>
            }, {
              content: <Form.Item label={messages['ProductCenter.FormulaConfiguration']}>
                {getFieldDecorator('formulaExpressionA4', {
                  //rules: [{ required: true, message: '请输入公式配置' }],
                  initialValue: this.readyData[3].costCalculateFormula.formulaExpression
                })(
                  <Input
                    onBlur={(e) => {
                      this.readyData[3].costCalculateFormula.formulaExpression = e.target.value;
                      this.readyData[3].productCode = this.props.code;
                      this.readyData[3].formulaType = 'A4'
                    }}
                  />
                )}
                <Icon type="search" onClick={() => this.selectFormula('A4')} />
              </Form.Item>
            }]}
          />

        </LayoutInModule>

        {/* <LayoutInModule label='风险保额' style={{ marginBottom: '50px' }}>
          <Upload className='upFileDiv'>
            <div><Icon type="plus-circle" theme="filled" /><span>风险类型</span></div>
          </Upload>
          <Table
            className='table'
            defaultExpandAllRows={true}
            pagination={false}
            dataSource={tableData}
            columns={this.columns}
            footer={() => {
              return <div><Icon type="plus-circle" theme="filled" /><span>添加规则</span></div>
            }}
          />
        </LayoutInModule> */}
        <PageModal
          ref={(ref) => { this.formulaModal = ref }}
          title='选择公式'
          onOk={() => {
            // 获得选中
            let data = this.formulaTable.selectedRows;
            if (data.length > 0) {
              let { selectType } = this.state;
              let value = data.map((d) => { return d.formulaDesc }).join(";");
              switch (selectType) {
                case "A1":
                  this.readyData[0].costCalculateFormula.formulaExpression = value;
                  this.readyData[0].productCode = this.props.code;
                  this.readyData[0].formulaType = 'A1';
                  break;
                case "A2":
                  this.readyData[1].costCalculateFormula.formulaExpression = value;
                  this.readyData[1].productCode = this.props.code;
                  this.readyData[1].formulaType = 'A2';
                  break;
                case "A3":
                  this.readyData[2].costCalculateFormula.formulaExpression = value;
                  this.readyData[2].productCode = this.props.code;
                  this.readyData[2].formulaType = 'A3';
                  break;
                case "A4":
                  this.readyData[3].costCalculateFormula.formulaExpression = value;
                  this.readyData[3].productCode = this.props.code;
                  this.readyData[3].formulaType = 'A4';
                  break;
              }
            }
            this.formulaModal.onHide();
            this.setState({});
          }}
        >
          <NewFormula
            ref={(ref) => { this.formulaTable = ref }}
            getProductList={this.props.queryFormulaList}
          />
        </PageModal>
      </div>
    )
  }



}
const Rate = Form.create()(injectIntl(RatePrototype));


