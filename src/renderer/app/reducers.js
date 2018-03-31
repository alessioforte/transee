import {
  SET_HINTS,
  SET_T_HINTS,
  SET_TRANSLATION,
  SET_ERROR,
  FROM_LANG,
  TO_LANG,
  SPEED_FROM,
  SPEED_TO,
  SET_DROPDOWN,
  SET_FROM_ACTIVE,
  SET_TO_ACTIVE,
  SET_TO_1,
  SET_TO_2,
  SET_TO_3,
  SET_FROM_1,
  SET_FROM_2,
  SET_FROM_3
} from './actions'

const LANGS = { from: 'en', to: 'it' }
const SPEED = { from: false, to: false }
const FROM_BAR = { from1: 'en', from2: 'it', from3: 'es' }
const TO_BAR = { to1: 'it', to2: 'en', to3: 'es' }
const FROM_ACTIVE = [true, false, false]
const TO_ACTIVE = [true, false, false]

export const langs = (state = LANGS, action) => {
  switch (action.type) {
    case FROM_LANG:
      return Object.assign({}, state, {
        from: action.data
      })
    case TO_LANG:
      return Object.assign({}, state, {
        to: action.data
      })
    default:
      return state
  }
}

export const obj = (state = null, action) => {
  switch (action.type) {
    case 'UPDATE_OBJ':
      return action.data
    default:
      return state
  }
}

export const suggest = (state = null, action) => {
  switch (action.type) {
    case 'UPDATE_SGT':
      return Object.assign({}, state, {
        sgt: action.data
      })
    case 'UPDATE_T_SGT':
      return Object.assign({}, state, {
        t_sgt: action.data
      })
    default:
      return state
  }
}

export const speed = (state = SPEED, action) => {
  switch (action.type) {
    case SPEED_FROM:
      return Object.assign({}, state, {
        from: action.data
      })
    case SPEED_TO:
      return Object.assign({}, state, {
        to: action.data
      })
    default:
      return state
  }
}

export const dropdown = (state = false, action) => {
  switch (action.type) {
    case SET_DROPDOWN:
      return action.data
    default:
      return state
  }
}

export const error = (state = false, action) => {
  switch (action.type) {
    case SET_ERROR:
      return action.data
    default:
      return state
  }
}

export const fromActive = (state = FROM_ACTIVE, action) => {
  switch (action.type) {
    case SET_FROM_ACTIVE:
      return action.data
    default:
      return state
  }
}

export const toActive = (state = TO_ACTIVE, action) => {
  switch (action.type) {
    case SET_TO_ACTIVE:
      return action.data
    default:
      return state
  }
}

export const fromBar = (state = FROM_BAR, action) => {
  switch (action.type) {
    case SET_FROM_1:
      return Object.assign({}, state, {
        from1: action.data
      })
    case SET_FROM_2:
      return Object.assign({}, state, {
        from2: action.data
      })
    case SET_FROM_3:
      return Object.assign({}, state, {
        from3: action.data
      })
    default:
      return state
  }
}

export const toBar = (state = TO_BAR, action) => {
  switch (action.type) {
    case SET_TO_1:
      return Object.assign({}, state, {
        to1: action.data
      })
    case SET_TO_2:
      return Object.assign({}, state, {
        to2: action.data
      })
    case SET_TO_3:
      return Object.assign({}, state, {
        to3: action.data
      })
    default:
      return state
  }
}



// new Reducers

export const complete = (state = null, action) => {
  switch (action.type) {
    case SET_HINTS:
      return { ...state, hints: action.payload }

    case SET_T_HINTS:
      return { ...state, t_hints: action.payload } 

    default:
      return state
  }
}

export const data = (state = null, action) => {
  switch (action.type) {
    case SET_TRANSLATION:
      return action.payload
    default:
      return state
  }
}