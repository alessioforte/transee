import React from 'react'
import { render } from 'react-dom'
import App from './app'
import { Provider } from 'react-redux'
import { store } from '../redux/store'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

const Transee = () => (
  <MuiThemeProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </MuiThemeProvider>
)

render(
  <Transee />,
  document.getElementById('root')
)
