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
    resetSpeed,
    speedFrom
} from './actions'
import { playAudio, setMainWindowSize } from './utils'
import { Speaker } from '../svg/speaker'
import Loading from './loading'

class Textarea extends Component {

    constructor() {
        super()

        this.timeout = null

        this.state = {
            showAutocomplete: false
        }

        this.input = React.createRef()
    }

    resizeTextarea() {
        this.input.current.style.height = '60px'
        this.input.current.style.height = this.input.current.scrollHeight + 'px'
    }

    componentDidMount() {
        this.input.current.focus()
    }

    componentDidUpdate() {
        this.input.current.focus()
        setMainWindowSize()
    }

    onInputKeyDown(e) {
        window.clearTimeout(this.timeout)
    }

    onInputChange(e) {
        this.resizeTextarea()

        let text = e.target.value
        let langs = this.props.langs

        this.props.setText(text)
        this.props.resetSpeed()

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

        if (!text) return this.props.getTranslation(text, langs)

        this.timeout = window.setTimeout(() => {
            this.props.getTranslation(text, langs)
        }, 600)
    }

    onInputPaste(e) {
        e.target.setAttribute('pasted', '1')
    }

    handleClickOnPlayIcon() {
        let text = this.props.text
        let lang = this.props.langs.from
        let speed = this.props.speed.from
        playAudio(text, lang, speed)
        this.props.speedFrom(!speed)
    }

    render() {
        return (
            <React.Fragment>
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
                        ref={this.input}
                        value={this.props.text}
                        onPaste={e => this.onInputPaste(e)}
                        onChange={e => this.onInputChange(e)}
                        onKeyDown={e => this.onInputKeyDown(e)}
                    />
                    {
                        this.props.loading && <Loading />
                    }
                </Container>
                {
                    this.props.translate.data && (
                        <Icons>
                            <div onClick={() => this.handleClickOnPlayIcon()}>
                                <Speaker />
                            </div>
                        </Icons>
                    )
                }
            </React.Fragment>
        )
    }
}

const mapStateToProps = ({ text, langs, translate, speed, loading }) => ({
    text,
    langs,
    translate,
    speed,
    loading
})

const mapDispatchToProps = dispatch => ({
    getHints: (text, langs) => dispatch(getHints(text, langs)),
    getTranslation: (text, langs) => dispatch(getTranslation(text, langs)),
    resetHints: () => dispatch(resetHints()),
    resetTranslate: () => dispatch(resetTranslate()),
    resetSpeed: () => dispatch(resetSpeed()),
    setText: text => dispatch(setText(text)),
    setAutocomplete: hint => dispatch(setAutocomplete(hint)),
    setError: isErr => dispatch(setError(isErr)),
    speedFrom: speed => dispatch(speedFrom(speed))
})

export default connect(mapStateToProps, mapDispatchToProps)(Textarea)

/**
 * STYLES
 */
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
const Autocomplete = styled(Input)`
    position: absolute;
    color: #555;
    z-index: -1;
`
const Icons = styled.div`
    width: 16px;
    margin: 0 18px 3px;
`