import '../styles/globals.css';

import { initializeApp, getApps } from 'firebase/app';
import logger from "@firebase-logger/web";
if (!getApps().length) {
  console.log(process.env.NEXT_PUBLIC_FIREBASE_CONFIG)
  initializeApp(JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG));
}

function MyApp({ Component, pageProps }) {
  logger.init(true, null, 'loggers/mycustomtest', 'logs-mycustomtest');

  return <Component {...pageProps} />;
}

export default MyApp;
