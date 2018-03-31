export const GET_TRANSLATION = 'GET_TRANSLATION'
export const SET_TRANSLATION = 'SET_TRANSLATION'
export const GET_HINTS = 'GET_HINTS'
export const SET_HINTS = 'SET_HINTS'
export const GET_T_HINTS = 'GET_T_HINTS'
export const SET_T_HINTS = 'SET_T_HINTS'
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

export const updateObj = obj => ({ type: 'UPDATE_OBJ', data: obj })
export const updateSgt = sgt => ({ type: 'UPDATE_SGT', data: sgt })
export const updateTSgt = t_sgt => ({ type: 'UPDATE_T_SGT', data: t_sgt })

export const setFromLang = lang => ({ type: FROM_LANG, data: lang })
export const setToLang = lang => ({ type: TO_LANG, data: lang })
export const speedFrom = speed => ({ type: SPEED_FROM, data: speed })
export const speedTo = speed => ({ type: SPEED_TO, data: speed })
export const setDropdown = isActive => ({ type: SET_DROPDOWN, data: isActive })
export const setError = isErr => ({ type: SET_ERROR, data: isErr })
export const setFromActive = active => ({ type: SET_FROM_ACTIVE, data: active })
export const setToActive = active => ({ type: SET_TO_ACTIVE, data: active })

export const setToBar = (to, i) => {
  switch (i) {
    case 0:
      return ({ type: SET_TO_1, data: to })
      break
    case 1:
      return ({ type: SET_TO_2, data: to })
      break
    case 2:
      return ({ type: SET_TO_3, data: to })
  }
}

export const setFromBar = (from, i) => {
  switch (i) {
    case 0:
      return ({ type: SET_FROM_1, data: from })
      break
    case 1:
      return ({ type: SET_FROM_2, data: from })
      break
    case 2:
      return ({ type: SET_FROM_3, data: from })
  }
}

// saga actions

export const getHints = (text, from) => ({ type: GET_HINTS, payload: { text, from } })

export const getTranslationHints = (hints, langs) => ({ type: GET_T_HINTS, payload: { hints, langs } })

export const getTranslation = (text, langs) => ({ type: GET_TRANSLATION, payload: { text, langs } })

// redux actions

export const setHints = payload => ({ type: SET_HINTS, payload })

export const setTranslationHints = payload => ({ type: SET_T_HINTS, payload })

export const setTranslationData = payload => ({ type: SET_TRANSLATION, payload })