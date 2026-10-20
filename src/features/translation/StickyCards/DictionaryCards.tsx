import { Card, ScrollArea } from '@/shared/ui';
import { GoogleDictionary } from '@/services/google/dictionary';
import styles from './StickyCards.module.css';

type Props = {
  dictionary: GoogleDictionary;
  onClick: (data: { value: string; invert?: boolean }) => void;
};

export default function DictionaryCards({ dictionary, onClick }: Props) {
  const badges = (words: string[]) => words.map((word) => (
    <button type="button" key={word} className={styles.badge} onClick={() => onClick({ value: word })}>
      {word}
    </button>
  ));

  return (
    <ScrollArea className={styles.sticky} label={`Dictionary: ${dictionary.headword}`} scrollbars="xy">
      {dictionary.translations.length > 0 && (
        <Card title="TRANSLATIONS">
          <div className={styles.body}>
            {dictionary.translations.map((group, index) => (
              <table key={`${group.partOfSpeech}-${index}`}>
                <tbody>
                  <tr><td colSpan={2}><h3 className={styles.title}>{group.partOfSpeech}</h3></td></tr>
                  {group.entries.map((entry) => (
                    <tr className={styles.trRow} key={entry.text}>
                      <td className={styles.word}>
                        <button type="button" className={styles.word__text} onClick={() => onClick({ value: entry.text, invert: true })}>
                          {entry.text}
                        </button>
                      </td>
                      <td><div className={styles.values}>
                        {entry.reverseTranslations.map((word) => (
                          <button type="button" key={word} className={styles.meaning} onClick={() => onClick({ value: word })}>{word}</button>
                        ))}
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        </Card>
      )}

      {dictionary.definitions.length > 0 && (
        <Card title="DEFINITIONS">
          <div className={styles.body}>
            {dictionary.definitions.map((group, index) => (
              <div key={`${group.partOfSpeech}-${index}`}>
                <h3 className={styles.title}>{group.partOfSpeech}</h3>
                {group.entries.map((entry) => (
                  <div className={styles.section} key={entry.text}>
                    <div className={styles.definition}>{entry.text}</div>
                    {entry.example && <div>«{entry.example}»</div>}
                    {entry.synonyms.length > 0 && <div className={styles.synonyms}>{badges(entry.synonyms)}</div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {dictionary.synonyms.length > 0 && (
        <Card title="SYNONYMS">
          <div className={styles.body}>
            {dictionary.synonyms.map((group, index) => (
              <div key={`${group.partOfSpeech}-${index}`}>
                <h3 className={styles.title}>{group.partOfSpeech}</h3>
                {group.entries.map((entry, index) => (
                  <div className={styles.section} key={index}>
                    {entry.labels.length > 0 && <div>{entry.labels.join(', ')}</div>}
                    <div className={styles.synonyms}>{badges(entry.words)}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      )}

      {dictionary.examples.length > 0 && (
        <Card title="EXAMPLES">
          <ul className={styles.examples}>
            {dictionary.examples.map((example) => <li key={example}>{example}</li>)}
          </ul>
        </Card>
      )}
    </ScrollArea>
  );
}
