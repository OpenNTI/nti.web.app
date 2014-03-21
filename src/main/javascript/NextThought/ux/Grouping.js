Ext.define('NextThought.ux.Grouping', {
	extend: 'Ext.container.Container',
	alias: 'widget.grouping',
	ui: 'nt',

	layout: 'auto',
	componentLayout: 'body',
	childEls: ['body'],
	getTargetEl: function() { return this.body; },

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'subtitle', html: '{subtitle}' },
		{ cls: 'title', html: '{title}' },
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


	beforeRender: function() {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			subtitle: this.getSubTitle(),
			title: this.getTitle()
		});
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
