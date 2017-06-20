const Ext = require('extjs');

const CoursesStateStore = require('./courses/StateStore');
const ContentStateStore = require('./content/StateStore');

require('../../common/StateStore');


module.exports = exports = Ext.define('NextThought.app.library.StateStore', {
	extend: 'NextThought.common.StateStore',

	constructor: function () {
		this.callParent(arguments);

		this.CourseStore = CoursesStateStore.getInstance();
		this.ContentStore = ContentStateStore.getInstance();
	},

	getTitle: function (id) {
		return this.ContentStore.getTitle(id);
	}
});
