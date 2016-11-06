import { merge } from 'rxjs/observable/merge';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { map } from 'rxjs/operator/map';
import { filter } from 'rxjs/operator/filter';
import { partition } from 'rxjs/operator/partition';
import { groupBy } from 'rxjs/operator/groupBy';
import { mergeMap } from 'rxjs/operator/mergeMap';
import { mergeAll } from 'rxjs/operator/mergeAll';
import 'rxjs/add/operator/do';

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

const fromRespToActionStream = (actionCreator) => ({ api, resp }) => fromPromise(
  resp.json().then(json => actionCreator(api)(json))
)

// create an observable of promises
const callApiInGroup = (group$, adapter) => group$::map(
  api => fromPromise(adapter(api).then(resp => ({ resp, api })))
)

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
  const resp$ = apiGroup$::mergeMap(
    apiInGroup$ => callApiInGroup(apiInGroup$, adapter)::mergeAll()
  )

  const [success$, failure$] = resp$::partition(({ resp }) => resp.ok)

  const successAction$ = success$::mergeMap(fromRespToActionStream(makeSuccessAction))
  const failureAction$ = failure$::mergeMap(fromRespToActionStream(makeFailureAction))

  return merge(start$, startError$, successAction$, failureAction$);
}
