import { createStore, combineReducers, applyMiddleware } from 'redux';
import LoginReducer from '../pages/login/store/reducer';
import RoleReducer from '../pages/systemManagement/roleManagement/store/reducer'
import MenuReducer from '../pages/base/store/MenuReducer';
import UserReducer from '../pages/systemManagement/user/store/userReducer';
import SystemReducer from '../pages/systemManagement/systemConfiguration/store/systemReducer'
import ResourceReducer from '../pages/systemManagement/resourceManagement/store/reducer'

import lmzReducer from '../pages/productionCenter/basicProducts/store/reducer'
import thunk from 'redux-thunk';

const logger = store => next => action => {
	if (typeof action === 'function') console.log('dispatching a function');
	else console.log('dispatching', action);
	let result = next(action);
	//console.log('next state', store.getState());
	return result;
}

const store = createStore(
	combineReducers({
		LoginReducer,
		MenuReducer,
		ResourceReducer,
		RoleReducer,
		UserReducer,
		SystemReducer,
		lmzReducer
	}),

	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
	applyMiddleware(thunk, logger)
);
export default store;