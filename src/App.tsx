import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { queryClient } from './lib/queryClient'
import { TeamProvider } from './context/TeamContext'
import { TeamSidebar } from './components/TeamSidebar'
import { AppRoutes } from './routes'
import './App.css'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TeamProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col lg:flex-row gap-4 p-4 mx-auto">
              {/* Team Sidebar - Always visible, sticky when scrolling */}
              <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
                <TeamSidebar />
              </aside>
              
              {/* Main Content Area */}
              <main className="flex-1 min-w-0">
                <AppRoutes />
              </main>
            </div>
          </div>
        </TeamProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
