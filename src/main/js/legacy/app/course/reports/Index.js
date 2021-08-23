const Ext = require('@nti/extjs');

require('internal/legacy/mixins/Router');

module.exports = exports = Ext.define('NextThought.app.course.reports.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-reports',

	title: 'Reports',

	mixins: {
		Router: 'NextThought.mixins.Router',
	},

	statics: {
		showTab: function (bundle) {
			var reportLinks =
				bundle && bundle.getReportLinks && bundle.getReportLinks();

			return false && reportLinks && !bundle.get('Preview');
		},
	},

	items: [{ xtype: 'box', autoEl: { html: 'reports' } }],

	onActivate: function () {
		this.setTitle(this.title);
	},

	bundleChanged: function (bundle) {},
});
