import {screen, render} from '@testing-library/react'
import create from 'zustand'
import {combine, devtools} from 'zustand/middleware'

interface State {
  count: number
  increment: (by: number) => void
  reset: () => void
}

const useStore = create<State>(set => ({
  count: 0,
  increment: (by) => set(state => ({ count: state.count + by })),
  reset: () => set(state => ({ count: 0 })),
}))

const useStoreInferTypes = create(
  combine(
    {
      count: 0 as number | undefined,
    },
    set => ({
      increment: (by:number) => set(state => ({ count: state.count ?? 0 + by })),
      reset: () => set(state => ({ count: 0 })),
    })
  )
)

const storeWithInferedTypesPlusDevTools = create(
  devtools(
    combine(
      {
        count: 0 as number | undefined,
      },
      set => ({set})
    ),
    {name: 'with redux dev tools'}
  )
)

describe('zustand counter', () => {
  beforeEach(() => {
    useStore.getState().reset()
  })
  
  const App = () => {
    const { count, increment } = useStore()
    return (
      <div>
        <p>{count}</p>
        <button onClick={() => increment(1)}>+</button>
      </div>
    )
  }

  it('renders', () => {
    render(<App />)
      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText('+')).toBeInTheDocument()
    })
    
    it('increments the count 1000x', () => {
      render(<App />)
      for (let i = 0; i < 1000; i++) {
        screen.getByText('+').click()
      }
      expect(screen.getByText('1000')).toBeInTheDocument()
    })
    
    const App2 = () => {
      const inc = useStore(state => state.increment)
      return (
        <div>
        <p>{useStore.getState().count}</p>
        <button onClick={() => inc(1)}>+</button>
      </div>
    )
  }

  it('selecting actions will not cause a rerender', () => {
    render(<App2 />)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('+')).toBeInTheDocument()
    screen.getByText('+').click()
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})