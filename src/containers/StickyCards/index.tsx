import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Card } from '../../components';
import { TranslationData } from '../../services/interfaces';
import theme, { getColorLuminance } from '../../theme';

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
      {((google && google.examples) || (reverso && reverso.contextResults)) && (
        <Card title="EXAMPLES">
          <Body>
            {reverso &&
              reverso.contextResults &&
              Array.isArray(reverso.contextResults.results) &&
              reverso.contextResults.results.map((item, idx) => (
                <Reverso key={`${item.translation}-${idx}`}>
                  <h3
                    onClick={() =>
                      onClick({ value: item.translation, invert: true })
                    }
                  >
                    {item.translation}
                  </h3>
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
            {google && google.examples && Array.isArray(google.examples) && (
              <Examples>
                {google.examples.map((example, i) => (
                  <li
                    key={`examples-${i}`}
                    dangerouslySetInnerHTML={{ __html: example }}
                  />
                ))}
              </Examples>
            )}
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
                      <TrTitle>
                        <td>{translation.type}</td>
                      </TrTitle>
                      {translation.content.map((section, j) => (
                        <TrRow key={`translations${i}-${j}`}>
                          <Word>
                            <span className="art">{section.article || ''}</span>
                            <span
                              onClick={() =>
                                onClick({ value: section.word, invert: true })
                              }
                              className="word"
                            >
                              {section.word}
                            </span>
                          </Word>
                          <td>
                            <Rating>
                              <div className={section.bar}></div>
                            </Rating>
                          </td>
                          <td>
                            <Values>
                              {section.meaning.map((w) => (
                                <span
                                  key={w}
                                  className="meaning"
                                  onClick={() =>
                                    onClick({ value: w })
                                  }
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
                    <span>{definition.type}</span>
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

          {google.synonyms && (
            <Card title="SYNONYMS">
              <Body>
                {google.synonyms.map((synonym, i) => (
                  <Type key={`synonyms-${i}`}>
                    <span>{synonym.type}</span>
                    <List>
                      {synonym.content.map((section, j) => (
                        <div key={j}>
                          {section.map((word, idx) => (
                            <Badge
                              key={`${word}-${idx}`}
                              onClick={() => onClick({ value: word })}
                            >
                              {word}
                            </Badge>
                          ))}
                        </div>
                      ))}
                    </List>
                  </Type>
                ))}
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
const Type = styled.div`
  padding: 9px 18px;
  color: ${colors.text.main};

  &:last-child {
    border-bottom: 0;
  }
`;
const Rating = styled.div`
  width: 35px;
  margin: 0 10px;
  & > div {
    margin: 8px 0;
    height: 9px;
    background: ${colors.groundzero};
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
  & > div {
    margin: 3px;
  }
`;
const List = styled.ul`
  margin: 0;
  padding: 0;
  margin-top: 9px;
  margin-left: 85px;
  & > div {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 6px;
    color: ${colors.text.main};
  }
`;
const Examples = styled.div`
  border-top: 1px solid ${colors.foreground};
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
    color: ${colors.text.main};
    font-weight: bold;
    margin-bottom: 10px;
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
  margin: 2px 3px;
  border-radius: 5px;
  background: ${colors.groundzero};
  color: ${colors.text.main};
  cursor: pointer;
  &:hover {
    background: ${getColorLuminance(colors.groundzero, 2)};
  }
`;
const TrTitle = styled.tr`
  height: 30px;
  color: ${colors.text.main};
  font-weight: bold;
  border-bottom: 1px solid ${colors.foreground};
`;
const TrRow = styled.tr`
  font-size: 14px;
`;
