const Ext = require('@nti/extjs');
const {wait} = require('@nti/lib-commons');

const WindowsStateStore = require('legacy/app/windows/StateStore');
const CourseCatalogEntry = require('legacy/model/courses/CourseCatalogEntry');

require('./CourseWindow');


module.exports = exports = Ext.define('NextThought.app.library.courses.components.available.CourseDetailWindow', {
	extend: 'NextThought.app.library.courses.components.available.CourseWindow',

	isSingle: true,

	initComponent: function () {
		this.callParent(arguments);

		var me = this;
		// Go ahead and show the course detail window
		me.showCourse(this.record);
		wait()
			.then(me.show.bind(me));
	},

	onBeforeClose: function () {
		var me = this,
			active = me.getLayout().getActiveItem(),
			warning;

		if (active && active.stopClose) {
			warning = active.stopClose();
		}

		if (warning) {
			warning
				.then(function () {
					me.doClose();
				});
			return false;
		}
	},

	onDrop: function (closeWindow) {
		// close window on drop or not?  for now, leave it open
		if(closeWindow) {
			this.doClose();
		}
	},

	addMask: function () {},

	handleClose: function () {
		this.doClose();
	}
}, function () {
	WindowsStateStore.register(CourseCatalogEntry.mimeType, this);
});
