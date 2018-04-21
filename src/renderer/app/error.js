import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

const mapStateToProps = ({ error }) => ({ error })

export default connect(mapStateToProps)(props => {
    if (props.error) return <Error>{'Sorry I can\'t translate!'}</Error>
    else return null
})

const Error = styled.div`
    padding: 18px;
    color: palevioletred;
`