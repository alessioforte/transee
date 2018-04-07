import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import {
    setText,
    setAutocomplete,
    setError,
    getHints,
    resetHints,
    getTranslation,
    resetTranslate,
    resetSpeed
} from './actions'

class Textarea extends Component {

    constructor() {
        super()

        this.state = {
            showAutocomplete: false
        }
    }

    resizeTextarea() {
        this.input.style.height = '60px'
        this.input.style.height = this.input.scrollHeight + 'px'
    }

    componentDidMount() {
        this.input.focus()
    }

    componentDidUpdate() {
        this.input.focus()
    }

    onInputChange(e) {
        this.resizeTextarea()

        let text = e.target.value
        let langs = this.props.langs

        this.props.setText(text)

        var textCameFromPaste = ((e.target.getAttribute('pasted') || '') === '1')
        if (!textCameFromPaste) this.props.getHints(text, langs)

        let isUppercase = /[A-Z]/.test(text)
        let hasDoubleSpace = /\s\s+/.test(text)

        if (!text || isUppercase || hasDoubleSpace || text[0] === ' ') {
            this.setState({ showAutocomplete: false })
            this.props.setError(false)
        } else {
            this.setState({ showAutocomplete: true })
        }

        this.props.getTranslation(text, langs)
    }

    onInputPaste(e) {
        e.target.setAttribute('pasted', '1')
    }

    render() {
        return (
            <Container>
                {
                    this.state.showAutocomplete &&
                    <Autocomplete
                        type='text'
                        disabled
                        value={this.props.translate.autocomplete}
                    />
                }
                <Input
                    type='text'
                    placeholder='Translate'
                    maxLength={5000}
                    innerRef={input => this.input = input}
                    value={this.props.text}
                    onPaste={e => this.onInputPaste(e)}
                    onChange={e => this.onInputChange(e)}
                />
            </Container>
        )
    }
}

const Container = styled.div`
    position: relative;
    display: flex;
    overflow: hidden;
    width: 100%;
`
const Input = styled.textarea`
    box-sizing: border-box;
    padding: 18px 44px 18px 18px;
    height: 60px;
    width: 100%;
    max-height: 300px;
    font-size: 18px;
    border: 0;
    background: none;
    resize: none;
    color: white;
    &:focus {
        outline: none;
    }
`
const Autocomplete = Input.extend`
    position: absolute;
    color: #555;
    z-index: -1;
`

const mapStateToProps = ({ text, langs, translate }) => ({
    text,
    langs,
    translate
})

const mapDispatchToProps = dispatch => ({
    getHints: (text, langs) => dispatch(getHints(text, langs)),
    getTranslation: (text, langs) => dispatch(getTranslation(text, langs)),
    resetHints: () => dispatch(resetHints()),
    resetTranslate: () => dispatch(resetTranslate()),
    resetSpeed: () => dispatch(resetSpeed()),
    setText: text => dispatch(setText(text)),
    setAutocomplete: hint => dispatch(setAutocomplete(hint)),
    setError: isErr => dispatch(setError(isErr))
})

export default connect(mapStateToProps, mapDispatchToProps)(Textarea)
