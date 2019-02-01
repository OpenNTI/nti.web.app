const {isFeature} = require('legacy/util/Globals');

module.exports = exports = isFeature('react-course-roster')
	? require('./RosterReact')
	: require('./RosterExt');

