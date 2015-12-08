Ext.define('NextThought.app.course.overview.components.editing.parentselection.MenuItem', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-parentselection-menuitem',

	renderTpl: Ext.DomHelper.markup({
		cls: 'parentselection-menuitem'
	}),


	renderSelectors: {
		itemEl: '.parentselection-menuitem'
	},


	afterRender: function() {
		this.callParent(arguments);

		//this.mon(this.el, 'click', this.handleClick.bind(this))
	}
});
