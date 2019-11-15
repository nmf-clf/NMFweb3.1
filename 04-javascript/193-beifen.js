import React, { Component } from 'react';
import { Select, DatePicker, Icon, Form, Input, Radio, InputNumber, message } from 'antd'
import { connect } from 'react-redux';
import moment from 'moment';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Toast } from 'antd-mobile';
import { validateCharacter, validateCharacter2 } from '@/utils/validateCharacter';
import creatHistory from 'history/createBrowserHistory';

import * as action from '../store/action';
import PageModule from '../../modules/pageModule/pageModule';
import PageModal from '../../modules/pageModal/pageModal';
import InputGrid from '../../modules/inputGrid/inputGrid';
import Title from '../../modules/title/title';
import API from '@/api/network';
import RuleTable from './table/ruleTable';
import AddFeeTable from "./table/addFeeTable"
import EarningTable from "./table/earningTable"
import TermTable from "./table/termTable"
import PremPayTable from "./table/premPayTable"
import Formula from "./formula"
import RuleFormula from "./formul_1"

import SelectProduct from "./selectProduct"
import SelectTree from "./selectTree"
import IndexDemo from "./index_1"
import FormulaModal from './FormulaModal';

import { getObjectByProps } from '@/utils/common'


import {
    requestJson,
    requestPremPay,
    requestEarning,
    requestAddfee,
    requestTerm,
    requestFile,
    requestExemptions
} from './requestJson';
import {
    PRODUCT_TYPE_INSURE,
    ALLOW_AGE_UNIT,
    SALES_STATE,
    PRODUCT_NATURE,
    PRODUCT_STATE,
    REFUSE_GENDER,
    REFUSE_SOCIAL,
    TIME_RISK_MARK,
    JOB_CATEGORY_ENGLISH
} from '@/components/data';

import './index.less';
import PopConfirm from '@/components/popConfirm';

const { Option } = Select;
const history = creatHistory();

class AddBasicProducts extends Component {
    constructor(props) {
        super(props)
        this.state = {
            formulaDataList: [],// 所有带有公式弹出层的数据集合
            data: [],
            productAttributeData: "",// 险种属性
            saleChannelData: "",//销售渠道
            categoryData: "",// 险种分类
            underwriting_type: "", // 核保类型
            refuseJob: null,// 拒保职业
            showFormula: false, // 公式
            dataIndexFormula: "",
            backShowData: ["isBack", "birthdayback", "appointBack", "backDay"], // 是否显示可回溯
            renewalShowData: ["payment_term_type", "renewable_age", "companyCodlowe", "compqanyCode"], // 续保
            immunityData: ["isExemptions", "exemptionsType", "exemptions"],// 是否显示豁免
            foreheadShowData: ["tolerance", "premiumAddType", "premium", "minPremiumLimit", "maxPremiumLimit"],
            PremiumShowData: ["premiums", "minPremium", "maxPremium"], //保费
            istolerance: true,
            ispremiumAddType: true,
            isminPremiumLimit: true,
            ismaxPremiumLimit: true,
            _backDay: false,
            _isExemptions: false,
            _saleStateMark: false
        }
        //console.log("state::", this.state)
    }

    componentDidMount() {
        this.findByCodes()
        this.language = sessionStorage.getItem('language') ? sessionStorage.getItem('language') : 'zh_CN'
        const productId = this.getQueryString(this.props.location.search, 'productId');
        if (productId) this.getData(productId)
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.language !== this.props.MenuReducer.language) {
            this.language = this.props.MenuReducer.language;
            this.findByCodes()
        }
    }

    // 获取详情 回显
    getData(productId) {

        API.postNetwork(`/product/initProductInfo?productCode=${productId}`).then(result => {
            //console.log('result::', result)
            if (result && result.code === '000') {
                const codeData = result.data.productRateVo.relationRateVoList[0].attachmentFormulaVoList
                console.log('codeData::', codeData)
                let baofei = "", xianjinjiazhi = "", baofeiinitial = "", xianjinjiazhiinitial = "", minPremium = "",
                    maxPremium = "";
                result.data.formulaMapList && result.data.formulaMapList.forEach(item => {
                    if (item[0].key === "minPremium") minPremium = item[0].formulaPool.formula
                    if (item[0].key === "maxPremium") maxPremium = item[0].formulaPool.formula
                    if (item[0].key === "baofei") baofeiinitial = item[0].formulaPool.formula
                    if (item[0].key === "xianjinjiazhi") xianjinjiazhiinitial = item[0].formulaPool.formula
                })
                codeData.forEach(item => {
                    if (item.formulaType === "A1") {
                        baofeiinitial = item.costCalculateFormula.formulaExpression
                    }
                    if (item.formulaType === "A4") {
                        xianjinjiazhiinitial = item.costCalculateFormula.formulaExpression
                    }
                })

                // 豁免险种回显
                const productAttrList = result.data.productAddVo.productAttrVo.productAttrList

                if (productAttrList) {
                    productAttrList.forEach(item => {
                        if (item.attributeCode === "exemptions") {
                            const data = JSON.parse(item.attributeValue)
                            let checkedexemptions = []
                            data.forEach((item, index) => {
                                checkedexemptions.push({
                                    attributeCode: item.businessCode,
                                    attributeName: item.productName,
                                    productType: item.productType,
                                })
                            })
                            this.setState({ checkedexemptions })
                        }
                    })
                }
                let formulaDataList = result.data.formulaMapList// 回显 所有的公式弹出层
                this.setState({
                    formulaDataList,
                    codeData: result.data,
                    baofei,
                    xianjinjiazhi,
                    xianjinjiazhiinitial,
                    baofeiinitial,
                    minPremium,
                    maxPremium
                })
            } else {
            }
        })
    }


    getQueryString(urlSearch, name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        var r = urlSearch.substr(1).match(reg);
        if (r != null) {
            return unescape(r[2]);
        }
        return null;
    }

    // 查询数据字典
    findByCodes(details) {
        // 公式弹出框  因子弹出框 搜索
        let urlaa = `/dictionary/code/findFoolByCodes?codes=factorObject`
        API.postNetwork(urlaa, {}).then(result => {
            if (result && result.code === '000' && result.data) {
                let factorObject = result.data.factorObject //
                this.setState({ factorObject })
            } else {
                //console.log(result.message);
            }
        })

        let url = `/dictionary/code/findByCodes?codes=formulaType,typesOfImmunity,productAttribute,saleChannel,refuse_job,underwriting_type,salesMethods,feeIncreaseType,payment_year,payment_type,policy_year,prompt_pool`
        API.postNetwork(url, {}).then(result => {
            if (result && result.code === '000' && result.data) {
                let saleChannelData = result.data.saleChannel // 销售渠道
                let productAttributeData = result.data.productAttribute // 险种属性
                let refuse_jobData = result.data.refuse_job // 拒保职业等级
                let underwriting_type = result.data.underwriting_type // 核保类型
                let salesMethods = result.data.salesMethods // 销售方式
                let typesOfImmunity = result.data.typesOfImmunity // 豁免类型
                let feeIncreaseType = result.data.feeIncreaseType // 加费类型
                let payment_year = result.data.payment_year // 缴费年限
                let payment_type = result.data.payment_type // 期缴方式
                let policy_year = result.data.policy_year // 保障期限
                // let categoryData = result.data.business_plan_category // 险种分类
                // let factorObject = result.data.factorObject //
                let formulaObject = result.data.formulaType //
                let prompt_pool = result.data.prompt_pool


                this.setState({
                    // categoryData,
                    typesOfImmunity,
                    saleChannelData,
                    productAttributeData,
                    refuse_jobData,
                    underwriting_type,
                    salesMethods,
                    feeIncreaseType,
                    payment_year,
                    payment_type,
                    policy_year,
                    // factorObject,
                    formulaObject,
                    prompt_pool
                })
            } else {
                //console.log(result.message);
            }
        })
        //11.2--17.02--category修改为riskcategory
        let diffurl = `/dictionary/code/findDictionaryAllChildByCodes?codes=incomeType,bonus_payment,nfo,feeIncreaseWays,riskcategory`
        API.postNetwork(diffurl, {}).then(result => {
            if (result && result.code === '000' && result.data) {
                let categoryData = result.data.riskcategory // 险种分类 11.2--17.02--category修改为riskcategory
                let incomeTypeData = result.data.incomeType
                let nfoData = result.data.nfo
                let bonus_payment = result.data.bonus_payment
                let feeIncreaseWays = result.data.feeIncreaseWays // 加费方式字典值
                this.setState({ incomeTypeData, bonus_payment, nfoData, categoryData, feeIncreaseWays })
            } else {
                //console.log(result.message);
            }
        })
        // 查询拒保职业
        API.postNetwork("/jobinfo/findJobinfoAll", {}).then(result => {
            if (result && result.code === '000') {
                let array = []
                result.data.forEach(item => {
                    if (!item.parentCode) array.push({ value: item.jobCodeSingle, title: item.jobName })
                    item.title = item.jobName
                    item.value = item.jobCodeSingle
                    item.children = item.list
                    item.children.forEach(data => {
                        data.title = data.jobName
                        data.value = data.jobCodeSingle
                        data.children = data.list
                        data.children.forEach(json => {
                            json.title = json.jobName
                            json.value = json.jobCodeSingle
                        })
                    })
                })
                this.setState({ refuseJob: result.data })
            } else {
                //console.log(result.message);
            }
        })
        // 查询豁免险产品列表
        let obj = {
            current: 1,
            pageSize: 99999,
            t: {
                productNature: 'P',
                isExemptions: "1"
            }
        }

        API.postNetwork("/product/getProductList", obj).then(result => {
            if (result && result.code === '000') {
                this.setState({ exemptionsData: result.data.records })
            } else {
                //console.log(result.message);
            }
        })
        API.postNetwork("/factorPool/factorPoolFindPage", { current: 1, pageSize: 99999, }).then(result => {
            if (result && result.code === '000') {
                this.setState({ factorPoolFind: result.data.records })
            } else {
                //console.log(result.message);
            }
        })
    }

    // 打开公式
    openProduct = (dataIndexFormula, fileType, id) => {
        const { form } = this.props;
        const formulaValue = form.getFieldValue(dataIndexFormula)
        //console.log("formulaValue--,", formulaValue)
        this.setState({ formulaValue, dataIndexFormula, fileType, formulaId: id }, () => {
            this.formulaModal.showF(dataIndexFormula) // 打开公式弹出层
        })
    }

    // 打开 规则公式
    openRuleProduct = (dataIndexFormula, code) => {
        //console.log("code-->", code)
        const { form } = this.props;
        const formulaValue = form.getFieldValue(dataIndexFormula)
        this.setState({ formulaValue, ruleFormulaCode: code }, () => {
            this.setState({ showRuleFormula: true, dataIndexFormula })
        })
    }

    // 选择可豁免产品
    selectProduct() {
        this.newAttribute.onShow();
    }

    // 条件渲染
    validation = (data) => {
        const { saleStateMark, isBack, isPayable, exemptionsType, isExemptions, productAttribute, timeRiskMark, productType, productCategory, productCategorySecond, premiumAddType } = data;
        //console.log("isBack::",isBack)
        //console.log("isExemptions::",isExemptions)
        // 险种属性 // 长短险类型 // 主附类型
        let json = {
            isSaleStateMark: false,
            isExemptions: "",
            isbackShowData: "",
            renewalShowData: "",
            foreheadShowData: "",
            PremiumShowData: "", //保费
            isPaymentYearRule: true,
            issaleEndTime: true, // 为true 禁用停售日期
            isDisabledEndTime: false
        }
        // 当险种不为附加险时   缴费年限规则
        if (productType == "1" && (exemptionsType != "PB" && exemptionsType != "jointPB")) {
            json.isPaymentYearRule = false
        }

        // 附加险，长险，投连、万能	  --是否可回溯 生日回溯 指定日期回溯 NFO

        // if ((productAttribute === "investmentLinked" || productAttribute === "universal") && timeRiskMark === "L" && productType == "1") {
        //   json.isbackShowData = []
        // }
        // 附加险，短险，投连、万能	  --是否可回溯 生日回溯 指定日期回溯
        // if ((productAttribute === "investmentLinked" || productAttribute === "universal") && timeRiskMark === "S" && productType == "1") {
        //   json.isbackShowData = []
        // }
        // 主险，长险，投连、万能     --是否为豁免产品 可豁免产品清单 是否为jointPB 是否可回溯 生日回溯 指定日期回溯 NFO
        // if ((productAttribute === "investmentLinked" || productAttribute === "universal") && timeRiskMark === "L" && productType == "0") {
        //   // json.isbackShowData = []
        // }
        // 当险种分类为“人寿 - 终身寿险”或“年金 - 养老年金”时
        // if ((productCategory === "CFLI" && productCategorySecond === "CSAL") || (productCategory === "CFAN" && productCategorySecond === "CSPA")) {
        //   json.renewalShowData = []
        // }
        // 销售方式
        // if (premiumAddType == "1") {
        //     json.foreheadShowData = ["premiumAddType", "maxPolicyNum", "singleCoverage",]
        // }
        // 险种类型为主险  如是否可豁免为否  则 后面两个不能选(可以选择空)
        // 险种类型为附加险 为否都可以选   是-后面两个不能选(可以选择空)
        if (productType === "0") {
            json.exemptionsType = true
        } else if (productType === "1" && isExemptions === "1") {
            json.exemptionsType = true
        } else if (productType === "1" && isExemptions === "0" && exemptionsType === "null") {
            json.exemptions = true
        }

        // 是否续保选择否 禁用后面
        if (isPayable === "0") {
            json.isisPayable = true
        }
        // 是否回溯选择否 禁用后面
        if (isBack === "0") {
            json.isBack = true
        }
        // 是否豁免选择否 禁用后面
        if (isExemptions === "0") {
            json.isExemptions = true
        }
        if (saleStateMark === "1") {
            json.issaleEndTime = false
        }
        // 产品状态若为待售不校验比录字段	 
        if (saleStateMark === "0" || saleStateMark === "2") {
            json.isSaleStateMark = true
        }
        // 状态若为在售或者待售 0待售 1在售 2停售
        if(saleStateMark === "0" || saleStateMark === "1"){
            json.isDisabledEndTime = true
        }
        return json
    }

    saveData(data, callBack) {
        //console.log('保存的data::',data)
        this.props.saveData({
            url: '/product/complete',
            data: { ...data }
        }, (res) => {
            if (callBack) callBack(res);
        });
    }

    getReadyData(values) {
        //console.log('getReadyData-values::',values)
        const { codeData, refuseJob, formulaDataList,categoryData } = this.state;
        let json = requestJson(values)
        if (codeData) {
            json.productAddVo.productAttrVo.id = codeData.productAddVo.productAttrVo.id
            json.productAddVo.productAttrVo.businessCode = codeData.productAddVo.productAttrVo.businessCode
            json.productAddVo.productInsureVo.id = codeData.productAddVo.productAttrVo.id
        }
        //拒保职业等级 入参改变 2019/11/8
        let jobCategory = json.productAddVo.productAttrVo.productCategory //选中的险种分类一级
        categoryData && categoryData.map((item,index)=>{
            if(item.code == jobCategory){
                Object.keys(JOB_CATEGORY_ENGLISH).map((key,i)=>{
                    if(key == jobCategory){
                        if(jobCategory == "14000"){
                            json.productAddVo.mapJob = null;
                        }else{
                            json.productAddVo.mapJob[JOB_CATEGORY_ENGLISH[key]] = values.refuseJobLevel && values.refuseJobLevel.join().split(',')
                        }
                    }
                })
            }
        })

        json.formulaMapList = formulaDataList // 所有带有公式弹出层的数据集合 


        const premPayData = this.renderPremPayTable.getData() // 获取保费 缴费 列表数据
        //.log("premPayData:::", premPayData)
        const addFee = this.renderAddFeeTable.getData()       // 获取加费 列表数据
        //console.log('addFee::', addFee)
        const earning = this.renderEarningTable.getData()     // 获取收益 列表数据
        const term = this.renderTermTable.getData()           // 获取条款 列表数据
        const rule = this.renderRuleTable.getData()           // 获取规则 列表数据

        if (values.jobCode) {
            let arr = []
            values.jobCode.forEach(json => {  // 选中的数
                refuseJob.forEach(item => {  // 数据第一层
                    // console.log(item)
                    if (item.jobCodeSingle === json) {
                        if (item.list && item.list.length > 0) {
                            item.list.forEach(record => {  // 数据第二层
                                if (record.list && record.list.length > 0) {
                                    record.list.forEach(infoMation => {
                                        arr.push(infoMation.jobCodeSingle)
                                    })
                                } else {
                                    arr.push(record.jobCodeSingle)
                                }
                            })
                        } else {
                            arr.push(item.jobCodeSingle)
                        }
                    } else {
                        item.list.forEach(record => {
                            if (record.jobCodeSingle === json) {  // 数据第二层
                                if (record.list && record.list.length > 0) {
                                    record.list.forEach(infoMation => {
                                        arr.push(infoMation.jobCodeSingle)
                                    })
                                } else {
                                    arr.push(record.jobCodeSingle)
                                }
                            } else {
                                record.list && record.list.forEach(infoMation => {
                                    if (infoMation.jobCodeSingle === json) {
                                        arr.push(json)
                                    }
                                })
                            }
                        })
                    }
                })
            })
            arr.forEach(item => {
                json.productAddVo.refuseJobList.push({ jobCode: item })
            })
        }
        // console.log("premPayData-->", premPayData);
        let muilt = [], category = [], random = []
        if (premPayData && premPayData.length > 0) {
            premPayData.forEach((item, index) => {
                const data = requestPremPay(item, index, values)// 获取保障期限   请求报文
                if (item.saleChannelPrem.length > 0) {
                    data.constraintAttribute.push({
                        "factor": "saleChannel",
                        "operator": "SCTS",
                        "value1": item.saleChannelPrem ? item.saleChannelPrem.join() : "",
                        "value2": "",
                        "value3": "",
                        "value4": ""
                    })

                    if (category.indexOf(item.category) < 0)
                        category.push(item.category)
                }

                muilt.push(data)
                random.push(item.id)
            })
            const item = {
                "attributeType": "BA",
                "attributeCode": "muilt",
                "attributeValue": JSON.stringify(muilt),
            }
            const _item = {
                "attributeType": "BA",
                "attributeCode": "category",
                "attributeValue": JSON.stringify(category.join(',')),
            }
            const randomItem = {
                "attributeType": "BA",
                "attributeCode": "random",
                "attributeValue": JSON.stringify(random),
            }
            json.productAddVo.productAttrVo.productAttrList.push(item);
            json.productAddVo.productAttrVo.productAttrList.push(_item);
            json.productAddVo.productAttrVo.productAttrList.push(randomItem);
        }
        const exemptions = this.state.checkedexemptions // 可豁免产品
        let jsonExemptions = [];
        if (exemptions && exemptions.length > 0) {
            exemptions.forEach((item, index) => {
                const data = requestExemptions(item, index, values)
                jsonExemptions.push(data)
            })
            const item = {
                "attributeType": "BA",
                "attributeCode": "exemptions",
                "attributeValue": JSON.stringify(jsonExemptions)
            }
            json.productAddVo.productAttrVo.productAttrList.push(item)
        }
        if (values.category) { // :LA大类
            const item = {
                "attributeType": "BA",
                "attributeCode": "category",
                "attributeValue": values.category, // :LA大类
            }
            json.productAddVo.productAttrVo.productAttrList.push(item)
        }
        if (values.paymentYearRule) {// 缴费年限规则
            const item = {
                "attributeType": "BA",
                "attributeCode": "paymentYearRule",
                "attributeValue": values.paymentYearRule, // 缴费年限规则
            }
            json.productAddVo.productAttrVo.productAttrList.push(item)
        }
        earning.forEach((item, index) => {
            const data = requestEarning(item, index, values)  // 获取收益   请求报文
            json.productAddVo.productIncometypes.push(data)
        })

        // console.log("term", json.productRateVo.relationRateVoList[0].attachmentFormulaVoList)
        term.forEach((item, index) => {
            const data = requestTerm(item, index, values)  // 获取条款 请求报文
            json.productAddVo.productClauseVoList.push(data)
        })

        rule.forEach((item, index) => {
            json.productAddVo.droolsRules.push({
                "ruleSentence": item.ruleSentence,
                "msgCode": item.code
            })
        })

        console.log(json.formulaMapList)
        let isAddbaofei = false, isAddxianjinjiazhi = false, addfeeTable1 = false, addfeeTable2 = false
        if (json.formulaMapList && json.formulaMapList.forEach) {
            json.formulaMapList.forEach(item => {
                addFee.forEach((jjj, index) => {
                    if (item[0].key === `addfeeTable${jjj.id}`) {
                        if (item[0].formulaVariablelist && item[0].formulaVariablelist.forEach) {
                            item[0].formulaVariablelist.forEach(sourceData => {
                                if (sourceData.fillera === "0") {
                                    if (index === 0) {
                                        addfeeTable1 = true
                                    } else {
                                        addfeeTable2 = true
                                    }
                                    const data = requestAddfee(jjj, sourceData.fillercDetail, values)  // 获取加费 请求报文
                                    json.productRateVo.relationRateVoList[0].attachmentFormulaVoList.push(data);
                                }
                            })
                        }
                    }
                })

                if (item[0].key === "baofei") {
                    if (item[0].formulaVariablelist && item[0].formulaVariablelist.forEach) {
                        item[0].formulaVariablelist.forEach(sourceData => {
                            if (sourceData.fillera === "0") {
                                isAddbaofei = true
                                const baofei = requestFile(values, sourceData.fillercDetail, "baofei", "A1")
                                json.productRateVo.relationRateVoList[0].attachmentFormulaVoList.push(baofei)
                            }
                        })
                    }
                }
                if (item[0].key === "xianjinjiazhi") {
                    if (item[0].formulaVariablelist && item[0].formulaVariablelist.forEach) {
                        item[0].formulaVariablelist.forEach(sourceData => {
                            if (sourceData.fillera === "0") {
                                isAddxianjinjiazhi = true
                                const baofei = requestFile(values, sourceData.fillercDetail, "xianjinjiazhi", "A4")
                                json.productRateVo.relationRateVoList[0].attachmentFormulaVoList.push(baofei)
                            }
                        })
                    }
                }
            })
        }

        // console.log("addFee", addFefactorObjecte)

        addFee.forEach((item, index) => {
            if (index === 0 && addfeeTable1) return;
            if (index === 1 && addfeeTable2) return;
            const file = this.state[`addfeeTable${item.id}`] || {}
            const data = requestAddfee(item, file, values)  // 获取加费 请求报文
            // console.log('index-addfee-data::', data)
            json.productRateVo.relationRateVoList[0].attachmentFormulaVoList.push(data);
        })

        if (values.baofei && !isAddbaofei) { // requestFile 计算 保费
            const baofei = requestFile(values, this.state.baofei, "baofei", "A1")
            json.productRateVo.relationRateVoList[0].attachmentFormulaVoList.push(baofei)
        }

        if (values.xianjinjiazhi && !isAddxianjinjiazhi) {  // requestFile 计算 现金价值
            const xianjinjiazhi = requestFile(values, this.state.xianjinjiazhi, "xianjinjiazhi", "A4")
            json.productRateVo.relationRateVoList[0].attachmentFormulaVoList.push(xianjinjiazhi)
            json.productAddVo.productAttrVo.isCashValue = "1"
        }
        return json
    }

    disabledStartDate = startValue => {
        const { getFieldValue } = this.props.form;
        const endValue = getFieldValue("saleEndTime")
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    };

    disabledEndDate = endValue => {
        const { getFieldValue } = this.props.form;
        const startValue = getFieldValue("saleBeginTime")

        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
    };

    onSetState = (id, file, name) => {
        this.setState({ [`${name}${id}`]: file })
    }

    // 获取公式弹窗的数据
    saveOrUpdate = (values, dataIndexFormula) => {
        console.log("第一层 首页获取公式数据--》", values, dataIndexFormula);
        const { setFieldsValue } = this.props.form;
        const addFee = this.renderAddFeeTable.getData();

        let { formulaDataList } = this.state;
        formulaDataList = formulaDataList || []
        if (formulaDataList.length > 0) {
            let one = true;
            formulaDataList.forEach((item, index) => {
                if (item && item[0].key === dataIndexFormula) {
                    one = false
                    formulaDataList[index] = values
                }
            })
            if (one) formulaDataList.push(values)
        } else {
            formulaDataList.push(values)
        }
        // if (addFee && addFee.length) {
        //     addFee.map((afItem, index) => {
        //         let type = afItem.feeIncreaseType == 'A2' ? 'feeIncreaseRule' : 'addfeeRule';
        //         formulaDataList.map((forItem) => {
        //             let obj = getObjectByProps(forItem, 'key', type);
        //             if (obj && obj.formulaVariablelist[0].fillercDetail.attachment) {
        //                 obj.formulaVariablelist[0].fillercDetail.attachment.formulaWays = afItem.addfeeType;
        //             }
        //         })
        //     });
        // }
        setFieldsValue({ [`${dataIndexFormula}`]: values[0].formulaPool.formula })
        this.setState({ dataIndexFormula: "", fileType: "", })

        console.log("// 所有带有公式弹出层的数据集合---->", formulaDataList)
        this.setState({ formulaDataList })// 所有带有公式弹出层的数据集合

    }

    render() {
        const { getFieldDecorator, getFieldsValue, getFieldValue, setFieldsValue } = this.props.form;
        const {
            codeData, saleChannelData, productAttributeData, categoryData, refuse_jobData, underwriting_type,
            salesMethods, typesOfImmunity, backShowData, renewalShowData, foreheadShowData, PremiumShowData, immunityData, refuseJob, nfoData,
            feeIncreaseType, payment_year, payment_type, policy_year, dataIndexFormula, prompt_pool, checkedexemptions
        } = this.state;
        let showData = this.validation(getFieldsValue())
        // 拒保职业 回显
        let refuseJobList = "";
        if (getFieldValue("jobCode")) {
            refuseJobList = getFieldValue("jobCode")
        } else if (codeData && codeData.productAddVo.refuseJobList) {
            refuseJobList = []
            codeData.productAddVo.refuseJobList.forEach(item => {
                refuseJobList.push(item.jobCode)
            })
        }
        const initialforeheadShowData = showData.foreheadShowData || foreheadShowData
        const initialisbackShowData = showData.isbackShowData || backShowData // 回溯模块
        const initialPremiumShowData = showData.PremiumShowData || PremiumShowData
        let initialcategory = "", initialpaymentYearRule = "";
        let obj = {};
        let backComponent = {}; // 回溯模块
        foreheadShowData.forEach(item => {
            obj[item] = true
        })
        initialisbackShowData.forEach(item => {
            backComponent[item] = true
        })
        if (codeData) {
            codeData.productAddVo.productAttrVo.productAttrList.forEach(item => {
                if (item.attributeCode === "category") {
                    initialcategory = item.attributeValue
                }
                if (item.attributeCode === "paymentYearRule") {
                    initialpaymentYearRule = item.attributeValue
                }
            })
        }

        // 公式
        // let formulaData = ""
        // if (dataIndexFormula === "xianjinjiazhi") formulaData = this.state.xianjinjiazhi
        // if (dataIndexFormula === "baofei") formulaData = this.state.baofei
        // if (dataIndexFormula == 'feeIncreaseRule') formulaData = this.state.feeIncreaseRule // 职业加费
        // if (dataIndexFormula == 'addfeeRule') formulaData = this.state.addfeeRule // 健康加费

        /*if (this.state.formulaId) {
            if (dataIndexFormula === `addfeeTable${this.state.formulaId}`) formulaData = this.state[`addfeeTable${this.state.formulaId}`]
        }*/
        const productId = this.getQueryString(this.props.location.search, 'productId');


        const { messages } = this.props.intl;
        return (
            <div className='basicProductsAdd basicSelfName selfAddBasicProduct'>
                <PageModule
                    title={messages['ProductCenter.BasicInformation']}
                    btn={[{
                        content: <PopConfirm
                            // style={{ width: "100%" }}
                            title={messages['Tips.GiveUp']}
                            onConfirm={() => history.goBack()}
                            okText={messages['Public.GiveUp']}
                            cancelText={messages['Public.No']}
                        >
                            <button
                                key={1}
                                className='grayBtn'
                            // onClick={() => {
                            //  history.goBack()
                            // }}
                            >
                                {messages['Button.Cancel']}
                            </button>
                        </PopConfirm>

                    }, {
                        content: <button
                            key={3}
                            className='yellowBtn'
                            onClick={() => {
                                this.props.form.validateFieldsAndScroll((errors, values) => {
                                    this.props.form.validateFields((errors, values) => {
                                        console.log('form的values::',values)
                                        const addFee = this.renderAddFeeTable.getData()       // 获取加费 列表数据
                                        console.log("addFee--->", addFee)
                                        let isTrue = false
                                        addFee.forEach((item, index) => {
                                            if (item.addfeeType === "Table") {
                                                const file = this.state[`addfeeTable${item.id}`]
                                                if (!file) isTrue = true
                                            }
                                        })
                                        //if (isTrue) return Toast.info("请上传加费表", 2);
                                        // const { baofei } = this.state;
                                        // if (!baofei) return Toast.info("请上传基本费率", 2);
                                        const premPayData = this.renderPremPayTable.getData() // 获取保费 缴费 列表数据
                                        // if (!(premPayData && premPayData.length>0)){
                                        //     return Toast.info(messages['Popconfirm.SuccessfulPreservation'], 2);
                                        // }
                                        //console.log("premPayData-->", premPayData)
                                        const term = this.renderTermTable.getData()           // 获取条款 列表数据
                                        term.forEach(item => {
                                            if (!item.businessCode) {
                                                // this.props.form.setFieldsValue({ [`businessCode${item.id}`]: "" })
                                                this.props.form.setFields({
                                                    [`businessCode${item.id}`]: {
                                                        value: "",
                                                        errors: [new Error('请上传文件')]
                                                    },
                                                });
                                            }
                                        });

                                        // 必填项特殊处理
                                        let flag = false;
                                        if (errors) {
                                            const errKey = Object.keys(errors)[0];
                                            // 附加险LA类型非必填
                                            if (values.productType == 1) {
                                                if (errKey.indexOf('category') >= 0)
                                                    flag = true;
                                            }
                                        }
                                        /*this.getReadyData(values);
                                        return false;*/

                                        if (!errors || flag) {
                                            this.saveData(this.getReadyData(values), (res) => {
                                                //console.log('this.getReadyData(values)::',this.getReadyData(values))
                                                return this.props.history.push('/product/product/BasicProductsPage')
                                            });
                                        } else {
                                            const tip = errors[Object.keys(errors)[0]].errors[0].message;
                                            message.error(tip);
                                        }
                                    });
                                });
                            }}
                        >{messages['Button.Save']}</button>
                    }]}
                // rightBtn={[{
                //   text: messages['Button.Edit'], onClick: () => {
                //   }
                // }]}
                >

                    <Form>
                        <InputGrid
                            className='row1'
                            data={[{
                                content: <Form.Item label={messages['ProductCenter.ProductCode']}>
                                    {getFieldDecorator('productCode', {
                                        rules: [
                                            {
                                                required: true,
                                                message: messages['Public.PleaseInput'] + messages['ProductCenter.ProductCode']
                                            },
                                            {
                                                validator: (rule, value, callback) => {
                                                    validateCharacter2(value) ? callback('不能输入特殊字符和中文') : callback();
                                                },
                                                message: '不能输入特殊字符和中文'
                                            },
                                        ],
                                        initialValue: codeData && codeData.productAddVo.productAttrVo.productCode
                                    })(
                                        <Input maxLength={10}
                                            disabled={productId ? true : false}
                                            placeholder={messages['Public.PleaseInput'] + messages['ProductCenter.ProductCode']} />
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.ProductName']}>
                                    {getFieldDecorator('productName', {
                                        rules: [{
                                            required: true,
                                            message: messages['Public.PleaseInput'] + messages['ProductCenter.ProductName']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productAttrVo.productName
                                    })(
                                        <Input
                                            maxLength={100}
                                            placeholder={messages['Public.PleaseInput'] + messages['ProductCenter.ProductName']} />
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.BusinessChannel']}>
                                    {getFieldDecorator('productNature', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.BusinessChannel']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productAttrVo.productNature || 'P'
                                    })(
                                        <Select
                                            onChange={(e) => {
                                                //console.log(e)
                                            }}
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.BusinessChannel']}>
                                            {
                                                Object.keys(PRODUCT_NATURE).map((k) => {
                                                    return <Option key={k} value={k}>{PRODUCT_NATURE[k]}</Option>
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.ProductAttribution']}>
                                    {getFieldDecorator('productAttribute', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.ProductAttribution']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productAttrVo.productAttribute
                                    })(
                                        <Select
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.ProductAttribution']}>
                                            {productAttributeData && productAttributeData.map((item, index) => {
                                                return <Option key={index} value={item.code}>{item.value}</Option>
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.CategoryLevel1']}>
                                    {getFieldDecorator('productCategory', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.CategoryLevel1']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productAttrVo.productCategory
                                    })(
                                        <Select //险种分类一级
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.CategoryLevel1']}
                                            onChange={() => setFieldsValue({
                                                productCategorySecond: "",
                                                productCategoryThird: ""
                                            })}>
                                            {categoryData && categoryData.map((item, index) => {
                                                return <Option key={index} value={item.code}>{item.value}</Option>
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.CategoryLevel2']}>
                                    {getFieldDecorator('productCategorySecond', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : false,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.CategoryLevel2']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productAttrVo.productCategorySecond
                                    })(
                                        <Select
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.CategoryLevel2']}
                                            onChange={() => setFieldsValue({ productCategoryThird: "" })}>
                                            {categoryData && categoryData.map((item) => {
                                                const id = getFieldValue("productCategory")
                                                if (id === item.code) {
                                                    return item.dictList.map((data, index) => {
                                                        return <Option key={index}
                                                            value={data.code}>{data.cnName}</Option>
                                                    })
                                                }
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.CategoryLevel3']}>
                                    {getFieldDecorator('productCategoryThird', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : false,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.CategoryLevel3']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productAttrVo.productCategoryThird
                                    })(
                                        <Select
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.CategoryLevel3']}>
                                            {categoryData && categoryData.map((item) => {
                                                const productCategory = getFieldValue("productCategory")
                                                const productCategorySecond = getFieldValue("productCategorySecond")
                                                if (productCategory === item.code) {
                                                    return item.dictList.map((data) => {
                                                        if (productCategorySecond === data.code) {
                                                            return data.dictList.map((json, index) => {
                                                                return <Option key={index}
                                                                    value={json.code}>{json.cnName}</Option>
                                                            })
                                                        }
                                                    })
                                                }
                                            })}

                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.LongOrShortTimeType']}>
                                    {getFieldDecorator('timeRiskMark', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.LongOrShortTimeType']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productAttrVo.timeRiskMark
                                    })(
                                        <Select
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.LongOrShortTimeType']}>
                                            {
                                                Object.keys(TIME_RISK_MARK).map((k) => {
                                                    return <Option key={k} value={k}>{TIME_RISK_MARK[k]}</Option>
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.Channel']}>
                                    {getFieldDecorator('saleChannel', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.Channel']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productAttrVo.saleChannel ? codeData.productAddVo.productAttrVo.saleChannel.split(",") : undefined
                                    })(
                                        <Select maxTagCount={2}
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.Channel']}
                                            mode="multiple">
                                            {
                                                saleChannelData && saleChannelData.map((item, index) => {
                                                    return <Option key={index} value={item.code}>{item.value}</Option>
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.BaseOrRider']}>
                                    {getFieldDecorator('productType', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.BaseOrRider']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productAttrVo.productType ? codeData.productAddVo.productAttrVo.productType === "0" ? "0" : "1" : undefined
                                    })(
                                        <Select
                                            onChange={e => {
                                                if (e != 1) { // 不是附加险
                                                    setFieldsValue({
                                                        paymentYearRule: "",
                                                        exemptionsType: "null",
                                                        exemptions: ""
                                                    })
                                                }
                                            }}
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.BaseOrRider']}>

                                            {
                                                Object.keys(PRODUCT_TYPE_INSURE).map((k) => {
                                                    return <Option key={k} value={k}>{PRODUCT_TYPE_INSURE[k]}</Option>
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.ProductStatus']}>
                                    {getFieldDecorator('saleStateMark', {
                                        rules: [{
                                            required: true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.ProductStatus']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productAttrVo.saleStateMark
                                    })(
                                        <Select
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.ProductStatus']}
                                            onChange={(e) => {
                                                if (e === '0') {
                                                    //console.log("不做必录校验")
                                                }
                                            }}
                                        >
                                            {
                                                Object.keys(SALES_STATE).map((k) => {
                                                    return <Option key={k} value={k}>{SALES_STATE[k]}</Option>
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.DateToMarket']}>
                                    {getFieldDecorator('saleBeginTime', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.DateToMarket']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productAttrVo.saleBeginTime && moment(codeData.productAddVo.productAttrVo.saleBeginTime, 'YYYY-MM-DD'),
                                    })(
                                        <DatePicker style={{ width: "100%" }} disabledDate={this.disabledStartDate} />,
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.SaleDate']}>
                                    {getFieldDecorator('saleEndTime', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : showData.issaleEndTime,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.SaleDate']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productAttrVo.saleEndTime && moment(codeData.productAddVo.productAttrVo.saleEndTime, 'YYYY-MM-DD'),
                                    })(
                                        <DatePicker 
                                            disabled={showData.isDisabledEndTime} 
                                            style={{ width: "100%" }} 
                                            disabledDate={this.disabledEndDate} 
                                        />,
                                    )}
                                </Form.Item>
                            }]}
                        />
                        {/** 投保条件 **/}
                        <Title type='h2' title={messages['ProductCenter.InsuranceConditions']}
                        // rightBtn={[{
                        //   text: messages['Button.Edit'], onClick: () => {
                        //   }
                        // }]}
                        />
                        <InputGrid
                            className='row1'
                            data={[{
                                content: <Form.Item label={messages['ProductCenter.Gender']}>
                                    {getFieldDecorator('refuseGender', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.Gender']
                                        }],
                                        initialValue: codeData ? codeData.productAddVo.productInsureVo.refuseGender ? codeData.productAddVo.productInsureVo.refuseGender : "N" : undefined
                                    })(
                                        <Select
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.Gender']}>
                                            {Object.keys(REFUSE_GENDER).map((k) => {
                                                return <Option key={k} value={k}>{REFUSE_GENDER[k]}</Option>
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.Ship']}>
                                    {getFieldDecorator('refuseSocialSecurity', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.Ship']
                                        }],
                                        initialValue: codeData ? codeData.productAddVo.productInsureVo.refuseSocialSecurity ? codeData.productAddVo.productInsureVo.refuseSocialSecurity : "null" : undefined
                                    })(
                                        <Select
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.Ship']}>
                                            {Object.keys(REFUSE_SOCIAL).map((k) => {
                                                return <Option key={k} value={k}>{REFUSE_SOCIAL[k]}</Option>
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.RejectedOccupationClass']}>
                                    {getFieldDecorator('refuseJobLevel', { //拒保职业等级
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : false,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.RejectedOccupationClass']
                                        }],
                                        initialValue: codeData ? codeData.productAddVo.productInsureVo.refuseJobLevel ? codeData.productAddVo.productInsureVo.refuseJobLevel.split(",") : undefined : undefined
                                    })(
                                        <Select disabled={false} maxTagCount={2}
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.RejectedOccupationClass']}
                                            mode="multiple"
                                            onChange={(e)=>{
                                                console.log("eeee::",e)
                                            }}
                                        >
                                            {/* {refuse_jobData && refuse_jobData.map((i, index) => {
                                                return <Option key={index} value={i.code}>{i.value}</Option>
                                            })} */}
                                            {categoryData && categoryData.map((item) => {
                                                //console.log("item:::",item)
                                                const id = getFieldValue("productCategory")
                                                //console.log("id::",id)
                                                const arrDescription = item.description && item.description.split(',');
                                                //console.log("描述数组::",arrDescription)
                                                if (id === item.code) {
                                                    return arrDescription && arrDescription.map((data, index) => {
                                                        console.log("data::",data)
                                                        return <Option 
                                                                    key={index}
                                                                    value={data}>{data}</Option>
                                                    })
                                                }
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.RejectedOccupation']}>
                                    {getFieldDecorator('jobCode', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : false,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.RejectedOccupation']
                                        }],
                                        initialValue: refuseJobList
                                    })(
                                        <SelectTree
                                            onChange={(value) => setFieldsValue({ jobCode: value })}
                                            data={refuseJob}
                                            initialValue={refuseJobList}
                                        />
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.MinIssueAge']}>
                                    {getFieldDecorator('minAllowAge', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.MinIssueAge']
                                        }, { max: 3, message: "最大长度为3位" }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.minAllowAge
                                    })(
                                        <Input
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.MinIssueAge']}
                                            addonAfter={<div onClick={() => {
                                                this.openProduct("minAllowAge")
                                            }}><Icon type="setting" /></div>} />
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.MinIssueAgeUnit']}>
                                    {getFieldDecorator('minAllowAgeUnit', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.MinIssueAgeUnit']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.minAllowAgeUnit || "A"
                                    })(
                                        <Select
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.MinIssueAgeUnit']}>
                                            {Object.keys(ALLOW_AGE_UNIT).map((k) => {
                                                return <Option key={k} value={k}>{ALLOW_AGE_UNIT[k]}</Option>
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.MaxIssueAge']}>
                                    {getFieldDecorator('maxAllowAge', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.MaxIssueAge']
                                        }, , { max: 3, message: "最大长度为3位" }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.maxAllowAge
                                    })(
                                        <Input
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.MaxIssueAge']}
                                            addonAfter={<div onClick={() => {
                                                this.openProduct("maxAllowAge")
                                            }}><Icon type="setting" /></div>} />
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.MaxIssueAgeUnit']}>
                                    {getFieldDecorator('maxAllowAgeUnit', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.MaxIssueAgeUnit']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.maxAllowAgeUnit || "A"
                                    })(
                                        <Select
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.MaxIssueAgeUnit']}>
                                            {Object.keys(ALLOW_AGE_UNIT).map((k) => {
                                                return <Option key={k} value={k}>{ALLOW_AGE_UNIT[k]}</Option>
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.UnderwritingType']}>
                                    {getFieldDecorator('underwritingType', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.UnderwritingType']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.underwritingType || "SIO"
                                    })(
                                        <Select
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.UnderwritingType']}>
                                            {underwriting_type && underwriting_type.map((i, index) => {
                                                return <Option key={index} value={i.code}>{i.value}</Option>
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            }
                                // , { LA类型
                                //     content: <Form.Item label={messages['ProductCenter.LAType']}>
                                //         {getFieldDecorator('category', {
                                //             rules: [{
                                //                 required: showData.isSaleStateMark ? false : true,
                                //                 message: messages['Public.PleaseSelect'] + 'LA' + messages['ProductCenter.OnlyType']
                                //             }],
                                //             initialValue: initialcategory
                                //         })(
                                //             <Input
                                //                 placeholder={messages['Public.PleaseSelect'] + 'LA' + messages['ProductCenter.OnlyType']} />
                                //         )}
                                //     </Form.Item>
                                // }
                                , {
                                content: <Form.Item label={messages['ProductCenter.PremiumPaymentPeriodRule']}>
                                    {getFieldDecorator('paymentYearRule', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : false,
                                            message: messages['Public.PleaseSelect'] + 'LA' + messages['ProductCenter.PremiumPaymentPeriodRule']
                                        }],
                                        initialValue: initialpaymentYearRule
                                    })(
                                        <Select disabled={showData.isPaymentYearRule} placeholder="请选择缴费年限规则">
                                            <Option value={"0"}>{messages['ProductCenter.FollowBassic']}</Option>
                                            <Option value={"1"}>{messages['ProductCenter.Unlimited']}</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            }]}
                        />
                        {/** 保额 **/}
                        <Title type='h2' title={messages['ProductCenter.InsuranceAmount']}
                        // rightBtn={[{
                        //   text: messages['Button.Edit'], onClick: () => {
                        //   }
                        // }]}
                        />
                        <IndexDemo
                            showData={initialforeheadShowData}
                            elements={[{
                                tolerance: <Form.Item label={messages['ProductCenter.ValuePerUnit']}>
                                    {getFieldDecorator('tolerance', { // 单位保额
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : obj.tolerance || false,
                                            message: messages['Public.PleaseInput'] + messages['ProductCenter.ValuePerUnit']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.tolerance
                                    })(
                                        <Input
                                            placeholder={messages['Public.PleaseInput'] + messages['ProductCenter.ValuePerUnit']} />
                                    )}
                                </Form.Item>
                            }, {
                                premiumAddType: <Form.Item label={messages['ProductCenter.SalesMethod']}>
                                    {getFieldDecorator('premiumAddType', { // 销售方式
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : obj.premiumAddType || false,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.SalesMethod']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.premiumAddType
                                    })(
                                        <Select
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.SalesMethod']}>
                                            {salesMethods && salesMethods.map((i, index) => {
                                                return <Option key={index} value={i.code}>{i.value}</Option>
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                maxPolicyNum: <Form.Item label={messages['ProductCenter.MaximumPolicyAmount']}>
                                    {getFieldDecorator('maxPolicyNum', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : obj.maxPolicyNum || false,
                                            message: messages['Public.PleaseInput'] + messages['ProductCenter.MaximumPolicyAmount']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.maxPolicyNum
                                    })(
                                        <Input
                                            placeholder={messages['Public.PleaseInput'] + messages['ProductCenter.MaximumPolicyAmount']} />
                                    )}
                                </Form.Item>
                            }, {
                                singleCoverage: <Form.Item label={messages['ProductCenter.EverySingleCoverage']}>
                                    {getFieldDecorator('singleCoverage', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : obj.singleCoverage || false,
                                            message: messages['Public.PleaseInput'] + messages['ProductCenter.EverySingleCoverage']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.singleCoverage
                                    })(
                                        <Input
                                            placeholder={messages['Public.PleaseInput'] + messages['ProductCenter.EverySingleCoverage']} />
                                    )}
                                </Form.Item>
                            }, {
                                premium: <Form.Item label={messages['ProductCenter.InsuranceAmount']}>
                                    {getFieldDecorator('minPremiumLimitValue', {
                                        rules: [{
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.InsuranceAmount']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.minPremiumLimitValue
                                    })(
                                        <Input
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.InsuranceAmount']}
                                            addonAfter={<div onClick={() => {
                                                this.openProduct("minPremiumLimitValue")
                                            }}><Icon type="setting" /></div>} />
                                    )}
                                </Form.Item>
                            }, {
                                minPremiumLimit: <Form.Item label={messages['ProductCenter.MinAmountFormula']}>
                                    {getFieldDecorator('minPremiumLimit', {
                                        rules: [{
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.MinAmountFormula']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.minPremiumLimit
                                    })(
                                        <Input
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.MinAmountFormula']}
                                            addonAfter={<div onClick={() => {
                                                this.openProduct("minPremiumLimit")
                                            }}><Icon type="setting" /></div>} />
                                    )}
                                </Form.Item>
                            }, {
                                maxPremiumLimit: <Form.Item label={messages['ProductCenter.MaxAmountFormula']}>
                                    {getFieldDecorator('maxPremiumLimit', {
                                        rules: [{
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.MaxAmountFormula']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.maxPremiumLimit
                                    })(
                                        <Input
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.MaxAmountFormula']}
                                            addonAfter={<div onClick={() => {
                                                this.openProduct("maxPremiumLimit")
                                            }}><Icon type="setting" /></div>} />
                                    )}
                                </Form.Item>
                            }]}
                        />
                        {/** 保费 **/}
                        <Title type='h2' title={messages['ProductCenter.Premium']}
                        />
                        <IndexDemo
                            showData={initialPremiumShowData}
                            elements={[{
                                maxPolicyNum: <Form.Item label={messages['ProductCenter.MaximumPolicyAmount']}>
                                    {getFieldDecorator('maxPolicyNum', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : obj.maxPolicyNum || false,
                                            message: messages['Public.PleaseInput'] + messages['ProductCenter.MaximumPolicyAmount']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.maxPolicyNum
                                    })(
                                        <Input
                                            placeholder={messages['Public.PleaseInput'] + messages['ProductCenter.MaximumPolicyAmount']} />
                                    )}
                                </Form.Item>
                            }, {
                                singleCoverage: <Form.Item label={messages['ProductCenter.EverySingleCoverage']}>
                                    {getFieldDecorator('singleCoverage', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : obj.singleCoverage || false,
                                            message: messages['Public.PleaseInput'] + messages['ProductCenter.EverySingleCoverage']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.singleCoverage
                                    })(
                                        <Input
                                            placeholder={messages['Public.PleaseInput'] + messages['ProductCenter.EverySingleCoverage']} />
                                    )}
                                </Form.Item>
                            }, {
                                premiums: <Form.Item label={messages['ProductCenter.Premium']}>
                                    {getFieldDecorator('baofei', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.Premium']
                                        }],
                                        initialValue: this.state.baofeiinitial
                                    })(
                                        <Input
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.Premium']}
                                            addonAfter={<div onClick={() => {
                                                this.openProduct("baofei", "A1")
                                            }}><Icon type="setting" /></div>} />
                                    )}
                                </Form.Item>
                            }, {
                                minPremium: <Form.Item label={messages['ProductCenter.MinPremium']}>
                                    {getFieldDecorator('minPremium', {
                                        rules: [{
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.MinPremium']
                                        }],
                                        //initialValue: codeData && codeData.productAddVo.productInsureVo.minPremium
                                        initialValue: this.state.minPremium
                                    })(
                                        <Input
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.MinPremium']}
                                            addonAfter={<div onClick={() => {
                                                this.openProduct("minPremium")
                                            }}><Icon type="setting" /></div>} />
                                    )}
                                </Form.Item>
                            }, {
                                maxPremium: <Form.Item label={messages['ProductCenter.MaxPremium']}>
                                    {getFieldDecorator('maxPremium', {
                                        rules: [{
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.MaxPremium']
                                        }],
                                        //initialValue: codeData && codeData.productAddVo.productInsureVo.maxPremium
                                        initialValue: this.state.maxPremium
                                    })(
                                        <Input
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.MaxPremium']}
                                            addonAfter={<div onClick={() => {
                                                this.openProduct("maxPremium")
                                            }}><Icon type="setting" /></div>} />
                                    )}
                                </Form.Item>
                            }]}
                        />
                        {/** 续保 **/}
                        <Title type='h2' title={messages['ProductCenter.Renewable']}
                        // rightBtn={[{
                        //   text: messages['Button.Edit'], onClick: () => {
                        //   }
                        // }]}
                        />
                        <IndexDemo
                            showData={showData.renewalShowData || renewalShowData}
                            elements={[{
                                payment_term_type: <Form.Item label={messages['ProductCenter.Renewable2']}>
                                    {getFieldDecorator('isPayable', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.Renewable2']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.isPayable
                                    })(
                                        <Select
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.Renewable2']}
                                            onChange={e => {
                                                if (e === "0") {
                                                    setFieldsValue({
                                                        renewableAge: "",
                                                        isEnsureRenewable: undefined,
                                                        ensureRenewalFactor: ""
                                                    })
                                                }
                                            }}
                                        >
                                            <Option value={"1"}>{messages['Public.Yes']}</Option>
                                            <Option value={"0"}>{messages['Public.No']}</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                renewable_age: <Form.Item label={messages['ProductCenter.MaxRenewableAge']}>
                                    {getFieldDecorator('renewableAge', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : !showData.isisPayable,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.MaxRenewableAge']
                                        }, { max: 3, message: "最大长度为3位" }],
                                        initialValue: codeData && codeData.productAddVo.productAttrVo.renewableAge
                                    })(
                                        <Input
                                            disabled={showData.isisPayable}
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.MaxRenewableAge']}
                                            addonAfter={<div onClick={() => {
                                                if (showData.isisPayable) return;
                                                this.openProduct("renewableAge")
                                            }}><Icon type="setting" /></div>} />
                                    )}
                                </Form.Item>
                            }, {
                                companyCodlowe: <Form.Item label={messages['ProductCenter.GuaranteedRenewable']}>
                                    {getFieldDecorator('isEnsureRenewable', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : !showData.isisPayable,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.GuaranteedRenewable']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.isEnsureRenewable
                                    })(
                                        <Select
                                            disabled={showData.isisPayable}
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.GuaranteedRenewable']}>
                                            <Option value={"1"}>{messages['Public.Yes']}</Option>
                                            <Option value={"0"}>{messages['Public.No']}</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                compqanyCode: <Form.Item label={messages['ProductCenter.GuaranteedRenewableCondition']}>
                                    {getFieldDecorator('ensureRenewalFactor', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : false, //!showData.isisPayable, PRODUCTFTY-467保证续保条件为非必录项
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.GuaranteedRenewableCondition']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.ensureRenewalFactor
                                    })(
                                        <Input
                                            disabled={showData.isisPayable}
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.GuaranteedRenewableCondition']}
                                            addonAfter={<div onClick={() => {
                                                if (showData.isisPayable) return;
                                                this.openProduct("ensureRenewalFactor")
                                            }}><Icon type="setting" /></div>} />
                                    )}
                                </Form.Item>
                            }]}
                        />
                        {/** 监管 **/}
                        <Title type='h2' title={messages['ProductCenter.Regulatory']}
                        // rightBtn={[{
                        //   text: messages['Button.Edit'], onClick: () => {
                        //   }
                        // }]}
                        />
                        <InputGrid
                            className='row1'
                            data={[{
                                content: <Form.Item label='CRS'>
                                    {getFieldDecorator('crs', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + 'CRS'
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.crs
                                    })(
                                        <Select placeholder={messages['Public.PleaseSelect'] + 'CRS'}>
                                            <Option value={"1"}>{messages['Public.Yes']}</Option>
                                            <Option value={"0"}>{messages['Public.No']}</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label='FATCA'>
                                    {getFieldDecorator('fatca', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + 'FATCA'
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.fatca
                                    })(
                                        <Select placeholder={messages['Public.PleaseSelect'] + 'FATCA'}>
                                            <Option value={"1"}>{messages['Public.Yes']}</Option>
                                            <Option value={"0"}>{messages['Public.No']}</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            }]}
                        />
                        {/** 回溯 **/}
                        <Title type='h2' title={messages['ProductCenter.Dateback']}
                        // rightBtn={[{
                        //   text: messages['Button.Edit'], onClick: () => {
                        //   }
                        // }]}
                        />
                        <IndexDemo
                            showData={initialisbackShowData}
                            elements={[{
                                isBack: <Form.Item label={messages['ProductCenter.IsItTraceable']}>
                                    {getFieldDecorator('isBack', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : backComponent.isBack || false,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.IsItTraceable']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.isBack
                                    })(
                                        <Select
                                            onChange={(e) => {
                                                if (e === "0") {
                                                    setFieldsValue({
                                                        appointBack: "",
                                                        backDay: "",
                                                        birthdayback: ""
                                                    })
                                                }
                                            }}
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.IsItTraceable']}>
                                            <Option value={"1"}>{messages['Public.Yes']}</Option>
                                            <Option value={"0"}>{messages['Public.No']}</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                birthdayback: <Form.Item label={messages['ProductCenter.DateBackByBirthday']}>
                                    {getFieldDecorator('birthdayback', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : false,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.DateBackByBirthday']
                                        }],
                                        // rules: [{ required:showData.isSaleStateMark ?true: backComponent.birthdayback || false, message: '请选择生日回溯' }],
                                        // initialValue: codeData && codeData.productAttrVo.companyCode
                                    })(
                                        <Select
                                            disabled={showData.isBack}
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.DateBackByBirthday']}>
                                            <Option value={"1"}>{messages['Public.Yes']}</Option>
                                            <Option value={"0"}>{messages['Public.No']}</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                appointBack: <Form.Item label={messages['ProductCenter.DateBackSpecifiedDate']}>
                                    {getFieldDecorator('appointBack', {
                                        rules: [{
                                            // required:showData.isSaleStateMark ?true: backComponent.appointBack || false,
                                            required: showData.isSaleStateMark ? false : !showData.isBack,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.DateBackSpecifiedDate']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.appointBack
                                    })(
                                        <Select
                                            onChange={(e) => {
                                                if (e === '1') {
                                                    this.setState({
                                                        _backDay: false
                                                    })
                                                } else if (e === '0') {
                                                    this.setState({
                                                        _backDay: true
                                                    })
                                                }
                                            }}
                                            disabled={showData.isBack}
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.DateBackSpecifiedDate']}>
                                            <Option value={"1"}>{messages['Public.Yes']}</Option>
                                            <Option value={"0"}>{messages['Public.No']}</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                backDay: <Form.Item label={messages['ProductCenter.DateBackDaysAllowable']}>
                                    {getFieldDecorator('backDay', {
                                        rules: [{
                                            // required:showData.isSaleStateMark ?true: backComponent.backDay || false,
                                            //required:showData.isSaleStateMark ?true: !showData.isBack,
                                            required: showData.isSaleStateMark ? false : !this.state._backDay && !showData.isBack,
                                            message: messages['Public.PleaseInput'] + messages['ProductCenter.DateBackSpecifiedDate']
                                        }, {
                                            validator: (rule, value, callback) => {
                                                if (value > 100) return callback('请输入正确的回溯日期')
                                                return callback()
                                            }
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.backDay
                                    })(
                                        <InputNumber
                                            disabled={showData.isBack || this.state._backDay}
                                            placeholder={messages['Public.PleaseInput'] + messages['ProductCenter.DateBackSpecifiedDate']}
                                            min={0} max={100} />
                                    )}
                                </Form.Item>
                            }]}
                        />
                        {/** 豁免 **/}
                        <Title type='h2' title={messages['ProductCenter.ExemptionWaiver']}
                        // rightBtn={[{
                        //   text: messages['Button.Edit'], onClick: () => {
                        //   }
                        // }]}
                        />
                        <IndexDemo
                            showData={showData.isImmunityData || immunityData}
                            elements={[{
                                isExemptions: <Form.Item label={messages['ProductCenter.IsItWaiver']}>
                                    {getFieldDecorator('isExemptions', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : true,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.IsItWaiver']
                                        }],
                                        initialValue: codeData ? codeData.productAddVo.productAttrVo.isExemptions : "1"
                                    })(
                                        <Select
                                            //defaultValue={}
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.IsItWaiver']}
                                            onChange={e => {
                                                const productType = getFieldValue("productType")
                                                if ((e === "1" && productType === "1") || productType === "0") {
                                                    this.setState({ checkedexemptions: [] })
                                                    setFieldsValue({ exemptionsType: "null", exemptions: "" })
                                                }
                                            }}>
                                            <Option value={"1"}>{messages['Public.Yes']}</Option>
                                            <Option value={"0"}>{messages['Public.No']}</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                exemptionsType: <Form.Item label={messages['ProductCenter.ExemptionWaiverType']}>
                                    {getFieldDecorator('exemptionsType', {
                                        rules: [{
                                            required: false,// showData.isSaleStateMark ? false : !showData.exemptionsType || false,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.ExemptionWaiverType']
                                        }],
                                        initialValue: codeData ? codeData.productAddVo.productInsureVo.exemptionsType ? codeData.productAddVo.productInsureVo.exemptionsType : "null" : undefined
                                    })(
                                        <Select
                                            disabled={showData.exemptionsType}
                                            onChange={e => {
                                                if (e != "null") {
                                                    setFieldsValue({ paymentYearRule: "" })
                                                } else {
                                                    setFieldsValue({ exemptions: "" })
                                                    this.setState({ checkedexemptions: [] })
                                                }
                                            }}
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.ExemptionWaiverType']}>
                                            <Option key={0} value={"null"}>{messages['Public.Null']}</Option>
                                            {typesOfImmunity && typesOfImmunity.map((i, index) => {
                                                return <Option key={index + 1} value={i.code}>{i.value}</Option>
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                exemptions: <Form.Item label={messages['ProductCenter.ExemptionWaiverProduct']}>
                                    {getFieldDecorator('exemptions', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : false,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.ExemptionWaiverProduct']
                                        }],
                                        initialValue: checkedexemptions && checkedexemptions.length > 0 ? "已选择" : undefined
                                    })(
                                        <Input
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.ExemptionWaiverProduct']}
                                            addonAfter={<div onClick={() => {
                                                if (showData.exemptions) return;
                                                if (!showData.exemptionsType) this.selectProduct()
                                            }}><Icon type="table" /></div>}
                                            disabled={showData.exemptionsType || showData.exemptions}
                                            onFocus={(e) => {
                                                this.selectProduct(), e.currentTarget.blur()
                                            }}
                                        />
                                    )}
                                </Form.Item>
                            }
                            ]}
                        />
                        {/* 保费&缴费 */}
                        <Title type='h2' title={messages['ProductCenter.Premium&Payment']}
                        // rightBtn={[{
                        //   text: messages['Button.Edit'], onClick: () => {
                        //   }
                        // }]}
                        />

                        <PremPayTable
                            intl={this.props.intl}
                            ref={(ref => this.renderPremPayTable = ref)}
                            form={this.props.form}
                            selectData={[payment_year, payment_type, policy_year, saleChannelData]}
                            openProduct={this.openProduct}
                            codeData={(codeData && codeData.productAddVo.productAttrVo.productAttrList) || ""}
                        />
                        {/* 加费 */}
                        <Title type='h2' title={messages['ProductCenter.ExtraPremium']}
                        // rightBtn={[{
                        //   text: messages['Button.Edit'], onClick: () => {
                        //   }
                        // }]}
                        />
                        <AddFeeTable //引入加费模块子组件
                            intl={this.props.intl}
                            ref={(ref => this.renderAddFeeTable = ref)}
                            feeIncreaseType={feeIncreaseType} // 加费类型
                            form={this.props.form}
                            formulaDataList={this.state.formulaDataList}
                            feeIncreaseWays={this.state.feeIncreaseWays} // 加费方式
                            getFieldDecorator={getFieldDecorator}
                            codeData={(codeData && codeData.productRateVo.relationRateVoList[0].attachmentFormulaVoList) || ""}
                            style={{ width: 400 }}
                            openProduct={this.openProduct}
                            setAddfeeFormula={this.onSetState}
                        />
                        {/* 收益 */}
                        <Title type='h2' title={messages['ProductCenter.Benefit']}
                        // rightBtn={[{
                        //   text: messages['Button.Edit'], onClick: () => {
                        //   }
                        // }]}
                        />
                        <EarningTable
                            intl={this.props.intl}
                            form={this.props.form}
                            ref={(ref => this.renderEarningTable = ref)}
                            incomeTypeData={this.state.incomeTypeData}
                            bonus_payment={this.state.bonus_payment}
                            openProduct={this.openProduct}
                            codeData={(codeData && codeData.productAddVo.productIncometypes) || ""}
                        />
                        {/** 权益 **/}
                        <Title type='h2' title={messages['ProductCenter.Equity']}
                        // rightBtn={[{
                        //   text: messages['Button.Edit'], onClick: () => {
                        //   }
                        // }]}
                        />
                        <InputGrid
                            className='row1'
                            data={[{
                                content: <Form.Item label={messages['ProductCenter.NFO']}>
                                    {getFieldDecorator('nfoValue', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : false,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.NFO']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productInsureVo.nfoValue ? codeData.productAddVo.productInsureVo.nfoValue.split(",") : undefined
                                    })(
                                        <Select
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.NFO']}
                                            mode="multiple">
                                            {
                                                nfoData && nfoData.map((item, index) => {
                                                    return <Option key={index} value={item.code}>{item.value}</Option>
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            }, {
                                content: <Form.Item label={messages['ProductCenter.SurrenderPeriod']}>
                                    {getFieldDecorator('surrenderHesitationTime', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : false,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.SurrenderPeriod']
                                        }],
                                        initialValue: codeData && codeData.productAddVo.productSecurityVo && codeData.productAddVo.productSecurityVo.surrenderHesitationTime
                                    })(
                                        <InputNumber
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.SurrenderPeriod']}
                                            min={0} />
                                    )}
                                </Form.Item>
                            }]}
                        />
                        {/* 条款 */}
                        <Title type='h2' title={messages['ProductCenter.Clause']}
                        // rightBtn={[{
                        //   text: messages['Button.Edit'], onClick: () => {
                        //   }
                        // }]}
                        />
                        <TermTable
                            intl={this.props.intl}
                            codeData={(codeData && codeData.productAddVo.productClauseVoList) || ""}
                            form={this.props.form}
                            ref={(ref => this.renderTermTable = ref)}
                            style={{ width: 400 }}
                        />
                        {/** 计算→价值 **/}
                        <Title type='h2' title={messages['ProductCenter.Value']}
                        // rightBtn={[{
                        //   text: messages['Button.Edit'], onClick: () => {
                        //   }
                        // }]}
                        />
                        <InputGrid
                            className='row1'
                            data={[{
                                content: <Form.Item label={messages['ProductCenter.CashValue']}>
                                    {getFieldDecorator('xianjinjiazhi', {
                                        rules: [{
                                            required: showData.isSaleStateMark ? false : false,
                                            message: messages['Public.PleaseSelect'] + messages['ProductCenter.CashValue']
                                        }],
                                        initialValue: this.state.xianjinjiazhiinitial
                                    })(
                                        <Input
                                            placeholder={messages['Public.PleaseSelect'] + messages['ProductCenter.CashValue']}
                                            addonAfter={<div onClick={() => {
                                                this.openProduct("xianjinjiazhi", "A4")
                                            }}><Icon type="setting" /></div>} />
                                    )}
                                </Form.Item>
                            }
                                // , {
                                //   content: <Form.Item label='满期金'>
                                //     {getFieldDecorator('manqijin', {
                                //       rules: [{ required: false, message: '请选择满期金' }],
                                //       // initialValue: codeData && codeData.productAttrVo.companyCode
                                //     })(
                                //       <Input placeholder={`请选择满期金`} addonAfter={<div onClick={() => { this.openProduct("manqijin") }}><Icon type="setting" /></div>} />
                                //     )}
                                //   </Form.Item>
                                // }
                            ]}
                        />
                        {/* 规则 */}
                        <Title type='h2' title={messages['ProductCenter.Rules0']} />
                        <RuleTable
                            intl={this.props.intl}
                            prompt_pool={prompt_pool}
                            form={this.props.form}
                            openProduct={this.openRuleProduct}
                            getFieldDecorator={getFieldDecorator}
                            ref={(ref => this.renderRuleTable = ref)}
                            codeData={(codeData && codeData.productAddVo.droolsRules) || ""}
                        />
                        <div style={{ height: 40 }}></div>
                    </Form>
                </PageModule>
                {/* <Formula
                    wrappedComponentRef={(ref) => this.getFormulaModal = ref}
                    productCode={getFieldValue("productCode")}
                    value={this.state.formulaValue}
                    getData={(data, uploadData) => {
                        const { dataIndexFormula } = this.state;
                        console.log(dataIndexFormula, data, uploadData)
                        setFieldsValue({ [`${dataIndexFormula}`]: data })
                        // if (data) setFieldsValue({ [`${dataIndexFormula}`]: data })
                        // if (uploadData) this.setState({ [`${dataIndexFormula}`]: uploadData })
                        this.setState({ dataIndexFormula: "", fileType: "", [`${dataIndexFormula}`]: uploadData })
                    }}
                    language={this.language}
                    fileType={this.state.fileType}
                    visible={this.state.showFormula}
                    handleCancel={() => this.setState({ showFormula: false })}
                    formulaData={formulaData}
                    factorObject={this.state.factorObject}
                    formulaObject={this.state.formulaObject}
                /> */}
                {/* 处理多个公式 弹出层 */}
                <FormulaModal
                    ref={ref => this.formulaModal = ref}
                    newadd={true} // 显示公式类别
                    basicProducts={true}
                    productCode={getFieldValue("productCode")}
                    value={this.state.formulaValue}
                    language={this.language}
                    fileType={this.state.fileType || "CA"}
                    // visible={this.state.showFormula}
                    handleCancel1={() => this.setState({ formulaData: "", fileType: "" })}
                    // formulaData1={this.state.formulaData}
                    formulaDataList={() => {
                        let formulaDataList = []
                        this.state.formulaDataList && this.state.formulaDataList.forEach((item, index) => {
                            console.log("item-->", item)
                            if (item && item[0].key === this.state.dataIndexFormula) {
                                formulaDataList.push(item)
                            }
                        })
                        return formulaDataList
                    }}
                    saveOrUpdate1={this.saveOrUpdate}
                    factorObject={this.state.factorObject}
                    formulaObject={this.state.formulaObject}
                    getFactorObject={this.getFactorObject}
                />
                <RuleFormula
                    value={this.state.formulaValue}
                    ruleFormulaCode={this.state.ruleFormulaCode}
                    getData={(data, selectedRows) => {
                        const { dataIndexFormula } = this.state;
                        if (data) setFieldsValue({ [`${dataIndexFormula}`]: data })
                        // 规则 table 带出来的返回信息
                        this.renderRuleTable.onSetState(selectedRows[0], dataIndexFormula.substring(12), data)
                        this.setState({ dataIndexFormula: "", fileType: "", ruleFormulaCode: "" })
                    }}
                    visible={this.state.showRuleFormula}
                    handleCancel={() => this.setState({ showRuleFormula: false })}
                    // data={formulaData}
                    prompt_pool={prompt_pool}
                    factorPoolFind={this.state.factorPoolFind} // 因子列表
                />
                <PageModal
                    ref={(ref) => {
                        this.newAttribute = ref
                    }}
                    title={messages['ProductCenter.ChooseProduct']}
                    onOk={() => {
                        const exemptions = this.state.checkedexemptions || ""
                        if (exemptions && exemptions.length > 0) {
                            setFieldsValue({ exemptions: "已选择" })
                        } else {
                            setFieldsValue({ exemptions: "" })
                        }
                        this.newAttribute.onHide();
                        this.attrsObject.clear();
                    }}
                    onCancel={() => {
                        this.attrsObject.clear()
                    }}
                >
                    <SelectProduct
                        onChange={(checkedexemptions => this.setState({ checkedexemptions }))}
                        exemptions={this.state.exemptionsData}
                        ref={(ref) => {
                            this.attrsObject = ref
                        }}
                        handleCancel={() => this.setState({ showFormula: false })}
                        codeData={this.state.checkedexemptions || ""}
                    />
                </PageModal>

            </div>
        );
    }
}


const WrappedRegistrationForm = Form.create()(injectIntl(AddBasicProducts));
export default connect(state => {
    const { MenuReducer, RoleReducer } = state;
    return {
        MenuReducer,
        RoleReducer
    }
}, action)(WrappedRegistrationForm);
