import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { langsFrom } from '../../google-translate/langs'
import {
    setText,
    resetTranslate,
    getTranslation,
    setFromLang,
    setToLang,
    setFromActive,
    setToActive,
    setToBar,
    setFromBar } from './actions'
import { getToPosition } from './utils'

class DidYouMean extends Component {

    handleClickOnDYM(text) {
        this.props.setText(text)
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
    
        this.props.resetTranslate()
        this.props.getTranslation(text, { from, to })
    }

    render() {
        var c =this.props.translate.data ? this.props.translate.data.correction : null

        if (c && (c.text.autoCorrected || c.language.didYouMean || c.text.didYouMean)) {

            return (
                <Container>
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
                </Container>
            )
        } else return null
    }
}

const mapStateToProps = ({ text, fromBar, toBar, langs, translate }) => ({
    text,
    fromBar,
    toBar,
    langs,
    translate
})

const mapDispatchToProps = dispatch => ({
    setText: text => dispatch(setText(text)),
    resetTranslate: () => dispatch(resetTranslate()),
    getTranslation: (text, langs) => dispatch(getTranslation(text, langs)),
    setToLang: lang => dispatch(setToLang(lang)),
    setFromLang: lang => dispatch(setFromLang(lang)),
    setFromBar: (from, i) => dispatch(setFromBar(from, i)),
    setToBar: (to, i) => dispatch(setToBar(to, i)),
    setFromActive: active => dispatch(setFromActive(active)),
    setToActive: active => dispatch(setToActive(active)),
    
})

export default connect(mapStateToProps, mapDispatchToProps)(DidYouMean)

const Container = styled.div`
    font-size: 14px;
    color: #999;
    padding: 6px 18px;
    cursor: default;
    p {
        margin: 0;
    }
    i {
        color: #0077B5;
        transition: all 0.1s ease-out;
    }
    i:hover {
        color: #00AFF0;
    }
    i:active {
        color: #333;
    }
`