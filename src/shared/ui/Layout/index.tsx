import { FC, ReactElement } from 'react';
import { isMac } from '@/platform';
import styles from './Layout.module.css';

type P = {
  title?: string;
  children?: ReactElement | ReactElement[] | string;
};

const Layout: FC<P> = ({ title = '', children }) => {
  return (
    <div className={styles.win}>
      {/* `-webkit-app-region` is an Electron shell integration and does nothing
          in WKWebView or WebView2; Tauri uses the data attribute instead.
          "deep" gives the Electron semantics of the whole subtree dragging. */}
      {isMac && (
        <div className={styles.frame} data-tauri-drag-region="deep">
          {title}
        </div>
      )}
      <>{children}</>
    </div>
  );
};

export default Layout;
