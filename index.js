import React, { PureComponent } from 'react';
import {injectIntl, FormattedMessage} from 'react-intl';
// 团个类型
export const PRODUCT_TYPE = {
    0: '主险',
    1: '附加险',
    2: '豁免险',
    3: '非豁免险'
};

// 责任属性
export const LIABILITY_TYPE = {
    I: <FormattedMessage id="ProductCenter.Issued"/>,
    P: <FormattedMessage id="ProductCenter.Claim"/>
}

//团个类型
export const PRODUCT_NATURE = {
    P: '个险',
    G: '团险'
}

//产品状态
export const PRODUCT_STATE = {
    0: '配置中',
    1: '已完成',
}

//长短类型
export const TIME_RISK_MARK = {
    // L: '长期（一年期以上或含保证续费）',
    // M: '一年期',
    // S: '极短险（一年期以下）'
    L: '长期',
    M: '一年期',
    S: '极短险'
}

//保障期限类型
export const GUARANTEED_TYPE = {
    0: '时间',
    1: '年龄'
}

//保障期限单位
export const GUARANTEED_UNIT = {
    Y: '年',
    M: '月',
    D: '天',
    A: '岁'
}
//保障期限年龄单位
export const GUARANTEED_AGE_UNIT = {
    M: '月',
    D: '天',
    A: '岁'
}

//投保年龄单位
export const ALLOW_AGE_UNIT = {
    D: '天',
    A: '岁'
}

//性别
export const REFUSE_GENDER = {
    N: '无限制',
    M: '男',
    F: '女'
}

//社保限制
export const REFUSE_SOCIAL_SECURITY = {
    0: '无限制',
    1: '有社保',
    2: '无社保'
}

//期缴方式
export const PAYMENT_TYPE = {
    '00': '趸交',
    '01': '年缴',
    '02': '半年缴',
    '04': '季缴',
    '12': '月缴',
}

//保费增加方式
export const PREMIUM_ADD_TYPE = {
    0: '保费',
    1: '保单',
}

// 范围类型
export const SCOPE_TYPE = {
    GELT: '左闭右开',
    GELE: '全闭合',
    GTLE: '左开右闭',
    GTLT: '全开',
    GT: '大于',
    GE: '大于等于',
    LT: '小于',
    LE: '小于等于',
    CTS: '数字相等',
    SCTS: '字符串包含（相等）'
}

export const LIMIT_CONDITION = {
    "age": "年龄",
    "paymentMethod": "缴费方式",
    "protectionPeriod": "保障年限"
}

// 产品销售状态
export const PRODUCT_SHOP_STATUS = {
    1: '在售',
    2: '停售',
    3: '配置中',
    4: '完成配置'
}

// 产品销售类型
export const PRODUCT_SHOP_TYPES = {
    0: '灵活定制',
    1: '组合套餐',
    2: '个险'
}

// 产品组合类型
export const PRODUCT_GROUP_TYPES = {
    0: '单一产品',
    1: '产品计划',
    2: '产品组合',
    3: '团险方案'
}

// 产品营销权限
export const PRODUCT_MARKETING_PERMISS = {
    0: '初级',
    1: '中级',
    2: '高级'
}

// 方案类型packageCategory
export const PACKAGE_CATEGORY = {
    0: '灵活方案',
    1: '固定方案'
}

// 系统名称 富卫/四合一
export const SYSTEM_NAME = {
    0: 'FW',
    1: 'SHY'
}[0]

// 属性池 - 属性类型
export const PROPERTY_TYPE = {
    'BA': '基本信息',
    'CA': '承保信息',
    'SA': '销售信息',
    'SCA': '理赔信息',
    'PA': '保全信息',
    'RA': '再保信息',
    'SCAL': '理赔责任信息',
    'CAL': '承保责任信息',
    'PH': '产品条款信息'
}

// 属性池 - 属性输入类型
export const PROPERTY_INPUT = {
    'TB': '文本框',
    'NB': '数字框',
    'DB': '下拉框'
}

// 费率文件
export const RATE_FILE = {
    'A1': '保费费率',
    'A2': '职业加费',
    'A3': '健康加费',
    'A4': '价值费率',
    'A5': '风险保额'
}


export const SALES_STATE = {
    0: "待售",
    1: "在售",
    2: "停售",
}


export const SALES_ATTR = {
    0: "年金",
    1: "人寿",
    2: "医疗",
}

