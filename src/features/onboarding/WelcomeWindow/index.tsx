import { FC, useState } from 'react';
import { Checkbox, Icon } from '@/shared/ui';
import icon from '@assets/icon_256x256.png';
import menubarIMG from '@assets/menubar.png';
import taskbarIMG from '@assets/taskbar.png';
import Layout from '@/shared/ui/Layout';
import { isWin } from '@/platform';
import { useSettings } from '@/stores/settings';
import styles from './Welcome.module.css';

/** Card width (350px) plus its two 32px margins — see Welcome.module.css. */
const CARD_STEP = 414;
const CARD_COUNT = 3;

const barIMG = isWin ? taskbarIMG : menubarIMG;

type NavigatorProps = {
  count: number;
  active: number;
  onClick: (index: number) => void;
};

const Navigator: FC<NavigatorProps> = ({ count, active, onClick }) => (
  <div className={styles.dots}>
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className={styles.dot}
        data-active={i === active}
        onClick={() => onClick(i)}
      />
    ))}
  </div>
);

const Welcome: FC = () => {
  const shortcut = useSettings((s) => s.shortcut);
  const showWelcome = useSettings((s) => s.showWelcome);
  const setShowWelcome = useSettings((s) => s.setShowWelcome);

  const barTitle = isWin ? 'Taskbar' : 'Menu bar';
  const barName = isWin ? 'taskbar' : 'menu bar';

  // `left` used to be a second piece of state kept in sync by hand; it is
  // purely a function of `active`.
  const [active, setActive] = useState(0);
  const left = active * -CARD_STEP;

  return (
    <Layout title="Welcome Guide">
      <div
        className={`${styles.arrow} ${styles.arrowLeft}`}
        onClick={() => setActive((prev) => prev - 1)}
        style={{ display: active === 0 ? 'none' : 'block' }}
      >
        <Icon name="arrow" />
      </div>

      <div
        className={`${styles.arrow} ${styles.arrowRight}`}
        onClick={() => setActive((prev) => prev + 1)}
        style={{ display: active === CARD_COUNT - 1 ? 'none' : 'block' }}
      >
        <Icon name="arrow" />
      </div>

      <div className={styles.header}>
        <img src={icon} height="80px" alt="Transee" />
        <div>
          <div className={styles.title}>Transee</div>
          <div className={styles.details}>
            Simple and useful tool for quick translation
          </div>
        </div>
      </div>

      <div className={styles.cards} style={{ marginLeft: left }}>
        <div className={styles.card}>
          <h2>Start</h2>
          Transee is always at your fingertips.
          <br />
          {shortcut ? (
            <>
              Press <div className={styles.short}>{shortcut}</div> and start.
              <br />
              Click anywhere on your desktop
              <br />
              to hide the translation bar
              <br />
              or press the <div className={styles.short}>Esc</div> key.
            </>
          ) : (
            <>
              Register a shortcut
              <br />
              for a better user experience
              <br />
              or open translation bar from menu.
              <br />
              <br />
            </>
          )}
          <div className={styles.note}>
            You can change the shortcut in preferences window.
          </div>
        </div>

        <div className={styles.card}>
          <h2>{barTitle}</h2>
          <img src={barIMG} style={{ margin: 18 }} alt={barTitle} />
          <br />
          Transee lives in your {barName}
          <br />
          and it starts automatically,
          <br />
          so you can forget about it.
        </div>

        <div className={styles.card}>
          <h2>Other shortcuts</h2>
          Try them to speed up your translations.
          <div
            style={{ display: 'flex', justifyContent: 'center', marginTop: 9 }}
          >
            <div style={{ textAlign: 'right' }}>
              <div className={styles.row}>
                <div className={styles.short}>Tab</div>
              </div>
              {/* The guide used to advertise Alt+Shift here, but the handler in
                  useWindowKeyDown has always listened for Ctrl+I. */}
              <div className={styles.row}>
                <div className={styles.short}>Ctrl+I</div>
              </div>
              <div className={styles.row}>
                <div className={styles.short}>Ctrl+P</div>
              </div>
              <div className={styles.row}>
                <div className={styles.short}>Ctrl+Alt+P</div>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div className={styles.row}>Complete the suggestion</div>
              <div className={styles.row}>Invert languages</div>
              <div className={styles.row}>Listen pronunciation</div>
              <div className={styles.row}>Listen translated pronunciation</div>
            </div>
          </div>
        </div>
      </div>

      <Navigator count={CARD_COUNT} active={active} onClick={setActive} />

      <div className={styles.option}>
        <div className={styles.label}>
          <Checkbox
            value={showWelcome}
            onChange={(data) => setShowWelcome(data.value)}
          />
          Show Welcome Guide when opening Transee
        </div>
      </div>
    </Layout>
  );
};

export default Welcome;
