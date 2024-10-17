import { initQueryChangedListeners } from './hooks/useQuery';
import { setupChildPort } from './messageHub';
import { SearchSidebar } from './SearchSidebar'
import ReactDOM from 'react-dom/client'

setupChildPort();
initQueryChangedListeners();

const App = () => {
  return <SearchSidebar />
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
