import { MessageType } from '../common/types';
import { childPort, initQueryChangedListener, initSearchOptionsChangedListener, setupChildPort } from './messageHub';
import { SearchSidebar } from './SearchSidebar'
import ReactDOM from 'react-dom/client'

setupChildPort();
initQueryChangedListener();
initSearchOptionsChangedListener();
childPort.postMessage(MessageType.WebViewInited, {}); //


const App = () => {
  return <SearchSidebar />
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<App />)
