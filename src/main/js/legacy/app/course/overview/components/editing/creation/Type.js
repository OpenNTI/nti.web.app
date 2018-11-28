const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.creation.Type', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-type',


	cls: 'new-type',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'icon {iconCls}', html: '{customHTML}'},
		{cls: 'title', html: '{title}'}
	]),


	beforeRender: function () {

		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			iconCls: this.typeConfig.iconCls,
			title: this.typeConfig.title,
			customHTML: this.typeConfig.customHTML
		});
	},


	afterRender: function () {
		this.callParent(arguments);

		this.addCls(this.typeConfig.category);

		this.mon(this.el, 'click', this.handleClick.bind(this));
	},


	handleClick: function (e) {
		if (!e.getTarget('.disabled')) {
			this.showEditor(this.typeConfig);
		}
	}
});
