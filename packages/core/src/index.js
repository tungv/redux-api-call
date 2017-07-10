import middleware, { createAPIMiddleware } from './middleware';
import makeFetchAction from './makeFetchAction';
import composeAdapters from './composeAdapters';
import fetch from 'redux-api-call-adapter-fetch';
import json from 'redux-api-call-adapter-json';
import dedupe from 'redux-api-call-adapter-dedupe';

import {
  REDUCER_PATH,
  ACTION_FETCH_START,
  ACTION_FETCH_COMPLETE,
  ACTION_FETCH_FAILURE,
  ACTION_UPDATE_LOCAL,
} from './constants';
import reducer from './reducer'

const reducers = { [REDUCER_PATH]: reducer };
const ACTIONS = {
  START: ACTION_FETCH_START,
  COMPLETE: ACTION_FETCH_COMPLETE,
  FAILURE: ACTION_FETCH_FAILURE,
  UPDATE_LOCAL: ACTION_UPDATE_LOCAL,
};

export const defaultTransformers = [dedupe, json, fetch];

export { middleware, makeFetchAction, reducers, ACTIONS, composeAdapters, createAPIMiddleware };
