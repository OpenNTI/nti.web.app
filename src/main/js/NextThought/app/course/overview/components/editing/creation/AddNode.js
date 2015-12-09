Ext.define('NextThought.app.course.overview.components.editing.creation.AddNode', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-new-node',

	cls: 'new-node',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'icon {iconCls}'},
		{cls: 'title', html: '{title}'}
	]),


	beforeRender: function(){
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {
			iconCls: this.iconCls,
			title: this.title
		});
	},


	afterRender: function(){
		this.callParent(arguments);

		this.mon(this.el, 'click', this.onClick.bind(this));
	},


	onClick: function(e){
		console.log(e);
		if (this.onAddClick) {
			this.onAddClick();
		}
	}

});