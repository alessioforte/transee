import React, { Component } from 'react'
import { connect } from 'react-redux'
import { speedTo } from '../../redux/actions'
import { playAudio } from '../services'
import './css/response.css'

const mapStateToProps = ({ langs, obj, speed }) => ({ langs, obj, speed })

const mapDispatchToProps = dispatch => ({
  speedTo: speed => dispatch(speedTo(speed))
})

class Response extends Component {

  componentDidMount() {
    this.resizeTextarea()
  }

  componentDidUpdate() {
    this.resizeTextarea()
  }

  resizeTextarea() {
    this.textarea.style.height = '66px'
    this.textarea.style.height = this.textarea.scrollHeight + 'px'
  }

  handleClickOnPlayIcon() {
    let text = this.props.obj.translation
    let lang = this.props.langs.to
    let speed = this.props.speed.to
    playAudio(text, lang, speed)
    this.props.speedTo(!speed)
  }

  renderPronunciation() {
    var p
    if (p = this.props.obj.pronunciation) {
      return <div className='pronunciation'>{p}</div>
    } else return null
  }

  renderTanslation() {
    if (this.props.obj.translation) {
      return (
        <div className='t_box'>
          <div className='inputContainer'>
            <textarea
              ref={textarea => this.textarea = textarea}
              id='translation'
              className={window.navigator.platform === 'MacIntel' ? '' : 'noScroll'}
              type='text'
              value={this.props.obj.translation}
              disabled={true}
            />
            <div className='icons'>
              <div
                className='audio'
                onClick={() => this.handleClickOnPlayIcon()}
              >
                <svg
                  className="play"
                  data-name="play"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 351.54 392.52"
                ><path d="M484.21,305.42L192.29,472c-23.28,13.29-42.15,2.33-42.15-24.48V115.24c0-26.81,18.87-37.77,42.15-24.48L484.21,257.32C507.49,270.6,507.49,292.14,484.21,305.42Z" transform="translate(-150.13 -85.11)"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )
    } else return null
  }

  renderDefinitionsOf() {
    var x
    if (x = this.props.obj.definitions) {
      var types = x.map((definition, i) => {
        var sections = definition.content.map((section, j) => {
          return (
            <div key={j} className='section'>
              <div style={{color: '#fff'}}>{section.phrase}</div>
              <div>«{section.instance}»</div>
            </div>
          )
        })
        return (
          <div key={i} className='type'>
            <i>{definition.type}</i>
            {sections}
          </div>
        )
      })
      return (
        <div className='definitions'>
          <div className='header'>
            {'Definitions of '}<span className='span'>{this.props.obj.target}</span>
          </div>
          {types}
        </div>
      )
    } else return null
  }

  renderSynonyms() {
    var x
    if (x = this.props.obj.synonyms) {
      var types = x.map((synonym, i) => {
        var sections = synonym.content.map((section, j) => {
          return (
            <li key={j}>{section.join(', ')}</li>
          )
        })
        return (
          <div key={i} className='type'>
            <i>{synonym.type}</i>
            <ul className='list'>{sections}</ul>
          </div>
        )
      })
      return (
        <div className='synonyms'>
          <div className='header'>Synonyms</div>
          {types}
        </div>
      )
    } else return null
  }

  renderExamples() {
    var x
    if (x = this.props.obj.examples) {
      var examples = x.map((example, i) => {
        return <li key={i} dangerouslySetInnerHTML={{__html: example}} />
      })
      return (
        <div className='examples'>
          <div className='header'>Examples</div>
          <ul>{examples}</ul>
        </div>
      )
    } else return null
  }

  renderTranslationsOf() {
    var x
    if (x = this.props.obj.translations) {
      var types = x.map((translation, i) => {
        var sections = translation.content.map((section, j) => {
          return (
            <div key={j} className='obj'>
              <div className='rating'>
                <div className={'bar ' + section.bar}></div>
              </div>
              { section.article && <div className='article'>{section.article}</div> }
              <div className='word'>{section.word}</div>
              <div className='values'>{section.meaning.join(', ')}</div>
            </div>
          )
        })
        return (
          <div key={i} className='type'>
            <i>{translation.type}</i>
            {sections}
          </div>
        )
      })
      return (
        <div className='translations'>
          <div className='header'>
            {'Translations of '}<span className='span'>{this.props.obj.target}</span>
          </div>
          {types}
        </div>
      )
    } else return null
  }

  renderSeeAlso() {
    let s
    if (s = this.props.obj.seeAlso) {
      return (
        <div className='seeAlso'>
          <div className='header'>See Also</div>
          <div className='content'>
            <div>{s.join(', ')}</div>
          </div>
        </div>
      )
    } else return null
  }

  render() {
    var obj = this.props.obj
    return (
      <div className='response'>
        <div className='block'>
          {this.renderPronunciation()}
          {this.renderTanslation()}
        </div>
        <div
          className={window.navigator.platform === 'MacIntel' ? 'scroll' : 'scroll noScroll'}
        >
          {this.renderTranslationsOf()}
          {this.renderDefinitionsOf()}
          {this.renderSynonyms()}
          {this.renderExamples()}
          {this.renderSeeAlso()}
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Response)
