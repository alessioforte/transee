import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Card } from '../../components';
import { TranslationData } from '../../services/interfaces';

type Props = {
  data?: TranslationData | null;
};

const StickyCards: FunctionComponent<Props> = ({ data }) => {
  return (
    <>
      {data && (
        <Sticky>
          {data.translations && (
            <Card
              renderHeader={() => (
                <Title>
                  Translations of <span>{data.target}</span>
                </Title>
              )}
            >
              <Body>
                {data.translations.map((translation, i) => (
                  <div key={`translations${i}`}>
                    <i>{translation.type}</i>
                    <>
                      {translation.content.map((section, j) => (
                        <Box key={`translations${i}-${j}`}>
                          <div>
                            <Rating>
                              <div className={section.bar}></div>
                            </Rating>
                            {section.article && (
                              <Article>{section.article}</Article>
                            )}
                            <Word>{section.word}</Word>
                          </div>
                          <Values>{section.meaning.join(', ')}</Values>
                        </Box>
                      ))}
                    </>
                  </div>
                ))}
              </Body>
            </Card>
          )}

          {data.definitions && (
            <Card
              renderHeader={() => (
                <Title>
                  Definitions of <span className="span">{data.target}</span>
                </Title>
              )}
            >
              <Body>
                {data.definitions.map((definition, i) => (
                  <div key={`definitions${i}`}>
                    <i>{definition.type}</i>
                    <>
                      {definition.content.map((section, j) => (
                        <Section key={`definitions${i}-${j}`}>
                          <div style={{ color: '#fff' }}>{section.phrase}</div>
                          <div>«{section.instance}»</div>
                        </Section>
                      ))}
                    </>
                  </div>
                ))}
              </Body>
            </Card>
          )}

          {data.synonyms && (
            <Card title="Synonyms">
              <Body>
                {data.synonyms.map((synonym, i) => (
                  <Type key={`synonyms-${i}`}>
                    <i>{synonym.type}</i>
                    <List>
                      {synonym.content.map((section, j) => (
                        <li key={j}>{section.join(', ')}</li>
                      ))}
                    </List>
                  </Type>
                ))}
              </Body>
            </Card>
          )}

          {data.examples && (
            <Card title="Examples">
              <Body>
                <Examples>
                  {data.examples.map((example, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: example }} />
                  ))}
                </Examples>
              </Body>
            </Card>
          )}

          {data && data.seeAlso && (
            <Card title="See Also">
              <Body>
                <div>{data.seeAlso.join(', ')}</div>
              </Body>
            </Card>
          )}
        </Sticky>
      )}
    </>
  );
};

export default StickyCards;

const Sticky = styled.div`
  position: relative;
  overflow: scroll;
  max-height: 328px;
  font-size: 14px;
`;
const Body = styled.div`
  font-size: 12px;
`;
const Title = styled.div`
  & > span {
    color: white;
  }
`;
const Box = styled.div`
  margin-left: 70px;
  display: flex;
  border-bottom: 1px solid rgba(85, 85, 85, 0.3);
  &:last-child {
    border-bottom: 0;
  }
  & > div {
    display: flex;
    width: 210px;
  }
`;
const Type = styled.div`
  padding: 9px 18px;
  color: #aaa;
  border-bottom: 1px solid #555;

  &:last-child {
    border-bottom: 0;
  }
`;
const Rating = styled.div`
  width: 35px;
  margin-right: 5px;
  & > div {
    margin: 8px 0;
    height: 9px;
    background: rgba(26, 26, 26, 0.9);
    float: right;
  }
  .common {
    width: 35px;
  }
  .uncommon {
    width: 20px;
  }
  .rare {
    width: 10px;
  }
`;
const Word = styled.div`
  margin: 3px;
  color: white;
`;
const Article = styled.div`
  margin: 3px;
  min-width: 10px;
`;
const Values = styled.div`
  margin: 3px;
  color: #aaa;
  width: 380px;
`;
const Section = styled.div`
  margin-left: 70px;
  margin-top: 9px;
  & > div {
    margin: 3px;
  }
`;
const List = styled.ul`
  margin: 0;
  padding: 0;
  margin-top: 9px;
  margin-left: 85px;
  & > li {
    list-style-position: outside;
    margin-bottom: 6px;
    color: white;
  }
`;
const Examples = styled.div`
  & > li {
    color: #ccc;
    margin: 9px 18px 9px 9px;
  }
  & > li,
  b {
    color: white;
    font-weight: 700;
  }
`;
