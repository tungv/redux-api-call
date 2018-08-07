[![npm](https://img.shields.io/npm/dm/redux-api-call.svg)](https://npm.im/redux-api-call) [![codebeat badge](https://codebeat.co/badges/a3c54dda-3816-4763-9041-32fff411c4a8)](https://codebeat.co/projects/github-com-tungv-redux-api-call-master)

# redux-api-call

Redux utilities for API calls using fetch with automatic race-conditions elimination.

```
npm i -S redux-api-call
```

[**Detailed API Reference**](https://github.com/tungv/redux-api-call/wiki/API-Reference)

[**Migration from v0 to v1**](https://github.com/tungv/redux-api-call/wiki/Migration-to-V1)

# The goals

One declarative API to create reducers, action creators and selectors for <del>JSON</del> any API calls

# Examples

```js
// EXAMPLE 1
// this will create data selector and action creator for your components to use
const todoListAPI = makeFetchAction(
  'TODO_LIST',
  (params) => ({ endpoint: `/api/v1/todos?page=${params.page}&limit=${params.limit}` })
);

// trigger fetch action
store.dispatch(todoListAPI.actionCreator({ page: 1, limit: 10 }));

// get the data
const todos = todoListAPI.dataSelector(store.getState());

// you can also use destructuring syntax for better readability
const { actionCreator: fetchTodos, dataSelector: todosSelector } = makeFetchAction(/* ... */);

// EXAMPLE 2
// race-condition elimination:
// if those commands are called in sequence
// no matter how long each request takes,
// page 2 and page 3 data will not have a chance to override page 4 data.
store.dispatch(fetchTodos({ page: 2 });
store.dispatch(fetchTodos({ page: 3 });
store.dispatch(fetchTodos({ page: 4 });
```

# Get Started

Steps:

1.  install
2.  add reducer
3.  add middleware
4.  declare api definitions

First, you need to install the redux-api-call using npm or yarn

```bash
npm i -S redux-api-call

// OR
yarn add redux-api-call
```

Secondly, you need to add a reducer to your root reducer with a pathname is `api_calls` (In next releases, this name should be configurable, but for now, just use it)

```js
// rootReducer.js
import { combineReducers } from 'redux';
import { reducers as apiReducers } from 'redux-api-call';

const rootReducer = combineReducers({
  ...apiReducers,
});
```

Then please import middleware from redux-api-call and put it to your redux middleware stack

```js
// configStore.js
import { createStore, applyMiddleware } from 'redux';
import { middleware as apiMiddleware } from 'redux-api-call';

const middlewares = applyMiddleware(
  apiMiddleware
  // ... other middlewares (thunk, promise, etc.)
);
const store = createStore(rootReducer, {}, middlewares);
```

Most importantly, define your API. The simplest form only requires an endpoint

```js
// state.js
import { makeFetchAction } from 'redux-api-call'
import { createSelector } from 'reselect'
import { flow, get, filter } from 'lodash/fp'

export const todoAPI = makeFetchAction('FETCH_TODOS', () => ({ endpoint: '/api/v1/todos' });

export const todosSelector = flow(todoAPI.dataSelector, get('todos'));
export const completeTodosSelector = createSelector(todosSelector, filter(todo => todo.complete));
export const incompleteTodosSelector = createSelector(todosSelector, filter(todo => !todo.complete));
```

And that's it. Now you have a bunch of action creators and selectors. You can use them anywhere you want.
The following code is an example of using redux-api-call and react-redux

```js
// example usage with react
// component.jsx
import react from 'react';
import { connect } from 'react-redux';
import { todoAPI } from './state';

// destructuring for better readability
const {
  fetchTodos,
  isFetchingSelector,
  completeTodosSelector,
  incompleteTodosSelector,
  errorSelector,
  lastResponseSelector,
} = todoAPI;

const connectToRedux = connect(
  state => ({
    loading: isFetchingSelector(state),
    error: errorSelector(state),
    completeTodos: completeTodosSelector(state),
    incompleteTodos: incompleteTodosSelector(state),
    lastResponse: lastResponseSelector(state),
  }),
  {
    fetchTodos,
  }
);

class TodosComponent extends React.Component {
  componentDidMount() {
    // first fetch
    this.props.fetchTodos();
  }

  render() {
    const { loading, error, completeTodos, incompleteTodos } = this.props;

    return <div>{/* ... your markup ...*/}</div>;
  }
}

export default connectToRedux(TodosComponent);
```

# API

[**Detailed API Reference**](https://github.com/tungv/redux-api-call/wiki/API-Reference)

# FAQ

**1. Can I use this without react?**

**Yes**, wherever you can use redux, you can use redux-api-call

**2. Can I use this with jQuery's $.ajax?**

**Yes**, `redux-api-call` comes with a default adapter that fetch data using HTML5 FetchAPI and try to parse the response as JSON text. If the response is not a valid JSON, it will fall back to raw text.
Advanced topics like [Customer Adapters](https://github.com/tungv/redux-api-call/wiki/Custom-Adapter) will show you how to use virtually any kind of request agent, include raw XHR to `axios`.

**3. My backend send XML instead of JSON, can I use this package?**

**Yes**, advanced topics like [Customer Adapters](https://github.com/tungv/redux-api-call/wiki/Custom-Adapter) will show you how to add custom parser to your response. So your backend can send JSON, XML, or any custom content-type of your choice.

**4. I need to add a header for authentication on every request, can I write it once and use it everywhere?**

**Yes**, advanced topics like [Customer Adapters](https://github.com/tungv/redux-api-call/wiki/Custom-Adapter) will show you how to add any kind of interceptors to your outgoing request. You can even access to redux store anytime you want to receive data before sending to your backend.
