/* eslint-disable no-console */

/**
 * Before using, you should know that this logger requires firebase to be installed,
 * and the database dependency.
 * This loggers aims to send logs to firebase to be able to debug remotely
 */

export type GetUserIdType = () => Promise<string | number>
interface SnapInterface {
  val: () => { level: string }
}
interface FirebaseInstanceInterface {
  ref: (refName: string) => {
    once: (onceName: string) => Promise<SnapInterface>,
    set: (object: unknown) => Promise<unknown>
  },
}
export type InitType = (
    firebaseDatabaseInstance: FirebaseInstanceInterface,
    shouldLogRemotely: boolean,
    getUserId: GetUserIdType | null,
    databaseLoggerPathOrNull: string | null,
    databaseLogsCollectionOrNull: string | null,
) => void;
export type ConsoleLogMethodType = (...args: unknown[]) => void;
export type LogMethodType = (firebaseInstance: any, ...args: unknown[]) => void;
// TODO FirebaseInstanceInterface


export type LoggerType = {
  debug: LogMethodType,
  info: LogMethodType,
  warn: LogMethodType,
  error: LogMethodType,
  critical: LogMethodType,
  init: InitType,
};

interface LogLevel {
  name: string,
  priority: number,
  localMethod: ConsoleLogMethodType,
}
// We define mutiple log levels. If the log level is CRITICAL
// only logs with priority >= to CRITICAL (4) will be logged
export const LOG_LEVELS: { [key: string]: LogLevel } = {
  DEBUG: {
    name: 'DEBUG',
    priority: 1,
    localMethod: console.debug,
  },
  INFO: {
    name: 'INFO',
    priority: 2,
    localMethod: console.info,
  },
  WARN: {
    name: 'WARN',
    priority: 3,
    localMethod: console.warn,
  },
  ERROR: {
    name: 'ERROR',
    priority: 4,
    localMethod: console.error,
  },
  CRITICAL: {
    name: 'CRITICAL',
    priority: 5,
    localMethod: console.error,
  },
};

let isDev = false;
let currentLogLevel = LOG_LEVELS.CRITICAL.name;
let userId: string | number | null = null;
let databaseLogsCollection: string;
/**
 * @param firebaseDatabaseInstance: The instance of the database to use to send the logs to.
 *
 * @param shouldLogRemotely: Aims at knowing if the logs should be sent to firebase or only displayed in the local
 * console with methods like console.debug.
 *
 * @param getUserId: [Optional] A function that returns a promise to get the userId of the current user or null.
 * If the function is not passed, the userId will be considered to be null, and the logs will be written in the
 * anonymous collection
 *
 * @param databaseLoggerPathOrNull: [Optional] The path of the logger to use. This is the path that should contain
 * a database document with a `level` field to listen to.
 * If its not set, the default value is "loggers/main"
 *
 * @param databaseLogsCollectionOrNull: [Optional] the collection where the logs will be saved.
 * If it's not set, the default collection name is "logs"
 */
const init = (
  firebaseDatabaseInstance: FirebaseInstanceInterface,
  shouldLogRemotely: boolean,
  getUserId: GetUserIdType | null,
  databaseLoggerPathOrNull: string | null,
  databaseLogsCollectionOrNull: string | null,
): void => {
  isDev = !shouldLogRemotely;
  databaseLogsCollection = databaseLogsCollectionOrNull || 'logs';
  const databaseLoggerPath = databaseLoggerPathOrNull || 'loggers/main';
  try {
    firebaseDatabaseInstance
      .ref(databaseLoggerPath)
      .once('value')
      .then((snap: SnapInterface) => {
        if (snap && snap.val() && snap.val().level) {
          currentLogLevel = snap.val().level;
          console.log('log level is', snap.val().level);
        } else {
          console.warn('Be carefull, log level is not defined in database');
        }
      });

    if (!getUserId) {
      return;
    }

    getUserId()
      .then((userIdOrNull: string | number | null) => {
        userId = userIdOrNull;
      })
      .catch((err: Error) => {
        console.warn('Error while getting user in storage', err);
      });
  } catch (e) {
    console.error(
      'An error occurred while trying to get logLevel in database. Did you create the database ?',
      e,
    );
  }
};

const removeSpecialCharacters = (string: string): string => string.replace(/[&/\\[\]#,+()$~%.'":*?<>{}]/g, '-');

const getLogPath = (): string => {
  const basePath = removeSpecialCharacters(
    `${new Date().toISOString()}-${Math.random() * 1000}`,
  );
  const userPath = removeSpecialCharacters((userId || 'anonymous').toString());
  return `${userPath}/${basePath}`;
};

const logMessage = (
  requiredLogLevel: LogLevel,
  firebaseDatabaseInstance: FirebaseInstanceInterface,
  ...infos: unknown[]
) => {
  if (isDev) {
    requiredLogLevel.localMethod(...infos);
  } else if (
    requiredLogLevel.priority >= LOG_LEVELS[currentLogLevel].priority
  ) {
    try {
      const messageToLog = infos.reduce(
        (acc, cur) => `${acc} , ${JSON.stringify(cur)}`,
      );
      firebaseDatabaseInstance
        .ref(`${databaseLogsCollection}/${getLogPath()}`)
        .set({
          level: requiredLogLevel.name,
          message: messageToLog,
        })
        .then()
        .catch();
    } catch (e) {
      console.error('Error while writing log in database', e);
    }
  }
};

const debug = (databaseInstance: FirebaseInstanceInterface, ...datas: unknown[]): void => {
  logMessage(LOG_LEVELS.DEBUG, databaseInstance, ...datas);
};

const info = (databaseInstance: FirebaseInstanceInterface, ...datas: unknown[]): void => {
  logMessage(LOG_LEVELS.INFO, databaseInstance, ...datas);
};

const warn = (databaseInstance: FirebaseInstanceInterface, ...datas: unknown[]): void => {
  logMessage(LOG_LEVELS.WARN, databaseInstance, ...datas);
};

const error = (databaseInstance: FirebaseInstanceInterface, ...datas: unknown[]): void => {
  logMessage(LOG_LEVELS.ERROR, databaseInstance, ...datas);
};

const critical = (databaseInstance: FirebaseInstanceInterface, ...datas: unknown[]): void => {
  logMessage(LOG_LEVELS.CRITICAL, databaseInstance, ...datas);
};

const coreLogger: LoggerType = {
  debug,
  info,
  warn,
  error,
  critical,
  init,
};

export default coreLogger;
