const Ext = require('@nti/extjs');
const {ProgressWidgets} = require('@nti/web-course');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.outline.progress.Header', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-outline-progress-header',


	cls: 'outline-header',


	initComponent () {
		this.callParent(arguments);

		this.addHeader();
	},


	addHeader () {
		if (!this.header) {
			this.header = this.add({
				xtype: 'react',
				component: ProgressWidgets.OutlineHeader,
				course: this.course
			});
		}
	},


	removeHeader () {
		if (this.header) {
			this.header.destroy();
			delete this.header;
		}
	},


	updateCourse (course) {
		this.course = course;

		if (this.header) {
			this.header.setProps({course});
		}
	},


	onRouteActivate () {
		clearTimeout(this.deactivateTimeout);

		if (!this.wasDeactivated) { return null; }

		this.wasDeactivated = false;

		this.addHeader();

		this.course.refreshPreferredAccess()
			.then(() => {
				this.removeHeader();
				this.addHeader();
			});
	},


	onRouteDeactivate () {
		this.deactivateTimeout = setTimeout(() => {
			this.wasDeactivated = true;

			this.removeHeader();
		}, 100);
	}
});
