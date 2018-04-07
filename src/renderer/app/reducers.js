import {
    SET_TEXT,
    SET_AUTOCOMPLETE,
    SET_HINTS,
    SET_T_HINTS,
    RESET_HINTS,
    RESET_TRANSLATE,
    RESET_SPEED,
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

const DEFAULT_LANGS = { from: 'en', to: 'it' }

export const langs = (state = DEFAULT_LANGS, action) => {
    switch (action.type) {
        case FROM_LANG:
            return { ...state, from: action.payload }
        case TO_LANG:
            return { ...state, to: action.payload }
        default:
            return state
    }
}

const DEFAULT_SPEED = { from: false, to: false }

export const speed = (state = DEFAULT_SPEED, action) => {
    switch (action.type) {
        case SPEED_FROM:
            return { ...state, from: action.payload }
        case SPEED_TO:
            return { ...state, to: action.payload }
        case RESET_SPEED:
            return { from: false, to: false }
        default:
            return state
    }
}

export const dropdown = (state = false, action) => {
    switch (action.type) {
        case SET_DROPDOWN:
            return action.payload
        default:
            return state
    }
}

export const error = (state = false, action) => {
    switch (action.type) {
        case SET_ERROR:
            return action.payload
        default:
            return state
    }
}

const DEFAULT_FROM_ACTIVE = [true, false, false]

export const fromActive = (state = DEFAULT_FROM_ACTIVE, action) => {
    switch (action.type) {
        case SET_FROM_ACTIVE:
            return action.payload
        default:
            return state
    }
}

const DEFAULT_TO_ACTIVE = [true, false, false]

export const toActive = (state = DEFAULT_TO_ACTIVE, action) => {
    switch (action.type) {
        case SET_TO_ACTIVE:
            return action.payload
        default:
            return state
    }
}

const DEFAULT_FROM_BAR = { from1: 'en', from2: 'it', from3: 'es' }

export const fromBar = (state = DEFAULT_FROM_BAR, action) => {
    switch (action.type) {
        case SET_FROM_1:
            return { ...state, from1: action.payload }
        case SET_FROM_2:
            return { ...state, from2: action.payload }
        case SET_FROM_3:
            return { ...state, from3: action.payload }
        default:
            return state
    }
}

const DEFAULT_TO_BAR = { to1: 'it', to2: 'en', to3: 'es' }

export const toBar = (state = DEFAULT_TO_BAR, action) => {
    switch (action.type) {
        case SET_TO_1:
            return { ...state, to1: action.payload }
        case SET_TO_2:
            return { ...state, to2: action.payload }
        case SET_TO_3:
            return { ...state, to3: action.payload }
        default:
            return state
    }
}

const DEFAULT_TRANSATE = {
    data: null,
    hints: {
        0: null,
        1: null
    },
    autocomplete: ''
}

export const translate = (state = DEFAULT_TRANSATE, action) => {
    switch (action.type) {
        case SET_HINTS:
            return { ...state, hints: { 0: action.payload.hints, 1: action.payload.t_hints }}
        case SET_TRANSLATION:
            return { ...state, data: action.payload }
        case RESET_HINTS:
            return { ...state, hints: { 0: null, 1: null }, autocomplete: '' }
        case RESET_TRANSLATE:
            return DEFAULT_TRANSATE
        case SET_AUTOCOMPLETE:
            let autocomplete = action.payload || ''
            return { ...state, autocomplete }
        default:
            return state
    }
}

export const text = (state = '', action) => {
    switch (action.type) {
        case SET_TEXT:
            return action.payload
        default:
            return state
    }
}
