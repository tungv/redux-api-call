[![CircleCI](https://circleci.com/gh/tungv/redux-api-call.svg?style=svg)](https://circleci.com/gh/tungv/redux-api-call)

# redux-api-call
Redux utilities for API calls using fetch with automatic race-conditions elimination.

[**Detailed API Reference**](https://github.com/tungv/redux-api-call/wiki/API-Reference)

# Installation
```
npm i -S redux-api-call rxjs redux
```

# The goals
One command to create reducers, action creators and selectors for JSON API calls

# Examples

```js
// EXAMPLE 1
// this will create data selector and action creator for your components to use
const { dataSelector, actionCreator } = makeFetchAction(
  'TODO_LIST',
  ({ page, limit }) => ({
    endpoint: `/api/v1/todos?page=${page}&limit=${limit}`,
    method: 'GET',
  })
);

// trigger fetch action
store.dispatch(actionCreator({ page: 1, limit: 10 });

// get the data
const todos = dataSelector(store.getState());
```

# Usages
First you need to add a reducer to your root reducer with a pathname is `api_calls` (In next releases, this name should be configurable, but for now, just use it)

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

// example usage with react
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
