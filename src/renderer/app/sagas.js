import { fork, all } from 'redux-saga/effects'

function* helloTransee() {
  console.log('Hello Transee!')
}

export default function* sagas() {
  yield all([
    fork(helloTransee)
  ])
}