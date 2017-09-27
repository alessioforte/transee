import React, { Component } from 'react'
import { connect } from 'react-redux'
import { speedTo } from '../../redux/actions'
import { playAudio } from '../services'
import './css/response.css'

const mapStateToProps = ({ langs, obj, speed }) => ({ langs, obj, speed })

const mapDispatchToProps = dispatch => ({
  speedTo: speed => dispatch(speedTo(speed))
})

const Response = ({ langs, obj, speed, speedTo }) => {

  function handleClickOnPlayIcon() {
    let text = obj.translation
    let lang = langs.to
    playAudio(text, lang, speed.to)
    speedTo(!speed.to)
  }

  function renderPronunciation() {
    var p
    if (p = obj.pronunciation) {
      return <div className='pronunciation'>{p}</div>
    } else return null
  }

  function renderTanslation() {
    if (obj.translation) {
      let height = document.getElementById('input').scrollHeight
      return (
        <div className='t_box'>
          <div className='inputContainer'>
            <textarea
              id='translation'
              type='text'
              value={obj.translation}
              disabled={true}
              style={{ height: height }}
            />
            <div className='icons'>
              <div
                className='audio'
                onClick={() => handleClickOnPlayIcon()}
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

  function renderDefinitionsOf() {
    var x
    if (x = obj.definitions) {
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
            {'Definitions of '}<span className='span'>{obj.target}</span>
          </div>
          {types}
        </div>
      )
    } else return null
  }

  function renderSynonyms() {
    var x
    if (x = obj.synonyms) {
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

  function renderExamples() {
    var x
    if (x = obj.examples) {
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

  function renderTranslationsOf() {
    var x
    if (x = obj.translations) {
      var types = x.map((translation, i) => {
        var sections = translation.content.map((section, j) => {
          return (
            <div key={j} className='obj'>
              <div className='rating'>
                <div className={'bar ' + section.bar}></div>
              </div>
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
            {'Translations of '}<span className='span'>{obj.target}</span>
          </div>
          {types}
        </div>
      )
    } else return null
  }

  function renderSeeAlso() {
    let s
    if (s = obj.seeAlso) {
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

  return (
    <div className='response'>
      <div className='block'>
        {renderPronunciation()}
        {renderTanslation()}
      </div>
      <div className='scroll'>
        {renderTranslationsOf()}
        {renderDefinitionsOf()}
        {renderSynonyms()}
        {renderExamples()}
        {renderSeeAlso()}
      </div>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Response)
