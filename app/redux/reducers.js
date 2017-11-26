const DEFAULT_STATE = {
  langs: {
    from: 'en',
    to: 'it'
  },
  speed: {
    from: false,
    to: false
  },
  fromBar: {
    from1: 'en',
    from2: 'it',
    from3: 'es'
  },
  toBar: {
    to1: 'it',
    to2: 'en',
    to3: 'es'
  },
  fromActive: [true, false, false],
  toActive: [true, false, false],
  isTransparent: false
}

export const langs = (state = DEFAULT_STATE.langs, action) => {
  switch (action.type) {
    case 'FROM_LANG':
      return Object.assign({}, state, {
        from: action.data
      })
    case 'TO_LANG':
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

export const speed = (state = DEFAULT_STATE.speed, action) => {
  switch (action.type) {
    case 'SPEED_FROM':
      return Object.assign({}, state, {
        from: action.data
      })
    case 'SPEED_TO':
      return Object.assign({}, state, {
        to: action.data
      })
    default:
      return state
  }
}

export const dropdown = (state = false, action) => {
  switch (action.type) {
    case 'SET_DROPDOWN':
      return action.data
    default:
      return state
  }
}

export const error = (state = false, action) => {
  switch (action.type) {
    case 'SET_ERR':
      return action.data
    default:
      return state
  }
}



export const fromActive = (state = DEFAULT_STATE.fromActive, action) => {
  switch (action.type) {
    case 'SET_FROM_ACTIVE':
      return action.data
    default:
      return state
  }
}

export const toActive = (state = DEFAULT_STATE.toActive, action) => {
  switch (action.type) {
    case 'SET_TO_ACTIVE':
      return action.data
    default:
      return state
  }
}

export const fromBar = (state = DEFAULT_STATE.fromBar, action) => {
  switch (action.type) {
    case 'SET_FROM_1':
      return Object.assign({}, state, {
        from1: action.data
      })
    case 'SET_FROM_2':
      return Object.assign({}, state, {
        from2: action.data
      })
    case 'SET_FROM_3':
      return Object.assign({}, state, {
        from3: action.data
      })
    default:
      return state
  }
}

export const toBar = (state = DEFAULT_STATE.toBar, action) => {
  switch (action.type) {
    case 'SET_TO_1':
      return Object.assign({}, state, {
        to1: action.data
      })
    case 'SET_TO_2':
      return Object.assign({}, state, {
        to2: action.data
      })
    case 'SET_TO_3':
      return Object.assign({}, state, {
        to3: action.data
      })
    default:
      return state
  }
}

export const isTransparent = (state = DEFAULT_STATE.isTransparent, action) => {
  switch (action.type) {
    case 'SET_TRANSPARENCY':
      return action.data
    default:
      return state
  }
}
