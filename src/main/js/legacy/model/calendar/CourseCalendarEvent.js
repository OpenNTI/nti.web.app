const Ext = require('@nti/extjs');

require('./BaseEvent');

module.exports = exports = Ext.define('NextThought.model.CourseCalendarEvent', {
	extend: 'NextThought.model.BaseEvent',
	mimeType: 'application/vnd.nextthought.courseware.coursecalendarevent',

	statics: {
		mimeType: 'application/vnd.nextthought.courseware.coursecalendarevent',
	},

	fields: []

});
