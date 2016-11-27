import { merge } from 'rxjs/observable/merge';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { map } from 'rxjs/operator/map';
import { switchMap } from 'rxjs/operator/switchMap';
import { filter } from 'rxjs/operator/filter';
import { partition } from 'rxjs/operator/partition';
import { groupBy } from 'rxjs/operator/groupBy';
import { mergeMap } from 'rxjs/operator/mergeMap';

const identity = (val) => val;

import { CALL_API } from './constants';

import {
  makeStartAction,
  makeStartErrorAction,
  makeSuccessAction,
  makeFailureAction,
} from './actions'

import applyFunctions from './utils/applyFunctions';

const isValid = (api) =>
  typeof api.name === 'string' &&
  typeof api.endpoint === 'string';

const makeHOObservableFromActionCreator = (actionCreator) => ({ api, resp, error }) => fromPromise(
  error ?
    Promise.resolve(actionCreator(api)({ error })) :
    resp.json().then(json => actionCreator(api)(json))
);

const fromRespToSuccessActionStream = makeHOObservableFromActionCreator(makeSuccessAction);
const fromRespToFailureActionStream = makeHOObservableFromActionCreator(makeFailureAction);
const fromRespToActionStream = (data) =>
  data.resp && data.resp.ok ?
    fromRespToSuccessActionStream(data) :
    fromRespToFailureActionStream(data);

// create an observable of promises
const callApiInGroup = (group$, adapter) => group$::switchMap(
  api => fromPromise(adapter(api).then(
    resp => ({ resp, api }),
    error => ({ error, api })
  ))
);

export default (actions$, { getState }, adapter) => {
  const api$ = actions$
    ::map(action => action[CALL_API])
    ::map(applyFunctions(getState));

  const [valid$, invalid$] = api$::partition(isValid)

  const startError$ = invalid$::map(api => makeStartErrorAction(api)())
  const start$ = valid$::map(api => makeStartAction(api)())

  // create a higher-order observable of each api (defined by their name)
  const apiGroup$ = valid$::groupBy(api => api.name)

  // create a higher-order observable of outgoing requests streams
  // each item is an observable
  const resp$ = apiGroup$::mergeMap(apiInGroup$ => callApiInGroup(apiInGroup$, adapter));

  const fetchDoneActions$ = resp$::mergeMap(fromRespToActionStream);

  return merge(start$, startError$, fetchDoneActions$);
}
