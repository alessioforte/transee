import React, { Component } from 'react'
import { langsFrom, langsTo } from '../../google-translate/langs'
import { connect } from 'react-redux'
import {
  setFromLang,
  setToLang,
  setDropdown,
  setFromActive,
  setToBar,
  setFromBar,
  setToActive } from '../../redux/actions'
import {
  searchTranslation,
  getFromPosition,
  getToPosition,
  invertLanguages,
  saveSettings } from '../services'
import './css/languages-bar.css'

const mapStateToProps = ({ langs, dropdown, fromBar, fromActive, toBar, toActive }) => {
  return ({ langs, dropdown, fromBar, fromActive, toBar, toActive })
}

const mapDispatchToProps = dispatch => ({
  setFromLang: lang => dispatch(setFromLang(lang)),
  setToLang: lang => dispatch(setToLang(lang)),
  setDropdown: isActive => dispatch(setDropdown(isActive)),
  setFromBar: (from, i) => dispatch(setFromBar(from, i)),
  setFromActive: active => dispatch(setFromActive(active)),
  setToBar: (to, i) => dispatch(setToBar(to, i)),
  setToActive: active => dispatch(setToActive(active)),
})

class LanguagesBar extends Component {

  constructor() {
    super()

    this.state = {
      visibleLeft: false,
      visibleRight: false
    }

    this.selectFrom = this.selectFrom.bind(this)
    this.selectTo = this.selectTo.bind(this)
    this.hideDropdownLeft = this.hideDropdownLeft.bind(this)
    this.hideDropdownRight = this.hideDropdownRight.bind(this)
    this.showDropdownLeft = this.showDropdownLeft.bind(this)
    this.showDropdownRight = this.showDropdownRight.bind(this)
    this.blur = this.blur.bind(this)
    this.setFrom = this.setFrom.bind(this)
    this.setTo = this.setTo.bind(this)
  }

  componentDidMount() {
    this.input = document.getElementById('input')
  }

  componentDidUpdate() {
    this.input.focus()
    saveSettings()
  }

  selectFrom(e) {
    let newFrom = e.target.value
    let oldFrom = this.props.langs.from
    let to = this.props.langs.to
    let newTo = to
    this.props.setFromLang(newFrom)

    if (newFrom === to) {
      if (oldFrom !== this.props.toBar.to1 &&
          oldFrom !== this.props.toBar.to2 &&
          oldFrom !== this.props.toBar.to3) {

        this.props.setToBar(oldFrom, 2)

        this.props.setToActive([false, false, true])
        this.props.setToLang(oldFrom)
        let fromPos = getFromPosition(to)
        this.props.setFromActive(fromPos)
      } else {
        var toPos = getToPosition(oldFrom)
        this.props.setToActive(toPos)
        this.props.setToLang(oldFrom)
        newTo = oldFrom
      }
    }

    switch (true) {
      case this.props.fromActive[0] === true:
        if (e.target.name === 'from2') {
          this.props.setFromActive([false, true, false])
        } else {
          this.props.setFromActive([false, false, true])
        }
        break
      case this.props.fromActive[1] === true:
        if (e.target.name === 'from1') {
          this.props.setFromActive([true, false, false])
        } else {
          this.props.setFromActive([false, false, true])
        }
        break
      case this.props.fromActive[2] === true:
        if (e.target.name === 'from2') {
          this.props.setFromActive([false, true, false])
        } else {
          this.props.setFromActive([true, false, false])
        }
    }

    if (this.input.value) {
      let text = this.input.value
      searchTranslation(text)
    }
  }

  selectTo(e) {
    let newTo = e.target.value
    let oldTo = this.props.langs.to
    let from = this.props.langs.from
    let newFrom = from
    this.props.setToLang(newTo)

    if (newTo === from) {
      if (oldTo !== this.props.fromBar.from1 &&
          oldTo !== this.props.fromBar.from2 &&
          oldTo !== this.props.fromBar.from3) {
        this.props.setFromBar(oldTo, 2)
        this.props.setFromActive([false, false, true])
        this.props.setFromLang(oldTo)
        let toPos = getToPosition(from)
        this.props.setToActive(toPos)
      } else {
        let fromPos = getFromPosition(oldTo)
        this.props.setFromActive(fromPos)
        this.props.setFromLang(oldTo)
        newFrom = oldTo
      }
    }

    switch (true) {
      case this.props.toActive[0] === true:
        if (e.target.name === 'to2') {
          this.props.setToActive([false, true, false])
        } else {
          this.props.setToActive([false, false, true])
        }
        break
      case this.props.toActive[1] === true:
        if (e.target.name === 'to1') {
          this.props.setToActive([true, false, false])
        } else {
          this.props.setToActive([false, false, true])
        }
        break
      case this.props.toActive[2] === true:
        if (e.target.name === 'to2') {
          this.props.setToActive([false, true, false])
        } else {
          this.props.setToActive([true, false, false])
        }
    }

    if (this.input.value) {
      let text = this.input.value
      searchTranslation(text)
    }
  }

  showDropdownLeft() {
    if (this.state.visibleRight) {
      this.setState({ visibleRight: false })
      document.removeEventListener('click', this.hideDropdownRight)
      window.removeEventListener('blur', this.blur)
    }
    if (!this.state.visibleLeft) {
      this.setState({ visibleLeft: true })
      this.props.setDropdown(true)
      document.addEventListener('click', this.hideDropdownLeft)
      window.addEventListener('blur', this.blur)
    }
  }

  hideDropdownLeft(e) {
    let rect = this.dropdown.getBoundingClientRect()
    let x = e.clientX
    let y = e.clientY
    if (y < rect.top || y > rect.bottom || x < rect.left || x > rect.right) {
      this.setState({ visibleLeft: false })
      this.props.setDropdown(false)
      document.removeEventListener('click', this.hideDropdownLeft)
      window.removeEventListener('blur', this.blur)
    }
  }

  showDropdownRight() {
    if (this.state.visibleLeft) {
      this.setState({ visibleLeft: false })
      document.removeEventListener('click', this.hideDropdownLeft)
      window.removeEventListener('blur', this.blur)
    }
    if (!this.state.visibleRight) {
      this.setState({ visibleRight: true })
      this.props.setDropdown(true)
      document.addEventListener('click', this.hideDropdownRight)
      window.addEventListener('blur', this.blur)
    }
  }

  hideDropdownRight(e) {
    let rect = this.dropdown.getBoundingClientRect()
    let x = e.clientX
    let y = e.clientY
    if (y < rect.top || y > rect.bottom || x < rect.left || x > rect.right) {
      this.setState({ visibleRight: false })
      this.props.setDropdown(false)
      document.removeEventListener('click', this.hideDropdownRight)
      window.removeEventListener('blur', this.blur)
    }
  }

  blur() {
    this.setState({ visibleRight: false, visibleLeft: false })
    this.props.setDropdown(false)
    document.removeEventListener('click', this.hideDropdownRight)
    document.removeEventListener('click', this.hideDropdownLeft)
    window.removeEventListener('blur', this.blur)
  }

  setFrom(x) {
    let oldFrom = this.props.langs.from
    let newTo = this.props.langs.to
    let newFrom = x

    this.props.setFromLang(x)

    switch (x) {
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
        let i = this.props.fromActive.indexOf(true)
        this.props.setFromBar(x, i)
    }

    if (x === this.props.langs.to) {
      let toPos = getToPosition(oldFrom)

      if (!toPos) {
        this.props.setToBar(oldFrom, 2)
      } else {
        this.props.setToActive(toPos)
      }

      this.props.setToLang(oldFrom)
      newTo = oldFrom
    }

    this.setState({ visibleLeft: false })
    this.props.setDropdown(false)
    document.removeEventListener('click', this.hideDropdownLeft)

    if (this.input.value) {
      let text = this.input.value
      searchTranslation(text)
    }
  }

  setTo(x) {
    let oldTo = this.props.langs.to
    let newFrom = this.props.langs.from
    let newTo = x

    this.props.setToLang(x)

    switch (x) {
      case this.props.toBar.to1:
        this.props.setToActive([true, false, false])
        break
      case this.props.toBar.to2:
        this.props.setToActive([false, true, false])
        break
      case this.props.toBar.to3:
        this.props.setToActive([false, false, true])
        break
      default:
        let i = this.props.toActive.indexOf(true)
        this.props.setToBar(x, i)
    }

    if (x === this.props.langs.from) {
      let fromPos = getFromPosition(oldTo)

      if (!fromPos) {
        this.props.setFromBar(oldTo, 2)
      } else {
        this.props.setFromActive(fromPos)
      }

      this.props.setFromLang(oldTo)
      newFrom = oldTo
    }

    this.setState({ visibleRight: false })
    this.props.setDropdown(false)
    document.removeEventListener('click', this.hideDropdownRight)

    if (this.input.value) {
      let text = this.input.value
      searchTranslation(text)
    }
  }

  render() {
    return (
      <div>
        <div className='languages'>
          <div className='from'>

            <div className='caretLeft'>
              <svg
                className={this.state.visibleLeft ? 'rotateLeft' : ''}
                onClick={this.showDropdownLeft}
                viewBox="0 0 39.02 16.34"
              ><path d="M19.51,16.34a2.49,2.49,0,0,1-1.39-.42L1.11,4.58A2.5,2.5,0,0,1,3.89.42L19.51,10.83,35.13,0.42A2.5,2.5,0,1,1,37.9,4.58l-17,11.34A2.49,2.49,0,0,1,19.51,16.34Z"/>
              </svg>
            </div>

            <button
              name='from1'
              value={this.props.fromBar.from1}
              className={this.props.fromActive[0] ? 'active' : 'btn'}
              ref={from1 => this.from1 = from1}
              disabled={this.props.fromActive[0]}
              onClick={this.selectFrom}
            >{langsFrom[this.props.fromBar.from1]}</button>

            <button
              name='from2'
              value={this.props.fromBar.from2}
              className={this.props.fromActive[1] ? 'active' : 'btn'}
              ref={from2 => this.from2 = from2}
              disabled={this.props.fromActive[1]}
              onClick={this.selectFrom}
            >{langsFrom[this.props.fromBar.from2]}</button>

            <button
              name='from3'
              value={this.props.fromBar.from3}
              className={this.props.fromActive[2] ? 'active' : 'btn'}
              ref={from3 => this.from3 = from3}
              disabled={this.props.fromActive[2]}
              onClick={this.selectFrom}
            >{langsFrom[this.props.fromBar.from3]}</button>

          </div>

          <div className='invert'>
            <svg
              id='invertIcon'
              onClick={() => invertLanguages()}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 688.97 515.52"
            >
              <path
                className="invertPath"
                d="M753.68,400c17.48-42.74,25.26-68.64,25.26-68.64h62.81v-57H686.33s-7.12-20.07-17.48-35.62S641,202.46,641,202.46l-55,22s22,21.37,26.55,27.85,9.71,22,9.71,22H465.51v56.34h64.11S541.92,378,562,409s54.4,65.41,54.4,65.41-36.91,33-71.88,48.56-90,29.79-90,29.79l30.44,52.45s53.1-10.36,96.49-34.32,77.06-54.4,77.06-54.4,9.71,13.6,36.26,30.44,64.11,33,64.11,33l22-55s-38.21-17.48-53.1-26.55-30.44-24-30.44-24S736.19,442.71,753.68,400Zm-60.22-8.42c-9.71,19.43-36.26,49.22-36.26,49.22S630,411,617.69,392.85s-29.14-62.17-29.14-62.17H718.06S703.17,372.13,693.45,391.55Z"
                transform="translate(-452.21 -200.67)"
              />
              <path
                className="invertPath"
                d="M992.63,338.45H922.69L778.93,714.69h66.7l33-94.55H1036l36.26,94.55H1139ZM900,567.69L959,403.86l58.93,163.84H900Z"
                transform="translate(-452.21 -200.67)"
              />
            </svg>
          </div>

          <div className='to'>

            <button
              name='to1'
              value={this.props.toBar.to1}
              className={this.props.toActive[0] ? 'active' : 'btn'}
              ref={to1 => this.to1 = to1}
              disabled={this.props.toActive[0]}
              onClick={this.selectTo}
            >{langsTo[this.props.toBar.to1]}</button>

            <button
              name='to2'
              value={this.props.toBar.to2}
              className={this.props.toActive[1] ? 'active' : 'btn'}
              ref={to2 => this.to2 = to2}
              disabled={this.props.toActive[1]}
              onClick={this.selectTo}
            >{langsTo[this.props.toBar.to2]}</button>

            <button
              name='to3'
              value={this.props.toBar.to3}
              className={this.props.toActive[2] ? 'active' : 'btn'}
              ref={to3 => this.to3 = to3}
              disabled={this.props.toActive[2]}
              onClick={this.selectTo}
            >{langsTo[this.props.toBar.to3]}</button>

            <div className='caretRight'>
              <svg
                className={this.state.visibleRight ? 'rotateRight' : ''}
                onClick={this.showDropdownRight}
                viewBox="0 0 39.02 16.34"
              ><path d="M19.51,16.34a2.49,2.49,0,0,1-1.39-.42L1.11,4.58A2.5,2.5,0,0,1,3.89.42L19.51,10.83,35.13,0.42A2.5,2.5,0,1,1,37.9,4.58l-17,11.34A2.49,2.49,0,0,1,19.51,16.34Z"/>
              </svg>
            </div>

          </div>
        </div>

        <div
          className='dropdown'
          ref={dropdown => this.dropdown = dropdown}
          style={{
            display: this.props.dropdown ? 'block' : 'none'
          }}
        >
          <div
            className='listbox'
            style={{
              display: this.state.visibleLeft ? 'block' : 'none'
            }}
          >
            {
              this.state.visibleLeft ? (
                <Dropdown
                  lang1={this.props.fromBar.from1}
                  lang2={this.props.fromBar.from2}
                  lang3={this.props.fromBar.from3}
                  active={this.props.langs.from}
                  setLang={this.setFrom}
                  side={true}
                />
              ) : null}
          </div>
          <div
            className='listbox'
            style={{
              display: this.state.visibleRight ? 'block' : 'none'
            }}
          >
            {
              this.state.visibleRight ? (
                <Dropdown
                  lang1={this.props.toBar.to1}
                  lang2={this.props.toBar.to2}
                  lang3={this.props.toBar.to3}
                  active={this.props.langs.to}
                  setLang={this.setTo}
                  side={false}
                />
              ) : null
            }
          </div>
        </div>

      </div>
    )
  }
}

const Dropdown = ({lang1, lang2, lang3, active, setLang, side}) => {

  var langs = (side) ? langsFrom : langsTo

  function handleClick(i) {
    setLang(i)
  }

  function renderLangs() {
    var items = []
    for (let i in langs) {
      if (i == active) {
        items.push(
          <div
            className='item'
            style={{
              backgroundColor: 'rgba(26, 26, 26, 0.8)',
              color: '#fff'
            }}
            key={i}
          >{langs[i]}
          </div>
        )
        continue
      }
      if (i === lang1 || i === lang2 || i === lang3) {
        items.push(
          <div
            className='item'
            style={{ backgroundColor: 'rgba(26, 26, 26, 0.8)' }}
            key={i}
            onClick={() => handleClick(i)}
          >{langs[i]}
          </div>
        )
        continue
      }
      items.push(
        <div
          className='item'
          key={i}
          onClick={() => handleClick(i)}
        >{langs[i]}
        </div>
      )
    }
    return items
  }

  return (
    <div>{renderLangs()}</div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(LanguagesBar)
