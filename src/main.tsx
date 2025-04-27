import {ReactNode, StrictMode} from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import {Provider} from "mobx-react";
import appStore from './store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider appStore={appStore}>
        <App />
    </Provider>
  </StrictMode> as ReactNode,
)