import React, { Component } from 'react'
import styled from 'styled-components'

export const Checkbox = props => {

  const setValue = () => {
    props.onClick()
  }

  const Box = styled.div`
    margin: 9px 0;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    border: 1px solid #2a2a2a;
    background: ${props.value ? '#2182BD' : '#888'};
  `
  const Svg = styled.svg`
    fill: #fff;
    margin: 4px 3px;
    display: ${props.value ? 'block' : 'none'}
  `

  return (
    <Box
      onClick={() => setValue()}
    >
      <Svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 141.73 109.5"
      >
        <path d="M71.27,133.67a8.75,8.75,0,0,1-6,2.73,7.68,7.68,0,0,1-3.49-.83,11.51,11.51,0,0,1-2.9-2.22C57,131.43,15.78,90.26,15.1,89.2A8.53,8.53,0,0,1,13.84,86,8.1,8.1,0,0,1,16,79.38c0.9-1,1.9-2,2.86-2.91l5.93-5.93c0.9-.89,1.76-1.82,2.71-2.66a8.17,8.17,0,0,1,6.64-2.2,8.43,8.43,0,0,1,3.12,1.22c1,0.65,27.73,27.59,27.92,27.79L128.31,31.5c0.74-.74,1.46-1.51,2.24-2.22a8.69,8.69,0,0,1,5.11-2.36,8,8,0,0,1,5.29,1.63c0.76,0.55,12.4,12.2,13,13a8,8,0,0,1,1.54,5.33,8.71,8.71,0,0,1-2.33,4.94c-0.68.76-1.44,1.46-2.16,2.19l-2.28,2.28-77.4,77.4h0Z" transform="translate(-13.74 -26.9)"/>
      </Svg>
    </Box>
  )
}
