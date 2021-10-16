import firebaseDatabaseInstance from 'firebase/database';

import coreLogger, { GetUserIdType, LogMethodType } from '@firebase-logger/core';

type InitType = (
    shouldLogRemotely: boolean,
    getUserId: GetUserIdType | null,
    databaseLoggerPathOrNull: string | null,
    databaseLogsCollectionOrNull: string | null,
) => void;
type LoggerType = {
  debug: LogMethodType,
  info: LogMethodType,
  warn: LogMethodType,
  error: LogMethodType,
  critical: LogMethodType,
  init: InitType,
};

/**
 * @param shouldLogRemotely: Aims at knowing if the logs should be sent to firebase or
 * only displayed in the local console with methods like console.debug.
 *
 * @param getUserId: [Optional] A function that returns a promise to get the userId
 * of the current user or null.
 * If the function is not passed, the userId will be considered to be null,
 * and the logs will be written in the anonymous collection
 *
 * @param databaseLoggerPathOrNull: [Optional] The path of the logger to use.
 * This is the path that should contain a database document with a `level` field to listen to.
 * If its not set, the default value is "loggers/main"
 *
 * @param databaseLogsCollectionOrNull: [Optional] the collection where the logs will be saved.
 * If it's not set, the default collection name is "logs"
 */
const init = (
  shouldLogRemotely: boolean,
  getUserId: GetUserIdType | null,
  databaseLoggerPathOrNull: string | null,
  databaseLogsCollectionOrNull: string | null,
): void => {
  coreLogger.init(
    firebaseDatabaseInstance,
    shouldLogRemotely,
    getUserId,
    databaseLoggerPathOrNull,
    databaseLogsCollectionOrNull,
  );
};

/**
 * Logs with a log level set to debug.
 * @param datas all the pieces of data to log.
 */
const debug = (...datas: unknown[]): void => {
  coreLogger.debug(firebaseDatabaseInstance, ...datas);
};

/**
 * Logs with a log level set to info.
 * @param datas all the pieces of data to log.
 */
const info = (...datas: unknown[]): void => {
  coreLogger.info(firebaseDatabaseInstance, ...datas);
};

/**
 * Logs with a log level set to warn.
 * @param datas all the pieces of data to log.
 */
const warn = (...datas: unknown[]): void => {
  coreLogger.warn(firebaseDatabaseInstance, ...datas);
};

/**
 * Logs with a log level set to error.
 * @param datas all the pieces of data to log.
 */
const error = (...datas: unknown[]): void => {
  coreLogger.error(firebaseDatabaseInstance, ...datas);
};

/**
 * Logs with a log level set to critical.
 * @param datas all the pieces of data to log.
 */
const critical = (...datas: unknown[]): void => {
  coreLogger.critical(firebaseDatabaseInstance, ...datas);
};

const logger: LoggerType = {
  debug,
  info,
  warn,
  error,
  critical,
  init,
};

export default logger;
