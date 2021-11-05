import { createSlice, configureStore } from '@reduxjs/toolkit'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { render, screen } from '@testing-library/react'

const counter = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    increment: (state, action)  => {
      state.value += action.payload
    },
    reset: (state) => {
      return {
        value: 0
      }
    }
  }
})

const store = configureStore({
  reducer: {
    counter: counter.reducer
  }
})

const resetStore = () => {
  store.dispatch(counter.actions.reset())
}

type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch

const Runner = ({children}: {children: JSX.Element}) => {
  return <Provider store={store}>
    {children}
  </Provider>
}

describe('counter', () => {
  beforeEach(resetStore)
  
  const App = () => {
    const count = useSelector((s: RootState) => s.counter.value)
    const dispatch: AppDispatch = useDispatch()
    
    return (
      <div>
        <p>{count}</p>
        <button onClick={() => dispatch(counter.actions.increment(1))}>+</button>
      </div>
    )
  }

  it('renders', () => {
    render(<Runner><App/></Runner>)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('+')).toBeInTheDocument()
  })

  it('increments the count 1000x', () => {
    render(<Runner><App/></Runner>)
    for (let i = 0; i < 1000; i++) {
      screen.getByText('+').click()
    }
    expect(screen.getByText('1000')).toBeInTheDocument()
  })

  const App2 = () => {
    const dispatch = useDispatch()
    const count = store.getState().counter.value
    return (
      <div>
        <p>{count}</p>
        <button onClick={() => dispatch(counter.actions.increment(1))}>+</button>
      </div>
    )
  }

  it('dispatching actions does not cause rerender', () => {
    render(<Runner><App2/></Runner>)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('+')).toBeInTheDocument()
    screen.getByText('+').click()
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
