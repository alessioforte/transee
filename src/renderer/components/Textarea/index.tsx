import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';
import { Spinner } from '..';
import theme from '../../theme';

export type Props = {
  loading?: boolean;
  name?: string;
  value?: string;
  description?: string;
  delay?: number;
  isError?: boolean;
  message?: string;
  renderIcons?: () => ReactElement | null;
};

const Textarea: FC<Props> = ({
  loading = false,
  value = '',
  description,
  isError = false,
  message = 'error',
  renderIcons,
}) => {
  return (
    <>
      <Container>
        <Text>
          <span>{value}</span>
          {description && <Description>{description}</Description>}
        </Text>
        {loading && (
          <Loading>
            <Spinner />
          </Loading>
        )}
        {renderIcons && <Icons>{renderIcons()}</Icons>}
      </Container>
      {isError && <Message>{message}</Message>}
    </>
  );
};

export default Textarea;

const { colors } = theme;
/**
 * STYLES
 */
const Container = styled.div`
  position: relative;
  display: flex;
  overflow: hidden;
  width: 100%;
`;
const Text = styled.div`
  box-sizing: border-box;
  padding: 18px;
  min-height: 60px;
  width: 100%;
  /* max-height: 300px; */
  font-size: 18px;
  border: 0;
  background: none;
  resize: none;
  color: ${colors.text.main};
`;
const Description = styled.span`
  color: ${colors.text.soft};
  font-size: 12px;
  margin: 0 8px;
`;
const Icons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 18px;
  min-width: 38px;
  box-sizing: border-box;
`;
const Loading = styled.div`
  position: absolute;
  right: 18px;
  top: 12px;
`;
const Message = styled.div`
  padding: 18px;
  color: ${colors.text.error};
`;
