# Firebase logger - Get your (mobile) app logs remotely

This library allows you to log data from a web or mobile app to a Firebase Realtime Database, to be able to debug and
monitor remotely.

## ✨ Features

- Save logs to a Firebase Realtime Database
- Logs locally in development mode and remotely in production mode
- Remote and reactive triggerable log level to prevent logs' flooding
- Supports [firebase](https://www.npmjs.com/package/firebase) SDKs
  (if you are using [ReactNative firebase](https://www.npmjs.com/package/react-native-firebase) check `@firebase-logger/reactnative`)
- Save logs to a user-specific path, to easily find user's logs

## Get started

### Install the package

`npm i @firebase-logger/core @firebase-logger/web`
or
`yarn add @firebase-logger/core @firebase-logger/web`

### Prepare Firebase

If you already have a Firebase setup in your project, you can skip this part.

1. Create a Firebase project
2. Create the database with open rules (you can replace them later on with
   the [example rules](https://github.com/BearStudio/firebase-logger#example-database-rules))
3. Add an app to your project (get [help here](https://support.google.com/firebase/answer/9326094))
4. Get the config and initialize Firebase in your code:

```javascript
import firebase from "firebase/app";

if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
}
```

5. Finally, don't forget to create the logger in database that will contain the log level, for instance, add this to the
   database:

```json
{
  "loggers": {
    "production": {
      "level": "ERROR"
    }
  }
}
```

### Initialize the logger

```javascript
import logger from "@firebase-logger/web";

logger.init(process.env.NODE_ENV === 'production');
```

It will initialize the logger that will log remotely only in production mode, under the `logs/main` path, using
the `loggers/main`
You can re-initialize the logger as soon as the user is authenticated to prevent logging everything in the `anonymous`
path, but in the user-specific path. [Learn more](https://github.com/BearStudio/firebase-logger#reactnative-sdk)
TODO link

### It's ready, log messages
It can be used like the standard `console` object.
```javascript
import logger from '@firebase-logger/web'

logger.debug('Hello world');
logger.info('Hello world', 42);
logger.warn({ title: 'Hello', subtitle: 'World' });
logger.error(error);
logger.critical('Something bad happened');
```

## API

### init

| Parameter | Required | Default value | Usage |
| ------ | ------ | ------ | ------ |
| shouldLogRemotely | No | `true` | Logs to Firebase only if set to true, otherwise, uses the standard `console` methods like `console.error` |
| getUserId | No | `async () => 'anonymous'` | A function that returns a promise containing the user identifier as a string or a number |
| databaseLoggerPathOrNull | No | `'loggers/main'` | The database path to the logger data. Note that this is where the log level is defined ([see the sample data](https://github.com/BearStudio/firebase-logger#example-loggers-sample)) |
| databaseLogsCollectionOrNull | false | `'logs/main'` | The database path to the logs. It gets created automatically when logging |

### log

You can use the following methods to log information:

| Method | Logs when log level is |
| ------ | ------ |
| `debug` | `DEBUG` |
| `info` | `DEBUG`, `INFO` |
| `warn` | `DEBUG`, `INFO`, `WARN` |
| `error` | `DEBUG`, `INFO`, `WARN`, `ERROR` |
| `critical` | `DEBUG`, `INFO`, `WARN`, `ERROR`, `CRITICAL` |

All these methods accept as many arguments as you want to provide them.

## Samples

<details id="logger-initialization-user-id">
    <summary>Logger initialization with userId</summary>
    ```javascript
    const onUserAuthenticated = () => {
      logger.init(
        process.env.NODE_ENV === 'production',
        () => AsyncStorage.getItem('@myApp/userEMail'), // can return a promise
        'loggers/production',
        'logs/production'
      );
    }
    ```
</details>


<details id="example-database-rules">
    <summary>Example database rules</summary>
    ```json
    {
      "rules": {
        "loggers": {
          ".read": true,
          ".write": false
        },
        "logs-dev": {
          ".read": false,
          ".write": true
        },
        "logs-staging": {
          ".read": false,
          ".write": true
        },
        "logs-prod": {
          ".read": false,
          ".write": true
        }
      }
    }
    ```
</details>


<details id="example-loggers-sample">
    <summary>Example loggers sample</summary>
    ```json
    {
      "loggers": {
        "dev": {
          "level": "WARN"
        },
        "staging": {
          "level": "CRITICAL"
        },
        "prod": {
          "level": "CRITICAL"
        }
      }
    }
    ```
</details>
