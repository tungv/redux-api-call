import middleware from './middleware';
import makeFetchAction from './makeFetchAction';
import {
  REDUCER_PATH,
  ACTION_FETCH_START,
  ACTION_FETCH_COMPLETE,
  ACTION_FETCH_FAILURE,
} from './constants';
import reducer from './reducer'

const reducers = { [REDUCER_PATH]: reducer };
const ACTIONS = {
  START: ACTION_FETCH_START,
  COMPLETE: ACTION_FETCH_COMPLETE,
  FAILURE: ACTION_FETCH_FAILURE,
};

export { middleware, makeFetchAction, reducers, ACTIONS };
