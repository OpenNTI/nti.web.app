var Ext = require('extjs');
var CommonStateStore = require('../../common/StateStore');
var CoursesStateStore = require('./courses/StateStore');
var ContentStateStore = require('./content/StateStore');


module.exports = exports = Ext.define('NextThought.app.library.StateStore', {
	extend: 'NextThought.common.StateStore',

	constructor: function() {
		this.callParent(arguments);

		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
		this.ContentStore = NextThought.app.library.content.StateStore.getInstance();
	},

	getTitle: function(id) {
		return this.ContentStore.getTitle(id);
	}
});
