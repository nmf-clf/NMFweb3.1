import * as login from './action-type';

export const defaultState = {
  leftMenu: [],
  lmztest:{
    'niu':'11111'
  }
}

// 首页表单数据
export default (state = defaultState, action = {}) => {
  switch (action.type) {
    //请求成功
    case login.ROLEMENU:
    case login.TABLEDATA:
    case login.ADD:
      return {
        ...state,
        ...action
      }
    case 'test':{
        return{
          ...state,
          'lmztest':{
            ...state.wocao,
            ...action.select_school,
          }
        }
      }
    default:
      return state;
  }
};

