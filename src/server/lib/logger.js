const Logger = require('nti-util-logger').default;

const logger = Logger.get('server-side:webapp');

module.exports = {

	info () {
		logger.info(...arguments);
	},


	error () {
		logger.error(...arguments);
	},


	warn () {
		logger.warn(...arguments);
	},


	debug () {
		logger.debug(...arguments);
	}

};
