Ext.define('NextThought.app.course.overview.components.editing.window.Footer', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-window-footer',

	cls: 'content-editor-footer',

	renderTpl: Ext.DomHelper.markup({
		cls: 'right save-controls',
		cn: [
			{cls: 'button action save disabled', html: 'Save'},
			{cls: 'button action cancel', html: 'Cancel'}
		]
	}),


	renderSelectors: {
		saveEl: '.save',
		cancelEl: '.cancel'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, 'click', this.handleClick.bind(this));
	},


	handleClick: function(e) {
		if (e.getTarget('.disabled')) { return; }

		if (e.getTarget('.saved')) {
			this.handleSave();
		} else if (e.getTarget('.cancel')) {
			this.handleCancel();
		}
	},


	handleSave: function() {

	},


	handleCancel: function() {

	},


	disableSave: function() {
		this.saveEl.addCls('disabled');
	},


	enableSave: function() {
		this.saveEl.removeCls('disabled');
	}
});
