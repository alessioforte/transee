import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Card } from '../../components';
import { TranslationData } from '../../services/interfaces';

type Data = {
  invert: boolean;
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
        <Card renderHeader={() => <Title>examples</Title>}>
          <Body>
            {reverso &&
              reverso.contextResults &&
              Array.isArray(reverso.contextResults.results) &&
              reverso.contextResults.results.map((item) => (
                <Reverso key={item.translation}>
                  <h3>{item.translation}</h3>
                  <div className="examples">
                    {item.sourceExamples.map((sentence, i: number) => (
                      <div className="example" key={sentence}>
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
                  <li key={i} dangerouslySetInnerHTML={{ __html: example }} />
                ))}
              </Examples>
            )}
          </Body>
        </Card>
      )}

      {google && (
        <>
          {google.translations && (
            <Card renderHeader={() => <Title>translations</Title>}>
              <Body>
                {google.translations.map((translation, i) => (
                  <table key={`translations${i}`}>
                    <tbody>
                      <TrTitle>
                        <td>{translation.type}</td>
                      </TrTitle>
                      {translation.content.map((section, j) => (
                        <TrRow key={`translations${i}-${j}`}>
                          <Word>
                            <span className="art">{section.article || ''}</span>
                            <span className="word">{section.word}</span>
                          </Word>
                          <td>
                            <Rating>
                              <div className={section.bar}></div>
                            </Rating>
                          </td>
                          <td>
                            <Values>{section.meaning.join(', ')}</Values>
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
            <Card renderHeader={() => <Title>definitions</Title>}>
              <Body>
                {google.definitions.map((definition, i) => (
                  <div key={`definitions${i}`}>
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
            <Card title="synonyms">
              <Body>
                {google.synonyms.map((synonym, i) => (
                  <Type key={`synonyms-${i}`}>
                    <span>{synonym.type}</span>
                    <List>
                      {synonym.content.map((section, j) => (
                        <div key={j}>
                          {section.map((word) => (
                            <Badge
                              key={word}
                              onClick={() =>
                                onClick({ value: word, invert: false })
                              }
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
            <Card title="see Also">
              <Body>
                <div>
                  {google.seeAlso.map((word) => (
                    <Badge
                      onClick={() => onClick({ value: word, invert: false })}
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
const Title = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  .target {
    color: white;
  }
  & > span {
    margin-right: 5px;
  }
`;
// const Box = styled.div`
//   margin-left: 70px;
//   display: flex;
//   border-bottom: 1px solid rgba(85, 85, 85, 0.3);
//   &:last-child {
//     border-bottom: 0;
//   }
//   & > div {
//     display: flex;
//     width: 210px;
//   }
// `;
const Type = styled.div`
  padding: 9px 18px;
  color: #fff;
  /* border-bottom: 1px solid #555; */

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
const Word = styled.td`
  min-width: 180px;
  display: flex;
  justify-content: flex-end;
  .word {
    margin: 3px;
    color: white;
  }
  .art {
    margin: 3px;
    min-width: 10px;
  }
`;
const Values = styled.div`
  margin: 3px;
  color: #aaa;
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
    color: white;
  }
`;
const Examples = styled.div`
  border-top: 1px solid #555;
  padding-top: 20px;
  & > li {
    color: #ccc;
    margin: 9px 18px 9px 9px;
  }
  & > li > b {
    color: white;
    font-weight: 700;
  }
`;
const Reverso = styled.div`
  margin: 5px 0;
  h3 {
    color: white;
    font-weight: bold;
    margin-bottom: 10px;
  }
  em {
    font-weight: bold;
    color: #fff;
  }
  .examples {
    margin-bottom: 20px;
  }
  .example {
    margin-bottom: 10px;
  }
  .sentence {
    margin-bottom: 3px;
    color: #fff;
  }
  .translation {
    font-size: 12px;
  }
`;
const Badge = styled.span`
  padding: 3px 5px;
  margin: 2px 3px;
  border-radius: 5px;
  background: #212121;
  color: #fff;
  cursor: pointer;
`;
const TrTitle = styled.tr`
  height: 30px;
  color: #fff;
  font-weight: bold;
  border-bottom: 1px solid #555;
`;
const TrRow = styled.tr`
  font-size: 14px;
`;
