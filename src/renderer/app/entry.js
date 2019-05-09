import React from 'react'
import { render } from 'react-dom'
import App from './app'
import { Provider } from 'react-redux'
import store from './store'
import sagas from './sagas'
import { createGlobalStyle } from 'styled-components'
import './css/app.css'

const GlobalStyle = createGlobalStyle`
    * {
        font-family: 'Nunito', sans-serif;
        font-weight: 300;
    }

    *::-webkit-scrollbar {
        display: ${window.navigator.platform === 'MacIntel' ? '' : 'none'}
    }
`

store.runSaga(sagas)

const Transee = () => (
    <Provider store={store}>
        <GlobalStyle/>
        <App />
    </Provider>
)

render(
    <Transee />,
    document.getElementById('root')
)
