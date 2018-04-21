import React, { Component } from 'react'
import { connect } from 'react-redux'
import LanguagesBar from './languages-bar'
import Response from './response'
import { setMainWindowSize } from './utils'
import Textarea from './textarea'
import Suggestions from './suggestions'
import Error from './error'
import DidYouMean from './did-you-mean'

class Resize extends Component {

    componentDidUpdate() {
        setMainWindowSize()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.translate !== this.props.translate || nextProps.error
    }

    render() {
        return (
            <div style={{ display: this.props.dropdown ? 'none' : 'block' }}>
                <Textarea />
                <Error />
                <DidYouMean />
                <Suggestions />
                <Response />
            </div>
        )
    }
}

const mapStateToProps = ({ dropdown, translate, error }) => ({ dropdown, translate, error })

Resize = connect(mapStateToProps)(Resize)

export default () => (
    <React.Fragment>
        <LanguagesBar />
        <Resize />
    </React.Fragment>
)
