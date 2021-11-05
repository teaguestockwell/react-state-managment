A place to test a few state management solutions for react like:

- useState / useState + Context
- zustand
- redux / rtk
- react-query

## Use State / Use State + Context
State that is scoped to one instance of a component's lifecycle

Some places use state may be a good idea:
- It is client state
- It is only consumed by one component
- It should not be persisted after a component unmounts
- It needs to be immediately available

Some places context may be a good solution:
- It is client state
- It should not be persisted after a component unmounts
- It needs to be immediately available
- It is consumed by many components
- It is infrequently updated
- It needs to be injected through the react component tree
- It needs to be scoped to a section of the component tree
## Zustand and Redux
- It is client state
- It needs to be persisted after a component unmounts
- It is consumed by many components
- It uses a object state that only needs to cause rerenders only when a specific one of its values changes
- It uses a object state that only needs to cause rerenders only when a specific one of its values changes based on a custom equality function
- It is more complex client state where redux dev tools would be helpful for time travel debugging
- It needs a centralized palace to be mutated

## Zustand vs Redux
Zustand is similar to redux because they are both global stores that can be consumed in components using:
- selectors
- selectors with equality functions 
- reducers
- redux dev tools

In general Zustand is less opinionated because:
- It can be used with or without context
- It can have one giant store like redux or many smaller stores
- It can be implemented with or without reducers and dispatch functions