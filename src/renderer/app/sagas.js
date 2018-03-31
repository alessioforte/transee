import {
  GET_HINTS,
  SET_HINTS,
  GET_T_HINTS,
  SET_T_HINT,
  GET_TRANSLATION,
  SET_TRANSLATION,
  SET_ERROR
} from './actions'
import { takeEvery, call, put, all } from 'redux-saga/effects'
import { translate, complete, translateComplete, voice } from '../../google-translate/api'

function* getHints(action) {
  try {
    const response = yield call(complete, action.payload.text, action.payload.from)
    yield put({ type: SET_HINTS, payload: response })

  } catch (error) {
    console.log(error)
    // yield put({ type: SET_ERROR, data: true })
  }
}

function* getTranslationHints(action) {
  try {
    const response = yield call(translateComplete, action.payload.hints, action.payload.langs)
    yield put({ type: SET_HINTS, payload: response })
  } catch (error) {
    console.log(error)
  }
}

function* getTranslation(action) {
  try {
    const response = yield call(translate, action.payload.text, action.payload.langs)
    yield put ({ type: SET_TRANSLATION, payload: response })
  } catch (error) {
    console.log(error)
  }
}

/**
 * WATCHERS
 */

function* watchGetHints() {
  yield takeEvery(GET_HINTS, getHints)
}

function* watchGetTHints() {
  yield takeEvery(GET_T_HINTS, getTranslationHints)
}

function* watchGetTranslation() {
  yield takeEvery(GET_TRANSLATION, getTranslation)
}

export default function* sagas() {
  yield all([
    watchGetHints(),
    watchGetTHints(),
    watchGetTranslation()
  ])
}