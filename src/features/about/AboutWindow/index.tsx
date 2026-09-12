import { FC } from 'react';
import Layout from '@/shared/ui/Layout';
import icon from '@assets/icon_256x256.png';
import { openExternal } from '@/platform';
import { useSettings } from '@/stores/settings';
import styles from './About.module.css';

const HOMEPAGE = 'https://alessioforte.github.io/transee/';

const About: FC = () => {
  const version = useSettings((s) => s.version);

  return (
    <Layout title="About">
      <div className={styles.style}>
        <div className={styles.container}>
          <img className={styles.icon} src={icon} alt="Transee" />

          <div className={styles.details}>
            <div className={styles.title}>
              <b>Transee</b>
            </div>
            <div className={styles.version}>{version}</div>
            <div className={styles.site}>
              website:{' '}
              <a className={styles.link} onClick={() => openExternal(HOMEPAGE)}>
                transee
              </a>
            </div>
            <div className={styles.author}>
              <p>
                Created with <span>❤</span> by <b>Alessio Forte</b>
                <br />
                {`Copyright © ${new Date().getFullYear()}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
