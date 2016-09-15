# make-fetch-action
Redux utilities for API calls using fetch

# The goals
One command to create reducers, action creators and selectors for JSON API calls

# Proposed interface

```js
makeFetchAction = (
  apiName: string,
  endpointFactory: (args: any) => ReduxStandardAPICallingAction,
  selectors: ?SelectorDescriptor,
) => {
  actionCreator: (args: any) => FluxStandardAction,
  isFetchingSelector: (state: object) => boolean,
  dataSelector: (state: object) => any,
  errorSelector: (state: object) => any,
  ...otherSelectors: {
    [key: string]: (state: object) => any,
  },
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
  dataSelector,
  errorSelector,
  latestTodoSelector,
  incompleteTodosSelector,
} = makeFetchAction(
  'SAMPLE_API',
  () => ({
    endpoint: '/api/v1/todos',
    method: 'GET',
    headers: {
      accept: 'application/json',
    },
  }),
  // selectors
  {
    latestTodo: data => data.todos[0],
    incompleteTodos: data => data.todos.filter(todo => !todo.complete),
  }
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

const store = createStore(rootReducer, {}, applyMiddleware(apiMiddleware));

// state.js
import { makeFetchAction } from 'redux-api-call'

const {
  actionCreator: fetchTodos,
  isFetchingSelector,
  errorSelector,
  completeTodosSelector,
  incompleteTodosSelector
} = makeFetchAction('FETCH_TODOS', () => ({
  endpoint: '/api/v1/todos'
}, {
  completeTodos: data => data.todos.filter(todo => todo.complete),
  incompleTodos: data => data.todos.filter(todo => !todo.complete),
})

export { fetchTodos, isFetchingSelector, completeTodosSelector, incompleteTodosSelector, errorSelector }

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



