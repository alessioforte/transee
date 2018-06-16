import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    setText,
    setAutocomplete,
    getTranslation,
    resetSpeed,
    resetHints
} from './actions'

class Suggestions extends Component {

    constructor() {
        super()

        this.handleKeydown = this.handleKeydown.bind(this)
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeydown)
    }

    handleKeydown(e) {
        let keyCode = e.keyCode
        let hints = this.props.translate.hints[0]
        let langs = this.props.langs

        if (hints && hints.length !== 0) {
            let children = this.suggest ? this.suggest.children : null
            let length = children ? children.length : null

            if (keyCode === 9 && hints.length) {
                e.preventDefault()
                this.props.setText(hints[0])
                this.props.getTranslation(hints[0], langs)
            }

            if (keyCode === 27 || keyCode === 13) {
                e.stopPropagation()
                for (let i = 0; i < length; i++) {
                    if (children[i].className === 'sgt on-sgt') e.preventDefault()
                }
                this.props.resetHints()
                this.props.setAutocomplete('')
            }

            if (keyCode !== 40 && keyCode !== 38) {
                for (let i = 0; i < length; i++) {
                    children[i].className = 'sgt'
                }
            }

            if (keyCode === 40 || keyCode === 38) {
                let text, index = null

                for (let i = 0; i < length; i++) {
                    if (children[i].className === 'sgt on-sgt') index = i
                }

                if (keyCode === 40) {
                    if (index === null) {
                        children[0].className = 'sgt on-sgt'
                        text = children[0].firstChild.innerHTML
                    } else {
                        let x = (index + 1) % length
                        children[x].className = 'sgt on-sgt'
                        children[index].className = 'sgt'
                        text = children[x].firstChild.innerHTML
                    }
                }

                if (keyCode === 38) {
                    e.preventDefault()
                    if (index === null) {
                        children[length - 1].className = 'sgt on-sgt'
                        text = children[length - 1].firstChild.innerHTML
                    } else {
                        let x = (index + length - 1) % length
                        children[x].className = 'sgt on-sgt'
                        children[index].className = 'sgt'
                        text = children[x].firstChild.innerHTML
                    }
                }

                this.props.setText(text)
                this.props.getTranslation(text, langs)
                this.props.setAutocomplete('')
            }
        }
    }

    handleMouseEnterOnSuggest(e, i) {
        let children = this.suggest.children
        for (let j = 0; j < children.length; j++) {
          children[j].className = 'sgt'
        }
        this.suggest.children[i].className = 'sgt on-sgt'
    }
    
    handleMouseLeaveOnSuggest(e, i) {
        this.suggest.children[i].className = 'sgt'
    }
    
    handleClickOnSuggest(e, text) {

        this.props.setText(text)
        this.props.getTranslation(text, this.props.langs)
    
        this.props.resetSpeed()
        this.props.resetHints()
    }

    renderSuggest() {
        let hints = this.props.translate.hints
        if (hints[0]) {
            var suggestions = []
    
            for (let i = 0; i < hints[0].length; i++) {
                if (i === 4) break
                let item = (
                    <div
                        key={i}
                        className='sgt'
                        onMouseEnter={(e) => this.handleMouseEnterOnSuggest(e, i)}
                        onMouseLeave={(e) => this.handleMouseLeaveOnSuggest(e, i)}
                        onClick={(e) => this.handleClickOnSuggest(e, hints[0][i])}
                    >
                        <div>{hints[0][i]}</div>
                        <div>{hints[1][i]}</div>
                    </div>
                )
                suggestions.push(item)
            }
            document.addEventListener('click', this.hideSuggest)
    
            return (
                <div ref={suggest => this.suggest = suggest}>
                    {suggestions}
                </div>
            )
            } else return null
      }

    
    render() {
        return (
            <div>
                {
                    this.renderSuggest()
                }
            </div>
        )
    }
}

const mapStateToProps = ({ langs, translate }) => ({ langs, translate })

const mapDispatchToProps = dispatch => ({
    setText: text => dispatch(setText(text)),
    setAutocomplete: hint => dispatch(setAutocomplete(hint)),
    getTranslation: (text, langs) => dispatch(getTranslation(text, langs)),
    resetSpeed: () => dispatch(resetSpeed()),
    resetHints: () => dispatch(resetHints())
})

export default connect(mapStateToProps, mapDispatchToProps)(Suggestions)
