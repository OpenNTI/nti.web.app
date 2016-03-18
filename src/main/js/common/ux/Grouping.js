var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.common.ux.Grouping', {
	extend: 'Ext.container.Container',
	alias: 'widget.grouping',
	ui: 'nt',

	layout: 'auto',
	componentLayout: 'body',
	childEls: ['body', 'toolsEl'],
	getTargetEl: function() { return this.body; },

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header', cn: [
			{ cls: 'subtitle', html: '{subtitle}' },
			{ cls: 'title', html: '{title}' },
			{ id: '{id}-toolsEl', cls: 'tools' }
		]},
		{ id: '{id}-body', cls: 'body', cn: ['{%this.renderContainer(out,values)%}'] }
	]),


	config: {
		subTitle: null,
		title: null
	},


	initComponent: function() {
		this.addCls('grouping');
		return this.callParent(arguments);
	},


	updateSubTitle: function(value) { this.updateEl('.subtitle', value); },
	updateTitle: function(value) { this.updateEl('.title', value); },


	updateEl: function(selector, value) {
		if (this.rendered) {
			this.el.select(selector).update(value);
		}
	},


	getRefItems: function() {
		var r = this.callParent(arguments);
		if (this.tools) {
			r.push.apply(r, this.tools.filter(function(c) {return c && c.isComponent;}));
		}
		return r;
	},


	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			subtitle: this.getSubTitle(),
			title: this.getTitle()
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		var tools = this.toolsEl;
		if (this.tools) {
			if (!Ext.isArray(this.tools)) {this.tools = [this.tools];}
			this.tools = this.tools.map(function(t) {
				return Ext.widget(Ext.applyIf(t, {
					xtype: 'box',
					renderTo: tools
				}));
			});
			this.on('destroy', Ext.destroy.bind(Ext, this.tools));
		}
	},


	onAdd: function(cmp) {
		var r = this.callParent(arguments);

		this.mon(cmp, {
			'hide-parent': 'hide',
			'show-parent': 'show'
		});

		return r;
	}
});
