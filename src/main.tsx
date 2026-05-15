import { createRoot } from 'react-dom/client'

import App from './App.tsx'

import '@fontsource/pretendard/400.css'
import '@fontsource/pretendard/500.css'
import '@fontsource/pretendard/700.css'
import './index.css'

const shouldEnableMsw =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === 'true'

async function enableMocking() {
  if (!shouldEnableMsw) {
    return
  }

  const { worker } = await import('./mocks/browser.ts')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(<App />)
})
