import {
    GET_HINTS,
    SET_HINTS,
    GET_TRANSLATION,
    SET_TRANSLATION,
    SET_ERROR,
    RESET_TRANSLATE,
    RESET_HINTS,
    SET_AUTOCOMPLETE,
    SET_LOADING
} from './actions'
import { takeLatest, call, put, all, throttle } from 'redux-saga/effects'
import { translate, complete, translateComplete } from '../google-translate/api'

var requestsCount = 0

function* getHints(action) {
    let text = action.payload.text

    if (!text || /^\s*$/.test(text) || text.length > 50 || text.indexOf('\n') !== -1) {
        return yield put({ type: RESET_HINTS })
    }

    try {
        let hints = yield call(complete, text, action.payload.langs.from)
        let t_hints = yield call(translateComplete, hints, action.payload.langs)
        t_hints = Array.isArray(t_hints) ? t_hints : [t_hints]
        
        yield put({ type: SET_ERROR, payload: false })
        yield put({ type: SET_AUTOCOMPLETE, payload: hints[0] })
        yield put({ type: SET_HINTS, payload: { hints, t_hints } })

    } catch (error) {
        console.error(error)
    }
}

function* getTranslation(action) {
    let text = action.payload.text
    requestsCount++

    yield put({ type: SET_LOADING, payload: true })

    if (!text || /^\s*$/.test(text)) {
        requestsCount = 0
        yield put({ type: SET_LOADING, payload: false })
        return yield put({ type: RESET_TRANSLATE })
    }

    try {    
        let response = yield call(translate, text, action.payload.langs)
        yield put({ type: SET_TRANSLATION, payload: response })
        requestsCount--
    } catch (error) {
        requestsCount = 0
        yield put({ type: SET_ERROR, payload: true })
        console.error(error)
    }

    if (requestsCount === 0) yield put({ type: SET_LOADING, payload: false })
}

/**
 * WATCHERS
 */

function* watchGetHints() {
    yield takeLatest(GET_HINTS, getHints)
}

function* watchGetTranslation() {
    yield throttle(1200, GET_TRANSLATION, getTranslation)
}

export default function* sagas() {
    yield all([
        watchGetHints(),
        watchGetTranslation()
    ])
}