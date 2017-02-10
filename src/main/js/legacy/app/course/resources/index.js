const Ext = require('extjs');
const Resources = require('nti-web-course-resources');

debugger;

require('legacy/overrides/ReactHarness');
require('legacy/mixins/Router');

module.exports = exports = Ext.define('NextThought.app.course.resources.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-resources',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',
	items: [],

	initComponent () {
		this.callParent(arguments);

		this.resources = this.add({
			xtype: 'react',
			component: Resources,
			gotoResource: (id) => this.gotoResource(id)
		});

		this.initRouter();

		this.addRoute('/readings', this.showReadings.bind(this));
		this.addRoute('/readings/:id', this.showReading.bind(this));

		this.addDefaultRoute('/readings');
	},


	bundleChanged (bundle) {
		this.currentBundle = bundle;
	},


	showReadings () {
		this.resources.setProps({
			course: this.currentBundle,
			activeType: Resources.READINGS,
			activeResource: null
		});

		return Promise.resolve();
	},


	showReading () {
		debugger;
	},


	gotoResources (id) {
		debugger;
	}
});
