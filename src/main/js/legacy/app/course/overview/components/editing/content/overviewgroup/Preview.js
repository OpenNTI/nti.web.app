var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.content.overviewgroup.Preview', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-overviewgroup-preview',

	cls: 'overview-group-title',

	renderTpl: '{title}',


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			title: this.group.get('title'),
			color: this.group.get('accentColor')
		});
	}
});
