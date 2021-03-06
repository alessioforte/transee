import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Card } from '../../components';
import { TranslationData } from '../../services/interfaces';
import theme from '../../theme';

type Data = {
  invert?: boolean | undefined;
  value: string;
};

type Props = {
  google?: TranslationData | null;
  reverso?: any | null;
  onClick?: (data: Data) => void;
};

const StickyCards: FunctionComponent<Props> = ({
  google,
  reverso,
  onClick = () => null,
}) => {
  return (
    <Sticky>
      {reverso && reverso.contextResults && (
        <Card title="REVERSO">
          <Body>
            {reverso &&
              reverso.contextResults &&
              Array.isArray(reverso.contextResults.results) &&
              reverso.contextResults.results.map((item, idx) => (
                <Reverso key={`${item.translation}-${idx}`}>
                  <Title
                    onClick={() =>
                      onClick({ value: item.translation, invert: true })
                    }
                  >
                    {item.translation}
                  </Title>
                  <div className="examples">
                    {item.sourceExamples.map((sentence, i: number) => (
                      <div className="example" key={`${sentence}-${i}`}>
                        <div
                          className="sentence"
                          dangerouslySetInnerHTML={{ __html: sentence }}
                        />
                        <div
                          className="translation"
                          dangerouslySetInnerHTML={{
                            __html: item.targetExamples[i],
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </Reverso>
              ))}
          </Body>
        </Card>
      )}

      {google && (
        <>
          {google.translations && (
            <Card title="TRANSLATIONS">
              <Body>
                {google.translations.map((translation, i) => (
                  <table key={`translations-${i}`}>
                    <tbody>
                      <tr>
                        <td>
                          <Title>{translation[0] || ''}</Title>
                        </td>
                      </tr>
                      {translation[1] &&
                        translation[1].map((section, j) => (
                          <TrRow key={`translations${i}-${j}`}>
                            <Word>
                              <span className="art">{section[1] || ''}</span>
                              <span
                                onClick={() =>
                                  onClick({ value: section[0], invert: true })
                                }
                                className="word"
                              >
                                {section[0]}
                              </span>
                            </Word>
                            <td>
                              <Frequency value={section[3]} />
                            </td>
                            <td>
                              <Values>
                                {section[2].map((w) => (
                                  <span
                                    key={w}
                                    className="meaning"
                                    onClick={() => onClick({ value: w })}
                                  >
                                    {w}
                                  </span>
                                ))}
                              </Values>
                            </td>
                          </TrRow>
                        ))}
                    </tbody>
                  </table>
                ))}
              </Body>
            </Card>
          )}

          {google.definitions && (
            <Card title="DEFINITIONS">
              <Body>
                {google.definitions.map((definition, i) => (
                  <div key={`definitions-${i}`}>
                    <Title>{definition[0]}</Title>
                    <>
                      {definition[1].map((item, j) => (
                        <Section key={`definitions${i}-${j}`}>
                          <div style={{ color: '#fff' }}>{item[0]}</div>
                          <div>«{item[1]}»</div>
                          {item[3] && (
                            <Synonyms>
                              {item[3].map((word, idx) => (
                                <Badge
                                  key={`${word}-${idx}`}
                                  onClick={() => onClick({ value: word })}
                                >
                                  {word}
                                </Badge>
                              ))}
                            </Synonyms>
                          )}
                        </Section>
                      ))}
                    </>
                  </div>
                ))}
              </Body>
            </Card>
          )}

          {google.synonyms && (
            <Card title="SYNONYMS">
              <Body>
                {google.synonyms.map((synonym, i) => (
                  <div key={`synonyms-${i}`}>
                    <Title>{synonym[0]}</Title>
                    <>
                      {synonym[1].map((section, j) => (
                        <Section key={j}>
                          {section.map((words, ws) => (
                            <Synonyms key={`${j}-${ws}`}>
                              {words.map((word, w) => (
                                <Badge
                                  key={`${word}-${w}`}
                                  onClick={() => onClick({ value: word })}
                                >
                                  {word}
                                </Badge>
                              ))}
                            </Synonyms>
                          ))}
                        </Section>
                      ))}
                    </>
                  </div>
                ))}
              </Body>
            </Card>
          )}

          {google.examples && Array.isArray(google.examples) && (
            <Card title="EXAMPLES">
              <Body>
                <Examples>
                  {google.examples.map((example, i) => (
                    <li
                      key={`examples-${i}`}
                      dangerouslySetInnerHTML={{ __html: example }}
                    />
                  ))}
                </Examples>
              </Body>
            </Card>
          )}

          {google && google.seeAlso && (
            <Card title="SEE ALSO">
              <Body>
                <div>
                  {google.seeAlso.map((word, idx) => (
                    <Badge
                      key={`${word}-${idx}`}
                      onClick={() => onClick({ value: word })}
                    >
                      {word}
                    </Badge>
                  ))}
                </div>
              </Body>
            </Card>
          )}
        </>
      )}
    </Sticky>
  );
};

export default StickyCards;

const Frequency = ({ value }) => {
  const bg = colors.primary;
  return (
    <Rating>
      <div style={{ background: bg }}></div>
      <div style={{ background: value !== 3 ? bg : 'none' }}></div>
      <div
        style={{
          background: value === 1 ? bg : 'none',
        }}
      ></div>
    </Rating>
  );
};

const { colors } = theme;

const Sticky = styled.div`
  position: relative;
  overflow: scroll;
  max-height: 328px;
  font-size: 16px;
`;
const Body = styled.div`
  padding: 10px 0;
  color: #aaa;
`;
const Title = styled.h3`
  color: ${colors.text.primary};
  font-weight: bold;
  margin-bottom: 10px;
`;
const Rating = styled.div`
  width: 40px;
  height: 6px;
  margin: 10px 6px 5px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 1px;
  & > div {
    height: 100%;
    width: 100%;
  }
`;
const Word = styled.td`
  min-width: 180px;
  display: flex;
  justify-content: flex-end;
  .word {
    margin: 3px;
    color: ${colors.text.main};
    cursor: pointer;
  }
  .art {
    margin: 3px;
    min-width: 10px;
  }
`;
const Values = styled.div`
  margin: 3px;
  color: ${colors.text.soft};
  .meaning {
    margin: 0 3px;
    cursor: pointer;
  }
`;
const Section = styled.div`
  margin-left: 70px;
  margin-top: 9px;
`;
const Examples = styled.div`
  padding-top: 20px;
  & > li {
    color: ${colors.text.low};
    margin: 9px 18px 9px 9px;
  }
  & > li > b {
    color: ${colors.text.main};
    font-weight: 700;
  }
`;
const Reverso = styled.div`
  margin: 5px 0;
  h3 {
    cursor: pointer;
  }
  em {
    font-weight: bold;
    color: ${colors.text.main};
  }
  .examples {
    margin-bottom: 20px;
  }
  .example {
    margin-bottom: 30px;
  }
  .sentence {
    margin-bottom: 3px;
    color: ${colors.text.main};
  }
  .translation {
    font-size: 12px;
  }
`;
const Badge = styled.span`
  padding: 3px 5px;
  margin: 2px 3px 2px 0;
  border-radius: 5px;
  background: ${colors.groundzero};
  color: ${colors.text.main};
  cursor: pointer;
  &:hover {
    background: ${colors.primary};
  }
`;
const TrRow = styled.tr`
  font-size: 14px;
`;
const Synonyms = styled.div`
  display: flex;
  margin: 24px 0;
  flex-wrap: wrap;
`;
