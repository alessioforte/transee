import React, { Component } from 'react'
import { langsFrom } from '../../google-translate/langs'
import { connect } from 'react-redux'
import LanguagesBar from './languages-bar'
import Response from './response'
import './css/app.css'
import {
  updateSgt,
  updateTSgt,
  speedFrom,
  speedTo,
  setFromLang,
  setToLang,
  setFromActive,
  setToActive,
  setToBar,
  setFromBar,
  setError } from '../redux/actions'
import {
  searchTranslation,
  playAudio,
  getToPosition,
  setMainWindowSize,
  createObservableOnInput } from './services'

const mapStateToProps = ({ langs, obj, suggest, speed, dropdown, error, fromBar, toBar }) => {
  return ({ langs, obj, suggest, speed, dropdown, error, fromBar, toBar })
}

const mapDispatchToProps = dispatch => ({
  updateSgt: sgt => dispatch(updateSgt(sgt)),
  updateTSgt: t_sgt => dispatch(updateTSgt(t_sgt)),
  speedFrom: speed => dispatch(speedFrom(speed)),
  speedTo: speed => dispatch(speedTo(speed)),
  setError: isErr => dispatch(setError(isErr)),
  setToLang: lang => dispatch(setToLang(lang)),
  setFromLang: lang => dispatch(setFromLang(lang)),
  setFromBar: (from, i) => dispatch(setFromBar(from, i)),
  setToBar: (to, i) => dispatch(setToBar(to, i)),
  setFromActive: active => dispatch(setFromActive(active)),
  setToActive: active => dispatch(setToActive(active))
})

class App extends Component {

  constructor() {
    super()
    this.hideSuggest = this.hideSuggest.bind(this)
  }

  componentDidMount() {
    createObservableOnInput()
    this.input.focus()
  }

  componentDidUpdate() {
    setMainWindowSize()
  }

  resizeTextarea() {
    this.input.style.height = '66px'
    this.input.style.height = this.input.scrollHeight + 'px'
  }

  onInputChange(e) {
    this.resizeTextarea()
    setMainWindowSize()

    let text = e.target.value

    if (!text || /^\s*$/.test(text)) {
      this.props.setError(false)
      this.autocomplete.value = ''
      e.target.setAttribute('pasted', '0')
    }
  }

  onInputPaste(e) {
    e.target.setAttribute('pasted', '1')
  }

  handleKeydown(e) {
    var keyCode = e.keyCode

    if (this.props.suggest && this.props.suggest.sgt && this.props.suggest.sgt.length !== 0) {
      let children = this.suggest ? this.suggest.children : null
      let length =  children ? children.length : null

      if (keyCode === 9 && this.props.suggest.sgt.length) {
        e.preventDefault()
        let from = this.props.langs.from
        let to = this.props.langs.to
        this.input.value = this.props.suggest.sgt[0]
        this.autocomplete.value = ''
        searchTranslation(this.props.suggest.sgt[0])
      }

      if (keyCode === 27 || keyCode === 13) {
        e.stopPropagation()
        for (let i = 0; i < length; i++) {
          if (children[i].className === 'sgt on-sgt') e.preventDefault()
        }
        this.props.updateSgt(null)
        this.props.updateTSgt(null)
        this.autocomplete.value = ''
      }

      if (keyCode !== 40 && keyCode !== 38) {
        for (let i = 0; i < length; i++) {
          children[i].className = 'sgt'
        }
      }

      if (keyCode === 40 || keyCode === 38) {
        this.autocomplete.value = ''
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

        let from = this.props.langs.from
        let to = this.props.langs.to
        this.input.value = text
        searchTranslation(text)
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
    this.input.value = text
    let from = this.props.langs.from
    let to = this.props.langs.to
    searchTranslation(text)

    this.props.speedFrom(false)
    this.props.speedTo(false)
    this.props.updateSgt(null)
    this.props.updateTSgt(null)
  }

  handleClickOnPlayIcon() {
    let text = this.input.value
    let lang = this.props.langs.from
    let speed = this.props.speed.from
    playAudio(text, lang, speed)
    this.props.speedFrom(!speed)
    this.input.focus()
    document.removeEventListener('click', this.hideSuggest)
  }

  handleClickOnDYM(text) {
    this.input.value = text
    searchTranslation(text)
  }

  handleClickOnISO(from) {
    let text = this.input.value
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

    searchTranslation(text)
  }

  hideSuggest() {
    this.props.updateSgt(null)
    this.props.updateTSgt(null)
    this.autocomplete.value = ''
    document.removeEventListener('click', this.hideSuggest)
  }

  renderSuggest() {
    var s = this.props.suggest
    if (s && s.sgt && s.t_sgt) {
      var suggestions = []

      for (let i = 0; i < s.sgt.length; i++) {
        if (i === 4) break
        let item = (
          <div
            key={i}
            className='sgt'
            onMouseEnter={(e) => this.handleMouseEnterOnSuggest(e, i)}
            onMouseLeave={(e) => this.handleMouseLeaveOnSuggest(e, i)}
            onClick={(e) => this.handleClickOnSuggest(e, s.sgt[i])}
          >
            <div>{s.sgt[i]}</div>
            <div>{s.t_sgt[i]}</div>
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

  renderIcons() {
    if (this.props.obj) {
      return (
        <div>
          <div
            className='audio'
            onClick={() => this.handleClickOnPlayIcon()}
          >
            <svg
              className="play"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 351.54 392.52"
            ><path d="M484.21,305.42L192.29,472c-23.28,13.29-42.15,2.33-42.15-24.48V115.24c0-26.81,18.87-37.77,42.15-24.48L484.21,257.32C507.49,270.6,507.49,292.14,484.21,305.42Z" transform="translate(-150.13 -85.11)"/>
            </svg>
          </div>
        </div>
      )
    }
  }

  renderResponse() {
    if (this.props.obj) {
      return (
        <Response />
      )
    } else return null
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
    var c = this.props.obj ? this.props.obj.correction : null

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
    return (
      <div>
        <LanguagesBar />
        <div style={{ display: this.props.dropdown ? 'none' : 'block' }}>
          <textarea
            id='autocomplete'
            ref={autocomplete => this.autocomplete = autocomplete}
            type='text'
            disabled={true}
          />
          <div className='inputContainer'>
            <textarea
              className={window.navigator.platform === 'MacIntel' ? '' : 'noScroll'}
              id='input'
              ref={input => this.input = input}
              type='text'
              placeholder='Translate'
              maxLength={5000}
              onPaste={e => this.onInputPaste(e)}
              onChange={e => this.onInputChange(e)}
              onKeyDown={e => this.handleKeydown(e)}
            />
            <div className='icons'>
              { this.renderIcons() }
            </div>
          </div>
          <div>
            { this.renderError() }
            { this.renderDidYouMean() }
            { this.renderSuggest() }
            { this.renderResponse() }
          </div>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
