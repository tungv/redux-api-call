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
  [selectorName: string]: (apiResponseBody: any) => any
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
  incompletedTodosSelector,
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
    incompletedTodos: data => data.todos.filter(todo => !todo.completed),
  }
);
```
