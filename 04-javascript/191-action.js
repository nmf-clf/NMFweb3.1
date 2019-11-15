import * as role from './action-type';
import Network from '@/api/network';
import { Toast } from 'antd-mobile';

/**
 * 登录,保存至redux, 发送显示进度条action ,失败发送关闭进度条action
 * 成功，发送action跳转下一个页面
 * 失败，发送action页面不跳转
 **/

import store from '../../../../store/store';
export const LMZtest = (key, data) => {
  return async dispatch => {
    let newparam=store.getState().lmztest;
    newparam=data;
     dispatch({
       type:'test',
       wocao:newparam,
     })
  }
};


export const tableData = (reqParam, callBack) => {
  return async dispatch => {
    try {
      let result = await Network.postNetwork(reqParam.url, reqParam.data);
      if (result && result.code == '000') {
        dispatch({
          type: role.TABLEDATA,
          tableData: result.data
        });
        callBack && callBack(result.data);
      } else {
        Toast.fail(result.msg, 2);
      }
    } catch (error) {
      console.error(error);
    }
  }
};

export const deleteTable = (reqParam, callBack) => {
  return async dispatch => {
    try {
      let result = await Network.postNetwork(reqParam.url, reqParam.data);
      console.log(result)
      if (result && result.code == '000') {
        callBack && callBack(result.data);
      } else {
        Toast.fail(result.msg, 2);
      }
    } catch (error) {
      console.error(error);
    }
  }
};

export const addTable = (reqParam, callBack) => {
  return async dispatch => {
    try {
      let result = await Network.postNetwork(reqParam.url, reqParam.data);
      if (result && result.code == '000') {
        callBack && callBack(result.data);
      } else {
        Toast.fail(result.msg, 2);
      }
    } catch (error) {
      console.error(error);
    }
  }
};

export const selectTableData = (reqParam, callBack) => {
  return async dispatch => {
    try {
      let result = await Network.postNetwork(reqParam.url, reqParam.data);
      if (result && result.code == '000') {
        callBack && callBack(result.data);
      } else {
        Toast.fail(result.msg, 2);
      }
    } catch (error) {
      console.error(error);
    }
  }
};

export const getProductList = (reqParam, callBack) => {
  return async dispatch => {
    try {
      let result = await Network.postNetwork(reqParam.url, reqParam.data);
      if (result && result.code == '000') {
        callBack && callBack(result.data);
      } else {
        Toast.fail(result.msg, 2);
      }
    } catch (error) {
      console.error(error);
    }
  }
};

export const saveData = (reqParam, callBack) => {
  return async dispatch => {
    try {
      let result = await Network.postNetwork(reqParam.url, reqParam.data);
      if (result && result.code == '000') {
        callBack && callBack(result.data);
      } else {
        Toast.fail(result.msg, 2);
      }
    } catch (error) {
      console.error(error);
    }
  }
};

export const upDate = (reqParam, callBack) => {
  return async dispatch => {
    try {
      let result = await Network.postNetworkFile(reqParam.url, reqParam.data);
      if (result && result.code == '000') {
        Toast.success(result.msg, 2);
        callBack && callBack(result.data[0]);
      } else {
        Toast.fail(result.msg, 2);
      }
    } catch (error) {
      console.error(error);
    }
  }
};

export const getProductCategory = (code, callBack) => {
  return async dispatch => {
    try {
      let result = await Network.postNetwork('dictionary/code/findDictionaryAllChildByCodes?codes=' + code, {});
      if (result && result.code == '000') {
        callBack && callBack(result.data);
      } else {
        Toast.fail(result.msg, 2);
      }
    } catch (error) {
      console.error(error);
    }
  }
};