Ext.define('NextThought.app.course.overview.components.editing.WindowFooter', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-windowfooter',


	cls: 'content-editor-footer',

	buttonTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		cls: 'button action {cls}', 'data-action': '{action}', html: '{label}'
	})),


	renderTpl: Ext.DomHelper.markup({
		cls: 'right save-controls'
	}),


	renderSelectors: {
		controlsEl: '.save-controls'
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.controlsEl, 'click', this.onControlClick.bind(this));

		if (this.controlConfig) {
			this.setControls(this.controlConfig);
		}
	},


	/**
	 * Set the active controls, pass in a map of the types
	 * to show. For now we only understand save, next, cancel
	 *
	 * TODO: Probably need to make this more configurable
	 *
	 * Ex. {
	 * 		save: {disabled: true},
	 * 		cancel: true
	 * }
	 * @param {Object} controls [description]
	 */
	setControls: function(controls) {
		if (!this.rendered) {
			this.on('afterrender', this.setControls.bind(this));
			return;
		}

		if (controls.save) {
			this.addControl({
				cls: 'save ' + (controls.save.disabled ? 'disabled' : 'enabled'),
				action: 'onSaveClick',
				label: 'Save'
			});
		}

		if (controls.next) {
			this.addControl({
				cls: 'next ' + (controls.next.disabled ? 'disabled' : 'enabled'),
				action: 'onNextClick',
				label: 'Next'
			});
		}

		if (controls.cancel) {
			this.addControl({
				cls: 'cancel',
				action: 'onCancelClick',
				label: 'Cancel'
			});
		}
	},


	addControl: function(config) {
		this.buttonTpl.append(this.controlsEl, config);
	},


	removeControls: function() {
		if (!this.rendered) {
			return;
		}

		this.controlsEl.dom.innerHTML = '';
	},


	onControlClick: function(e) {
		var target = e.getTarget('.button'),
			handler = target && target.getAttribute('data-action');

		if (handler && this[handler] && !e.getTarget('.disabled')) {
			this[handler](e);
		}
	},


	onCancelClick: function() {
		if (this.onCancel) {
			this.onCancel();
		}
	},


	onNextClick: function() {
		if (this.onNext) {
			this.onNext();
		}
	},


	onSaveClick: function() {
		if (this.onSave) {
			this.onSave();
		}
	}
});
