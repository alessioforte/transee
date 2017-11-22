export const setFromLang = lang => ({ type: 'FROM_LANG', data: lang })
export const setToLang = lang => ({ type: 'TO_LANG', data: lang })
export const updateObj = obj => ({ type: 'UPDATE_OBJ', data: obj })
export const updateSgt = sgt => ({ type: 'UPDATE_SGT', data: sgt })
export const updateTSgt = t_sgt => ({ type: 'UPDATE_T_SGT', data: t_sgt })
export const speedFrom = speed => ({ type: 'SPEED_FROM', data: speed })
export const speedTo = speed => ({ type: 'SPEED_TO', data: speed })
export const setDropdown = isActive => ({ type: 'SET_DROPDOWN', data: isActive })
export const setError = isErr => ({ type: 'SET_ERR', data: isErr })
export const setFromActive = active => ({ type: 'SET_FROM_ACTIVE', data: active })
export const setToActive = active => ({ type: 'SET_TO_ACTIVE', data: active })

export const setToBar = (to, i) => {
  switch (i) {
    case 0:
      return ({ type: 'SET_TO_1', data: to })
      break
    case 1:
      return ({ type: 'SET_TO_2', data: to })
      break
    case 2:
      return ({ type: 'SET_TO_3', data: to })
  }
}

export const setFromBar = (from, i) => {
  switch (i) {
    case 0:
      return ({ type: 'SET_FROM_1', data: from })
      break
    case 1:
      return ({ type: 'SET_FROM_2', data: from })
      break
    case 2:
      return ({ type: 'SET_FROM_3', data: from })
  }
}

export const setTrasparency = bool => ({ type: 'SET_TRANSPARENCY', data: bool})
