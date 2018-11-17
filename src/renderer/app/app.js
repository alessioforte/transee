import React, { Component } from 'react'
import { connect } from 'react-redux'
import LanguagesBar from './languages-bar'
import Response from './response'
import { setMainWindowSize } from './utils'
import Textarea from './textarea'
import Suggestions from './suggestions'
import ErrorMessage from './error-message'
import DidYouMean from './did-you-mean'

class App extends Component {

    componentDidUpdate() {
        setMainWindowSize()
    }

    render() {
        return (
            <React.Fragment>
                <LanguagesBar />
                <div style={{ display: this.props.dropdown ? 'none' : 'block' }}>
                    <Textarea />
                    <ErrorMessage />
                    <DidYouMean />
                    <Suggestions />
                    <Response />
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = ({ dropdown, translate, error }) => ({ dropdown, translate, error })

export default connect(mapStateToProps)(App)
