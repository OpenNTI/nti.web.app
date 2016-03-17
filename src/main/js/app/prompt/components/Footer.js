export default Ext.define('NextThought.app.prompt.components.Footer', {
	extend: 'Ext.Component',
	alias: 'widget.prompt-footer',

	cls: 'prompt-footer',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'a', cls: 'cancel', html: 'Cancel'},
		{tag: 'a', cls: 'save disabled', tabindex: '1', html: 'Ok'}
	]),


	renderSelectors: {
		cancelEl: '.cancel',
		saveEl: '.save'
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.saveText !== undefined) {
			this.setSaveText(this.saveText);
		}

		if (this.cancelText) {
			this.setCancelText(this.cancelText);
		}

		if (this.saveEnabled) {
			this.enableSave();
		} else {
			this.disableSave();
		}

		this.mon(this.saveEl, 'keypress', this.handleKeyPress.bind(this));
		this.mon(this.el, 'click', this.handleClick.bind(this));
	},


	enableSave: function() {
		if (!this.rendered) {
			this.saveEnabled = true;
			return;
		}

		this.saveEl.removeCls('disabled');
	},


	disableSave: function() {
		if (!this.rendered) {
			delete this.saveEnabled;
			return;
		}

		this.saveEl.addCls('disabled');
	},


	setSaveText: function(text) {
		if (!this.rendered) {
			this.saveText = text;
			return;
		}

		this[text ? 'removeCls' : 'addCls']('hidden');

		this.saveEl.update(text || '');
	},


	setCancelText: function(text) {
		if (!this.rendered) {
			this.cancelText = text;
			return;
		}

		this.cancelEl.update(text);
	},


	handleKeyPress: function(e) {
		if (e.getTarget('.disabled')) { return; }

		if (e.charCode === e.ENTER && e.getTarget('.save')) {
			this.onSave();
		}
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
