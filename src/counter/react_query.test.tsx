import { QueryClientProvider, QueryClient, useQuery, useMutation, useQueryClient } from "react-query"
import { render, screen } from '@testing-library/react'
import React from "react"

class DB {
  counters: Record<string, number>
  
  constructor() {
    this.counters = {'1': 0}
  }
  
  async findCount({pk}: {pk: string}) {
    return this.counters[pk]
  }
  
  async upsertCount({pk, count} :{pk: string, count: number}) {
    this.counters[pk] = count
    return this.counters[pk]
  }

  reset() {
    this.counters = {'1': 0}
  }
}

class API {
  db:DB
  
  constructor(db:DB) {
    this.db = db
  }
  
  async count({method, body, params}: {method: 'put' | 'get' | 'patch', body: any, params: Record<string,string>}) {
    if(method === 'put') {
      return this.db.upsertCount({pk: params.pk, count: body.count})
    } 
    
    if(method === 'get') {
      return this.db.findCount({pk: params.pk})
    }  
    
    if(method === 'patch') {
      const count = await this.db.findCount({pk: params.pk})
      return this.db.upsertCount({pk: params.pk, count: count + body.payload})
    }

  }
  
}

const db = new DB()
const api = new API(db)

const getCount = async () => {
  return api.count({method: 'get', body: {}, params: {pk: '1'}})
}

const patchCount = async (by: number) => {
  return api.count({method: 'patch', body: {payload: by}, params: {pk: '1'}})
}

const useCountQuery = () => {
  return useQuery({
    queryKey: 'count',
    queryFn: getCount,
  })
}

const useMutateCount = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    
    mutationFn: patchCount,
    
    onMutate: async (by) => {
      // cancel outgoing request to not overwrite optimistic update
      await queryClient.cancelQueries('count')
      
      // in this demo it does not matter because the snapshot is a number
      const snapshot = await queryClient.getQueryData('count') as number
      
      // optimistic update
      queryClient.setQueryData('count', () => {
        
        // in real world you would want another object so you dont mutate the snapshot
        const prev = queryClient.getQueryData('count') as number
        
        // optimistic update
        return prev + by
      })
      
      // return a rollback
      return () => {
        queryClient.setQueryData('count', snapshot)
      }
    },
    
    onError: (err, props, rollback: any) => {
      if(rollback){
        rollback()
      }
    },
    
    onSettled: (data, err, props) => {
      // always invalidate to retch after a mutation to make sure the data is up to date
      queryClient.invalidateQueries('count')
    }
    
  })
}

const App = () => {
  const {data: count, status} = useCountQuery()
  const {mutate: increment} = useMutateCount()
  return (
    <div>
      {
        status === 'success' && <>
        <p>{count}</p>
        <button onClick={() => increment(1)}>+</button>
        </>
      }
    </div>
  )
}

const Runner = ({children}: {children: JSX.Element}) => {
  // when sever side rendering, make sure clients are not sharing query cache by creating the query cache client side
  const [client] = React.useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  )
}

describe('react query counter', () => {
  beforeEach(() => {
    db.reset()
  })

  it('renders', async () => {
    render(<Runner><App/></Runner>)
    expect(await screen.findByText('0')).toBeInTheDocument()
    expect(await screen.findByText('+')).toBeInTheDocument()
  })
  
  it('increments the count 1000x', async () => {
    render(<Runner><App/></Runner>)
    for (let i = 0; i < 1000; i++) {
      (await screen.findByText('+')).click()
    }
    expect(await screen.findByText('1000')).toBeInTheDocument()
  })
})
  