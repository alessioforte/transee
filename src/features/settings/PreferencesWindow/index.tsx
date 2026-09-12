import { FC } from 'react';
import { Toggle } from '@/shared/ui';
import RecordShortcut from '../RecordShortcut';
import Layout from '@/shared/ui/Layout';
import { useSettings } from '@/stores/settings';
import styles from './Preferences.module.css';

const Preferences: FC = () => {
  // One selector per field: toggling "check for updates" no longer re-renders
  // the shortcut recorder.
  const shortcut = useSettings((s) => s.shortcut);
  const startAtLogin = useSettings((s) => s.startAtLogin);
  const checkUpdates = useSettings((s) => s.checkUpdates);
  const setShortcut = useSettings((s) => s.setShortcut);
  const setStartAtLogin = useSettings((s) => s.setStartAtLogin);
  const setCheckUpdates = useSettings((s) => s.setCheckUpdates);
  const restoreSettings = useSettings((s) => s.restoreSettings);

  return (
    <Layout title="Preferences">
      <div className={styles.section}>
        <span className={styles.title}>Generals</span>
        <div className={styles.option}>
          <div className={styles.label}>
            Auto start at login
            <Toggle
              name="login"
              value={startAtLogin}
              onChange={(data) => setStartAtLogin(data.value)}
            />
          </div>
        </div>

        <div className={styles.option}>
          <div className={styles.label}>
            Check automatically for updates
            <Toggle
              name="update"
              value={checkUpdates}
              onChange={(data) => setCheckUpdates(data.value)}
            />
          </div>
        </div>

        <div className={styles.option} data-no-border="true">
          <div className={styles.label}>
            Define a shortcut
            <RecordShortcut
              initialValue={shortcut}
              onChange={(data) => data.value && setShortcut(data.value)}
            />
          </div>
          <div className={styles.comment}>
            The shortcut must contain at least ctrl or cmd, you can add shift or
            alt if you want, and finally a letter or number. Pay attention to not
            use a system shortcuts or any other that can interfere with other
            programs.
          </div>
        </div>
      </div>

      <div className={styles.section} data-no-border="true">
        <div className={styles.option} data-no-border="true">
          <div className={styles.label}>
            Restore default settings
            <button className={styles.button} onClick={restoreSettings}>
              Restore
            </button>
          </div>
          <div className={styles.comment}>Transee will be restarted.</div>
        </div>
      </div>
    </Layout>
  );
};

export default Preferences;
