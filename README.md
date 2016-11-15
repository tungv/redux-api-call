[![CircleCI](https://circleci.com/gh/tungv/redux-api-call.svg?style=svg)](https://circleci.com/gh/tungv/redux-api-call)

# redux-api-call
Redux utilities for API calls using fetch

# Installation
```
npm i -S redux-api-call rxjs redux
```

# The goals
One command to create reducers, action creators and selectors for JSON API calls

# Interface

[Detailed API Reference](https://github.com/tungv/redux-api-call/wiki/API-Reference)

```js
makeFetchAction = (
  apiName: string,
  endpointFactory: (args: any) => ReduxStandardAPICallingAction,
  selectors: ?SelectorDescriptor,
) => {
  actionCreator: (args: any) => FluxStandardAction,
  isFetchingSelector: (state: object) => boolean,
  isInvalidatedSelector: (state: object) => boolean,
  dataSelector: (state: object) => any,
  errorSelector: (state: object) => any,
}
```

Where

`ReduxStandardAPICallingAction` is heavily influenced by [`redux-api-middleware`](https://github.com/agraboso/redux-api-middleware#redux-standard-api-calling-actions)

`FluxStandardAction` can be found [here](https://github.com/acdlite/flux-standard-action)

```js
type SelectorDescriptor = {
  [selectorName: string]: (apiResponseBody: any, apiErrorResponse: any) => any
}
```

## Examples:
```js
const {
  actionCreator,
  isFetchingSelector,
  isInvalidatedSelector,
  dataSelector,
  errorSelector,
} = makeFetchAction(
  'SAMPLE_API',
  () => ({
    endpoint: '/api/v1/todos',
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
  })
);
```

# Usages
First you need to add a reducer to your root reducer with a pathname is `api_responses` (In next releases, this name should be configurable, but for now, just use it)

```js

// rootReducer.js
import { combineReducers } from 'redux'
import { reducers as apiReducers } from 'redux-api-call'

const rootReducer = combineReducers({
  ...apiReducers
})

// configStore.js
import { createStore, applyMiddleware } from 'redux'
import { middleware as apiMiddleware } from 'redux-api-call'

const middlewares = applyMiddleware(
  apiMiddleware()
  // ... other middlewares
);
const store = createStore(rootReducer, {}, middlewares);

// state.js
import { makeFetchAction } from 'redux-api-call'
import { createSelector } from 'reselect'
import { flow, get, filter } from 'lodash/fp'

const {
  actionCreator: fetchTodos,
  isFetchingSelector,
  errorSelector,
  completeTodosSelector,
  incompleteTodosSelector
} = makeFetchAction('FETCH_TODOS', () => ({
  endpoint: '/api/v1/todos'
})

export { fetchTodos, isFetchingSelector, errorSelector }

export const todosSelector = flow(dataSelector, get('todos'));
export const completeTodosSelector = createSelector(todosSelector, filter(todo => todo.complete));
export const incompleteTodosSelector = createSelector(todosSelector, filter(todo => !todo.complete));

// component.jsx
import react from 'react'
import { connect } from 'react-redux'
import { fetchTodos, isFetchingSelector, completeTodosSelector, incompleteTodosSelector, errorSelector } from './state'

@connect(
  state => ({
    loading: isFetchingSelector(state),
    error: errorSelector(state),
    completeTodos: completeTodosSelector(state),
    incompleteTodos: incompleteTodosSelector(state),
  }), {
    fetchTodos,
  }
)
class TodosComponent extends React.Component {
  componentDidMount() {
    // first fetch
    this.props.fetchTodos();
  }

  render() {
    const { loading, error, completeTodos, incompleteTodos } = this.props;

    return (
      <div>
        {/* ... your markup ...*/}
      </div>
    )
  }
}
```
