import '../styles/globals.css';

import firebase from "firebase/app";
import logger from "@firebase-logger/web";
if (!firebase.apps.length) {
  console.log(process.env.NEXT_PUBLIC_FIREBASE_CONFIG)
  firebase.initializeApp(JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG));
}

function MyApp({ Component, pageProps }) {
  logger.init(true, null, 'loggers/mycustomtest', 'logs-mycustomtest');

  return <Component {...pageProps} />;
}

export default MyApp;
