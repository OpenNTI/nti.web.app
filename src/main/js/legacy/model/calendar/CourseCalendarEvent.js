const Ext = require('@nti/extjs');

require('../Base');

module.exports = exports = Ext.define('NextThought.model.CourseCalendarEvent', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.courseware.coursecalendarevent',

	statics: {
		mimeType: 'application/vnd.nextthought.courseware.coursecalendarevent',
	},

	fields: [
		{name: 'title',       type: 'string'},
		{name: 'description', type: 'string'},
		{name: 'location',    type: 'string'},
		{name: 'icon',        type: 'string'},
		{name: 'start_time',  type: 'date'  },
		{name: 'end_time',    type: 'date'  }
	]

});
