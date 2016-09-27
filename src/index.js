import middleware from './middleware';
import makeFetchAction from './makeFetchAction';
import { REDUCER_PATH } from './constants';
import reducer from './reducer'

const reducers = { [REDUCER_PATH]: reducer };

export { middleware, makeFetchAction, reducers };
