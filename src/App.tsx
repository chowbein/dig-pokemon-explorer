import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { queryClient } from './lib/queryClient'
import './App.css'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div>
          <h1>Pokemon Explorer</h1>
          {/* Routes will be added here */}
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
