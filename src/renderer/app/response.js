import React, { Component } from 'react'
import { connect } from 'react-redux'
import { speedTo } from './actions'
import { playAudio } from './utils'
import { Speaker } from '../svg/speaker'
import './css/response.css'

class Response extends Component {

  componentDidMount() {
    this.resizeTextarea()
  }

  componentDidUpdate() {
    this.resizeTextarea()
  }

  resizeTextarea() {
    if (this.textarea) {
      this.textarea.style.height = '60px'
      this.textarea.style.height = this.textarea.scrollHeight + 'px'
    }
  }

  handleClickOnPlayIcon() {
    let text = this.props.translate.data.translation
    let lang = this.props.langs.to
    let speed = this.props.speed.to
    playAudio(text, lang, speed)
    this.props.speedTo(!speed)
  }

  renderPronunciation() {
    let data = this.props.translate.data
    if (data && data.pronunciation) {
      return <div className='pronunciation'>{data.pronunciation}</div>
    } else return null
  }

  renderTanslation() {
    let data = this.props.translate ? this.props.translate.data : null
    if (data) {
      return (
        <div className='t_box'>
          <textarea
            ref={textarea => this.textarea = textarea}
            id='translation'
            type='text'
            value={data.translation}
            disabled={true}
          />
          <div className='icons'>
            <div onClick={() => this.handleClickOnPlayIcon()}>
              <Speaker />
            </div>
          </div>
        </div>
      )
    } else return null
  }

  renderDefinitionsOf() {
    let data = this.props.translate.data
    if (data && data.definitions) {
      var types = data.definitions.map((definition, i) => {
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
            {'Definitions of '}<span className='span'>{data.target}</span>
          </div>
          {types}
        </div>
      )
    } else return null
  }

  renderSynonyms() {
    let data = this.props.translate.data
    if (data && data.synonyms) {
      var types = data.synonyms.map((synonym, i) => {
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
    let data = this.props.translate.data
    if (data && data.examples) {
      var examples = data.examples.map((example, i) => {
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
    let data = this.props.translate.data
    if (data && data.translations) {
      var types = data.translations.map((translation, i) => {
        var sections = translation.content.map((section, j) => {
          return (
            <div key={j} className='obj'>
              <div className='left-box'>
                <div className='rating'>
                  <div className={'bar ' + section.bar}></div>
                </div>
                { section.article && <div className='article'>{section.article}</div> }
                <div className='word'>{section.word}</div>
              </div>
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
            {'Translations of '}<span className='span'>{data.target}</span>
          </div>
          {types}
        </div>
      )
    } else return null
  }

  renderSeeAlso() {
    let data = this.props.translate.data
    if (data && data.seeAlso) {
      return (
        <div className='seeAlso'>
          <div className='header'>See Also</div>
          <div className='content'>
            <div>{data.seeAlso.join(', ')}</div>
          </div>
        </div>
      )
    } else return null
  }

  render() {
    return (
      <div className='response'>
        <div className='block'>
          {this.renderPronunciation()}
          {this.renderTanslation()}
        </div>
        <div className='scroll'>
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

const mapStateToProps = ({ langs, translate, speed }) => ({ langs, translate, speed })

const mapDispatchToProps = dispatch => ({
  speedTo: speed => dispatch(speedTo(speed))
})

export default connect(mapStateToProps, mapDispatchToProps)(Response)
