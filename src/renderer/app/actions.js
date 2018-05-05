export const SET_TEXT = 'SET_TEXT'
export const SET_AUTOCOMPLETE = 'SET_AUTOCOMPLETE'
export const GET_TRANSLATION = 'GET_TRANSLATION'
export const SET_TRANSLATION = 'SET_TRANSLATION'
export const GET_HINTS = 'GET_HINTS'
export const SET_HINTS = 'SET_HINTS'
export const RESET_HINTS = 'RESET_HINTS'
export const RESET_SPEED = 'RESET_SPEED'
export const RESET_TRANSLATE = 'RESET_TRANSLATE'
export const SET_ERROR = 'SET_ERROR'
export const FROM_LANG = 'FROM_LANG'
export const TO_LANG = 'TO_LANG'
export const SPEED_FROM = 'SPEED_FROM'
export const SPEED_TO = 'SPEED_TO'
export const SET_DROPDOWN = 'SET_DROPDOWN'
export const SET_FROM_ACTIVE = 'SET_FROM_ACTIVE'
export const SET_TO_ACTIVE = 'SET_TO_ACTIVE'
export const SET_TO_1 = 'SET_TO_1'
export const SET_TO_2 = 'SET_TO_2'
export const SET_TO_3 = 'SET_TO_4'
export const SET_FROM_1 = 'SET_FROM_1'
export const SET_FROM_2 = 'SET_FROM_2'
export const SET_FROM_3 = 'SET_FROM_3'
export const SET_LOADING = 'SET_LOADING'

export const setFromLang = lang => ({ type: FROM_LANG, payload: lang })
export const setToLang = lang => ({ type: TO_LANG, payload: lang })
export const speedFrom = speed => ({ type: SPEED_FROM, payload: speed })
export const speedTo = speed => ({ type: SPEED_TO, payload: speed })
export const setDropdown = isActive => ({ type: SET_DROPDOWN, payload: isActive })
export const setError = isErr => ({ type: SET_ERROR, payload: isErr })
export const setFromActive = active => ({ type: SET_FROM_ACTIVE, payload: active })
export const setToActive = active => ({ type: SET_TO_ACTIVE, payload: active })

export const setToBar = (to, i) => {
    switch (i) {
        case 0:
            return ({ type: SET_TO_1, payload: to })
            break
        case 1:
            return ({ type: SET_TO_2, payload: to })
            break
        case 2:
            return ({ type: SET_TO_3, payload: to })
    }
}

export const setFromBar = (from, i) => {
    switch (i) {
        case 0:
            return ({ type: SET_FROM_1, payload: from })
            break
        case 1:
            return ({ type: SET_FROM_2, payload: from })
            break
        case 2:
            return ({ type: SET_FROM_3, payload: from })
    }
}

export const getHints = (text, langs) => ({ type: GET_HINTS, payload: { text, langs } })
export const getTranslation = (text, langs) => ({ type: GET_TRANSLATION, payload: { text, langs } })

export const resetHints = () => ({ type: RESET_HINTS })
export const resetTranslate = () => ({ type: RESET_TRANSLATE })
export const resetSpeed = () => ({ type: RESET_SPEED })

export const setText = payload => ({ type: SET_TEXT, payload })
export const setAutocomplete = payload => ({ type: SET_AUTOCOMPLETE, payload })