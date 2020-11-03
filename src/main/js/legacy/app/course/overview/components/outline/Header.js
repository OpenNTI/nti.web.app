const Ext = require('@nti/extjs');
const {Overview} = require('@nti/web-course');

require('legacy/overrides/ReactHarness');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.outline.Header', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-outline-header',

	items: [],
	layout: 'none',

	async setOutline (bundle, outline) {
		const course = await bundle.getInterfaceInstance();

		if (this.outlineHeader) {
			this.outlineHeader.setProps({
				course,
				active: !this.wasDeactivated
			});
		} else {
			this.outlineHeader = this.add({
				xtype: 'react',
				component: Overview.Outline.Header,
				course,
				active: !this.wasDeactivated,
				addHistory: true,
				getRouteFor: (obj, context) => {}
			});
		}
	},

	onBeforeRouteActivate () {
		this.onRouteActivate();
	},

	onRouteActivate () {
		clearTimeout(this.deactivateTimeout);

		if (!this.wasDeactivated) { return null; }

		this.wasDeactivated = false;

		if (this.outlineHeader) {
			this.outlineHeader.setProps({active: true});
		}
	},

	onRouteDeactivate () {
		clearTimeout(this.deactivateTimeout);

		this.deactivateTimeout = setTimeout(() => {
			this.wasDeactivated = true;

			if (this.outlineHeader) {
				this.outlineHeader.setProps({active: false});
			}
		}, 1000);
	}
});
