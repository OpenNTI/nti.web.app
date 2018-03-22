const Ext = require('extjs');
const {ProgressWidgets} = require('nti-web-course');

require('./Progress');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.outline.progress.Header', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-outline-progress-header',


	cls: 'outline-header',

	initComponent () {
		this.callParent(arguments);

		this.add({
			xtype: 'react',
			component: ProgressWidgets.OutlineHeader,
			course: this.course
		});
	}
});
