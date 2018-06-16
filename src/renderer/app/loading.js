import React, { Component } from 'react'
import styled from 'styled-components'
import Spinner from '../svg/spinner'

export default class Loading extends Component {

    constructor(props) {
        super(props)

        this.state = {
            show: false,
        }

        this.loadingDelay = this.loadingDelay.bind(this)
        this.timer = setTimeout(this.loadingDelay, 250)
    }

    componentWillUnmount() {
        clearTimeout(this.timer)
    }

    loadingDelay() {
        this.setState({ show: true })
    }

    render() {
        const { show } = this.state
        return show ? (
            <Load>
                <Spinner />
            </Load>
        ) : null
    }
}

const Load = styled.div`
    position: absolute;
    right: 18px;
    top: 12px;
`