import React, { FunctionComponent, ReactElement } from 'react';
import styled from 'styled-components';
import theme from '../../theme';

type Props = {
  title?: string;
  renderHeader?: () => ReactElement;
  children?: ReactElement | ReactElement[] | string;
};

const Card: FunctionComponent<Props> = ({ title = '', renderHeader, children }) => {
  const body = children || <></>;
  const header = renderHeader ? renderHeader() : title;

  return (
    <Box>
      <Header>{header}</Header>
      <Body>{body}</Body>
    </Box>
  );
};

export default Card;

const { colors } = theme;

const Box = styled.div`
  box-sizing: border-box;
  width: 100%;
`;
const Header = styled.div`
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  padding: 3px 18px;
  color: ${colors.text.main};
  margin: 0;
  background: ${colors.frame};
  font-size: 14px;
`;
const Body = styled.div`
  padding: 3px 18px;
`;
