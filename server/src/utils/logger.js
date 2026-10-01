'use strict';

/**
 * Minimal structured logger.
 * In production, swap this with Winston / Pino as needed.
 */

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = levels[process.env.LOG_LEVEL] ?? levels.info;

const fmt = (level, ...args) => {
  const ts = new Date().toISOString();
  console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
    `[${ts}] [${level.toUpperCase()}]`,
    ...args
  );
};

const logger = {
  error: (...a) => currentLevel >= levels.error && fmt('error', ...a),
  warn: (...a) => currentLevel >= levels.warn && fmt('warn', ...a),
  info: (...a) => currentLevel >= levels.info && fmt('info', ...a),
  debug: (...a) => currentLevel >= levels.debug && fmt('debug', ...a),
};

module.exports = logger;
