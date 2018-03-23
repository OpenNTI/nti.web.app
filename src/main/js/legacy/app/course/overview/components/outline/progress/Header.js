const Ext = require('extjs');
const {ProgressWidgets} = require('nti-web-course');

module.exports = exports = Ext.define('NextThought.app.course.overview.components.outline.progress.Header', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-outline-progress-header',


	cls: 'outline-header',


	update (props) {
		// if(this.header) {
		// 	this.header.setProps(props);
		// }
	},


	initComponent () {
		this.callParent(arguments);

		this.header = this.add({
			xtype: 'react',
			component: ProgressWidgets.OutlineHeader,
			course: this.course
		});
	}
});
