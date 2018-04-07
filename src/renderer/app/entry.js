import React from 'react'
import { render } from 'react-dom'
import App from './app'
import { Provider } from 'react-redux'
import store from './store'
import sagas from './sagas'
import { injectGlobal } from 'styled-components'

store.runSaga(sagas)

const Transee = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

render(
  <Transee />,
  document.getElementById('root')
)

/**
 * Global Styles
 */

injectGlobal`
  * {
    font-family: 'Nunito', sans-serif;
    font-weight: 300;
  }
  
  *::-webkit-scrollbar {
    display: ${window.navigator.platform === 'MacIntel' ? '' : 'none'}
  }
`