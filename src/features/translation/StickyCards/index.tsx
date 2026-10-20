import { FunctionComponent } from 'react';
import { Card, ScrollArea } from '@/shared/ui';
import { Mapped } from '@/services/google/parse';
import DictionaryCards from './DictionaryCards';
import styles from './StickyCards.module.css';

type Data = {
  invert?: boolean | undefined;
  value: string;
};

type Props = {
  google?: Mapped | null;
  onClick?: (data: Data) => void;
};

/** Google returns a 1-3 "common-ness" rank; 1 is the most common. */
const Frequency = ({ value }: { value: number }) => (
  <div className={styles.rating}>
    <div data-on="true" />
    <div data-on={value !== 3} />
    <div data-on={value === 1} />
  </div>
);

const StickyCards: FunctionComponent<Props> = ({ google, onClick = () => null }) => {
  if (!google) return null;
  if (google.dictionary) return <DictionaryCards dictionary={google.dictionary} onClick={onClick} />;

  return (
    <ScrollArea className={styles.sticky} label="Translation details" scrollbars="xy">
      {google.translations && (
        <Card title="TRANSLATIONS">
          <div className={styles.body}>
            {google.translations.map((translation: any, i: number) => (
              <table key={`translations-${i}`}>
                <tbody>
                  <tr>
                    <td>
                      <h3 className={styles.title}>{translation[0] || ''}</h3>
                    </td>
                  </tr>
                  {translation[1] &&
                    translation[1].map((section: any, j: number) => (
                      <tr className={styles.trRow} key={`translations${i}-${j}`}>
                        <td className={styles.word}>
                          <span className={styles.word__article}>{section[1] || ''}</span>
                          <span
                            onClick={() =>
                              onClick({ value: section[0], invert: true })
                            }
                            className={styles.word__text}
                          >
                            {section[0]}
                          </span>
                        </td>
                        <td>
                          <Frequency value={section[3]} />
                        </td>
                        <td>
                          <div className={styles.values}>
                            {section[2].map((w: string) => (
                              <span
                                key={w}
                                className={styles.meaning}
                                onClick={() => onClick({ value: w })}
                              >
                                {w}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ))}
          </div>
        </Card>
      )}

      {google.definitions && (
        <Card title="DEFINITIONS">
          <div className={styles.body}>
            {google.definitions.map((definition: any, i: number) => (
              <div key={`definitions-${i}`}>
                <h3 className={styles.title}>{definition[0]}</h3>
                {definition[1].map((item: any, j: number) => (
                  <div className={styles.section} key={`definitions${i}-${j}`}>
                    <div className={styles.definition}>{item[0]}</div>
                    <div>«{item[1]}»</div>
                    {item[3] && (
                      <div className={styles.synonyms}>
                        {item[3].map((word: string, idx: number) => (
                          <span
                            className={styles.badge}
                            key={`${word}-${idx}`}
                            onClick={() => onClick({ value: word })}
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {google.synonyms && (
        <Card title="SYNONYMS">
          <div className={styles.body}>
            {google.synonyms.map((synonym: any, i: number) => (
              <div key={`synonyms-${i}`}>
                <h3 className={styles.title}>{synonym[0]}</h3>
                {synonym[1].map((section: any, j: number) => (
                  <div className={styles.section} key={j}>
                    {section.map((words: string[], ws: number) => (
                      <div className={styles.synonyms} key={`${j}-${ws}`}>
                        {words.map((word: string, w: number) => (
                          <span
                            className={styles.badge}
                            key={`${word}-${w}`}
                            onClick={() => onClick({ value: word })}
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {google.examples && Array.isArray(google.examples) && (
        <Card title="EXAMPLES">
          <div className={styles.body}>
            <div className={styles.examples}>
              {google.examples.map((example: string, i: number) => (
                <li
                  key={`examples-${i}`}
                  dangerouslySetInnerHTML={{ __html: example }}
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      {google.seeAlso && (
        <Card title="SEE ALSO">
          <div className={styles.body}>
            <div>
              {google.seeAlso.map((word: string, idx: number) => (
                <span
                  className={styles.badge}
                  key={`${word}-${idx}`}
                  onClick={() => onClick({ value: word })}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}
    </ScrollArea>
  );
};

export default StickyCards;
