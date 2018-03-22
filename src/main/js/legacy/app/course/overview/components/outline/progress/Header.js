const Ext = require('extjs');
const {getService} = require('nti-web-client');
const {ProgressWidgets} = require('nti-web-course');

require('./Progress');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.outline.progress.Header', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-outline-progress-header',


	cls: 'outline-header',

	async getCourseInstance () {
		const service = await getService();
		const obj = await service.getObject(this.bundle.rawData);

		return obj;
	},

	initComponent () {
		this.callParent(arguments);

		this.getCourseInstance().then(course => {
			this.add({
				xtype: 'react',
				component: ProgressWidgets.OutlineHeader,
				course
			});
		});
	}
});
