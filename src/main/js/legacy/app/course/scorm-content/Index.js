const Ext = require('extjs');
const { Scorm } = require('nti-web-course');
const { getService } = require('nti-web-client');

require('legacy/overrides/ReactHarness');

module.exports = exports = Ext.define('NextThought.app.course.scorm-content.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-scorm-content',
	title: 'Content',
	cls: 'course-scorm-content',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',
	items: [],

	statics: {
		showTab: function (bundle) {
			return bundle && bundle.isScormCourse && (bundle.hasLink('ImportSCORM') || bundle.Metadata.getLink('LaunchSCORM'));
		}
	},

	onRouteActivate () {
		this.setTitle('Content');
	},

	initComponent () {
		this.callParent(arguments);

		this.scormContent = this.add({
			xtype: 'react',
			component: Scorm,
		});
	},

	async bundleChanged (legacyBundle) {
		if (this.currentBundle === legacyBundle) { return; }

		this.currentBundle = legacyBundle;

		if (!legacyBundle) {
			delete this.currentBundle;
			return;
		}

		const service = await getService();

		const bundle = await service.getObject(legacyBundle.raw);

		this.scormContent.setProps({ bundle });
	},
});