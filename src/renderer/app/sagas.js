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
import { translate, complete, translateComplete, voice } from '../../google-translate/api'

function* getHints(action) {
    try {
        let text = action.payload.text
        if (!text || /^\s*$/.test(text) || text.length > 50 || text.indexOf('\n') !== -1) {
            yield put({ type: RESET_HINTS })
        } else {
            let hints = yield call(complete, text, action.payload.langs.from)
            let t_hints = yield call(translateComplete, hints, action.payload.langs)
            t_hints = Array.isArray(t_hints) ? t_hints : [t_hints]
            
            yield put({ type: SET_ERROR, payload: false })
            yield put({ type: SET_AUTOCOMPLETE, payload: hints[0] })
            yield put({ type: SET_HINTS, payload: { hints, t_hints } })
        }
    } catch (error) {
        // yield put({ type: SET_ERROR, payload: true })
    }
}

function* getTranslation(action) {
    try {
        let text = action.payload.text
        if (!text || /^\s*$/.test(text)) {
            yield put({ type: RESET_TRANSLATE })
            yield put({ type: SET_LOADING, payload: false })
        } else {
            yield put({ type: SET_LOADING, payload: true })
            let response = yield call(translate, text, action.payload.langs)
            yield put({ type: SET_LOADING, payload: false })
            yield put({ type: SET_TRANSLATION, payload: response })
        }
    } catch (error) {
        yield put({ type: SET_ERROR, payload: true })
        yield put({ type: SET_LOADING, payload: false })
    }
}

/**
 * WATCHERS
 */

function* watchGetHints() {
    yield takeLatest(GET_HINTS, getHints)
}

function* watchGetTranslation() {
    yield throttle(600, GET_TRANSLATION, getTranslation)
}

export default function* sagas() {
    yield all([
        watchGetHints(),
        watchGetTranslation()
    ])
}