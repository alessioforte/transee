import React from 'react'
import { render } from 'react-dom'
import App from './app'
import { Provider } from 'react-redux'
import store from './store'
import sagas from './sagas'

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
