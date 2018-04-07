import React, { Component } from 'react'
import { langsFrom } from '../../google-translate/langs'
import { connect } from 'react-redux'
import LanguagesBar from './languages-bar'
import Response from './response'
import { Speaker } from '../svg/speaker'
import './css/app.css'
import {
    setText,
    setAutocomplete,
    getTranslation,
    getHints,
    resetHints,
    resetTranslate,
    resetSpeed,
    speedFrom,
    speedTo,
    setFromLang,
    setToLang,
    setFromActive,
    setToActive,
    setToBar,
    setFromBar,
    setError } from './actions'
import {
    playAudio,
    getToPosition,
    setMainWindowSize } from './utils'
import Textarea from './textarea'
import Suggestions from './suggestions'

import store from './store'

class App extends Component {

    constructor() {
        super()
    }

    componentDidUpdate() {
        setMainWindowSize()
    }

    handleClickOnPlayIcon() {
        let text = this.props.text
        let lang = this.props.langs.from
        let speed = this.props.speed.from
        playAudio(text, lang, speed)
        this.props.speedFrom(!speed)
        document.removeEventListener('click', this.hideSuggest)
    }

    handleClickOnDYM(text) {
        this.props.setText(text)
        this.props.setAutocomplete('')
        this.props.resetTranslate()
        this.props.getTranslation(text, this.props.langs)
    }

    handleClickOnISO(from) {
        let text = this.props.text
        let to = this.props.langs.to
        let oldFrom = this.props.langs.from

        this.props.setFromLang(from)

        switch (from) {
            case this.props.fromBar.from1:
                this.props.setFromActive([true, false, false])
                break
            case this.props.fromBar.from2:
                this.props.setFromActive([false, true, false])
                break
            case this.props.fromBar.from3:
                this.props.setFromActive([false, false, true])
                break
            default:
                this.props.setFromBar(from, 2)
                this.props.setFromActive([false, false, true])
        }

        if (from === this.props.langs.to) {
            let toPos = getToPosition(oldFrom)

            if (!toPos) {
                this.props.setToBar(oldFrom, 2)
            } else {
                this.props.setToActive(toPos)
            }
            to = oldFrom
            this.props.setToLang(oldFrom)
        }

        this.props.setAutocomplete('')
        this.props.resetTranslate()
        this.props.getTranslation(text, { from, to })
    }

    renderIcons() {
        if (this.props.translate.data) {
            return (
                <div
                    onClick={() => this.handleClickOnPlayIcon()}
                >
                    <Speaker />
                </div>
            )
        }
    }

    renderError() {
        if (this.props.error) {
            return (
                <div className='error'>
                    {'Sorry I can\'t translate!'}
                </div>
            )
        }
    }

    renderDidYouMean() {
        var c = this.props.translate.data ? this.props.translate.data.correction : null

        if (c && (c.text.autoCorrected || c.language.didYouMean || c.text.didYouMean)) {

            return (
                <div className='didYouMean'>
                    {
                        c.text.value ?
                        <p>Did you mean <i onClick={() => this.handleClickOnDYM(c.text.value)}
                        >{c.text.value}</i></p> : null
                    }
                    {
                        c.language.iso !== this.props.langs.from ?
                        <p>Translate from <i onClick={() => this.handleClickOnISO(c.language.iso)}
                        >{langsFrom[c.language.iso]}</i></p> : null
                    }
                </div>
            )
        }
    }

    render() {
        console.log(store.getState())
        return (
            <div>
                <LanguagesBar />
                <div style={{ display: this.props.dropdown ? 'none' : 'block' }}>
                    <Textarea />
                    <div className='icons'>
                        { this.renderIcons() }
                    </div>
                    { this.renderError() }
                    { this.renderDidYouMean() }
                    <Suggestions />
                    { this.props.translate.data && <Response /> }
                </div>
            </div>
        )
    }
}

const mapStateToProps = ({ langs, speed, dropdown, error, fromBar, toBar, translate, text }) => ({
    langs,
    speed,
    dropdown,
    error,
    fromBar,
    toBar,
    translate,
    text
})

const mapDispatchToProps = dispatch => ({
    setText: text => dispatch(setText(text)),
    setAutocomplete: hint => dispatch(setAutocomplete(hint)),
    getTranslation: (text, langs) => dispatch(getTranslation(text, langs)),
    speedFrom: speed => dispatch(speedFrom(speed)),
    speedTo: speed => dispatch(speedTo(speed)),
    setError: isErr => dispatch(setError(isErr)),
    setToLang: lang => dispatch(setToLang(lang)),
    setFromLang: lang => dispatch(setFromLang(lang)),
    setFromBar: (from, i) => dispatch(setFromBar(from, i)),
    setToBar: (to, i) => dispatch(setToBar(to, i)),
    setFromActive: active => dispatch(setFromActive(active)),
    setToActive: active => dispatch(setToActive(active)),
    resetHints: () => dispatch(resetHints()),
    resetTranslate: () => dispatch(resetTranslate()),
    resetSpeed: () => dispatch(resetSpeed())
})

export default connect(mapStateToProps, mapDispatchToProps)(App)
