const Ext = require('@nti/extjs');
const {Overview} = require('@nti/web-course');

const {MODAL_ROUTE_BUILDERS} = require('../Constants');

require('legacy/overrides/ReactHarness');

const getOutlineNode = (x) => x.parent('isOutlineNode');

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
				getRouteFor: (obj, context) => {
					const outlineNode = getOutlineNode(obj);

					if (!outlineNode) { return null; }

					const builder = MODAL_ROUTE_BUILDERS[obj.MimeType] || MODAL_ROUTE_BUILDERS['default'];

					return builder ? builder(course, outlineNode, obj, context) : null;
				}
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
