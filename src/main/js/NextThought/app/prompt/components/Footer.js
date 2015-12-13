Ext.define('NextThought.app.prompt.components.Footer', {
	extend: 'Ext.Component',
	alias: 'widget.prompt-footer',

	cls: 'prompt-footer',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'cancel', html: 'Cancel'},
		{cls: 'save disabled', html: 'Ok'}
	]),


	renderSelectors: {
		cancelEl: '.cancel',
		saveEl: '.save'
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.saveText) {
			this.setSaveText(this.saveText);
		}

		if (this.cancelText) {
			this.setCancelText(this.cancelText);
		}

		this.mon(this.el, 'click', this.handleClick.bind(this));
	},


	enableSave: function() {
		this.saveEl.removeCls('disabled');
	},


	disableSave: function() {
		this.saveEl.addCls('disabled');
	},


	setSaveText: function(text) {
		if (!this.rendered) {
			this.saveText = text;
			return;
		}

		this.saveEl.update(text);
	},


	setCancelText: function(text) {
		if (!this.rendered) {
			this.cancelText = text;
			return;
		}

		this.cancelEl.update(text);
	},


	handleClick: function(e) {
		if (e.getTarget('.disabled')) { return; }

		if (e.getTarget('.save')) {
			this.onSave();
		} else if (e.getTarget('.cancel')) {
			this.onCancel();
		}
	},


	onSave: function() {
		if (this.doSave) {
			this.doSave();
		}
	},


	onCancel: function() {
		if (this.doCancel) {
			this.doCancel();
		}
	}
});
