Ext.define('NextThought.app.course.overview.components.outline.Header', {
	extend: 'Ext.Component',
	alias: 'widget.overview-outline-header',


	cls: 'outline-header',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', html: 'Outline'},
		{cls: 'edit', html: 'Edit'}
	]),


	renderSelectors: {
		editEl: '.edit'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.editEl, 'click', this.onEditClick.bind(this));

		this.editEl.hide();
	},


	onEditClick: function(e) {
		if (this.onEdit) {
			this.onEdit();
		}
	},


	setOutline: function(outline) {
		this.editEl[outline.getLink('edit') ? 'show' : 'hide']();
	}
});
