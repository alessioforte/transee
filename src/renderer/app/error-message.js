import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

const mapStateToProps = ({ error }) => ({ error })

export default connect(mapStateToProps)(props => {
    if (props.error) return <Message>{'Sorry I can\'t translate!'}</Message>
    else return null
})

const Message = styled.div`
    padding: 18px;
    color: palevioletred;
`