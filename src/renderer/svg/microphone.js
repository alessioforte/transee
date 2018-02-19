import React from 'react'
import styled from 'styled-components'

export const Microphone = () => (
  <Svg
    version="1.1"
  	width="18px"
    height="18px"
    viewBox="0 0 484.5 484.5"
  >
  	<g>
  		<path d="M242.25,306c43.35,0,76.5-33.15,76.5-76.5v-153c0-43.35-33.15-76.5-76.5-76.5c-43.35,0-76.5,33.15-76.5,76.5v153
  			C165.75,272.85,198.9,306,242.25,306z M377.4,229.5c0,76.5-63.75,130.05-135.15,130.05c-71.4,0-135.15-53.55-135.15-130.05H63.75
  			c0,86.7,68.85,158.1,153,170.85v84.15h51v-84.15c84.15-12.75,153-84.149,153-170.85H377.4L377.4,229.5z"/>
  	</g>
  </Svg>
)

const Svg = styled.svg`
  path {
    fill: #444
  }
  &:hover path {
    fill: #999
  }
  &:active path {
    fill: #eee
  }
`
