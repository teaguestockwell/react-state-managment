import {render, screen} from '@testing-library/react'
import {useState} from 'react'

const Runner = () => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}

it('renders', () => {
  render(<Runner />)
  expect(screen.getByText('0')).toBeInTheDocument()
  expect(screen.getByText('+')).toBeInTheDocument()
})

it('increments the count 1000x', () => {
  render(<Runner />)
  for (let i = 0; i < 1000; i++) {
    screen.getByText('+').click()
  }
  expect(screen.getByText('1000')).toBeInTheDocument()
})