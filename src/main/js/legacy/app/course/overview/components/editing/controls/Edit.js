var Ext = require('extjs');
var PromptActions = require('../../../../../prompt/Actions');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.controls.Edit', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-edit',
	promptName: 'overview-editing',
	name: 'Edit',
	cls: 'nt-button edit',
	renderTpl: '{name}',

	beforeRender: function () {
		this.callParent(arguments);

		if (this.record && !this.record.getLink('edit')) {
			this.hide();
		} else {
			this.PromptActions = NextThought.app.prompt.Actions.create();

			this.renderData = Ext.apply(this.renderData || {}, {
				name: this.name
			});
		}
	},

	afterRender: function () {
		this.callParent(arguments);

		if (this.color) {
			this.addCls(this.color);
		}

		this.mon(this.el, 'click', this.handleClick.bind(this));
	},

	handleClick: function (e) {
		if (e.getTarget('.disabled')) { return; }

		if (Service.canDoAdvancedEditing() && e.shiftKey && e.altKey) {
			if (this.record) {
				console.log('EDIT:\n%s\nORDERED CONTENTS:\n%s', this.record.getLink('edit'), this.record.getLink('ordered-contents'));
			} else {
				console.log('Record is undefined.');
			}
			return;
		}

		if (this.onPromptOpen) {
			this.onPromptOpen();
		}

		this.PromptActions.prompt(this.promptName, {record: this.record, parent: this.parentRecord, root: this.root, bundle: this.bundle, outlineNode: this.outlineNode})
			.then(this.onPromptSuccess.bind(this))
			.catch(this.onPromptCancel.bind(this));
	},

	onPromptSuccess: function (action) {
		if (this.afterSave) {
			this.afterSave();
		}

		if (this.onPromptClose) {
			this.onPromptClose(true);
		}
	},

	onPromptCancel: function (reason) {
		if (this.onPromptClose) {
			this.onPromptClose(false);
		}

		if (reason === NextThought.app.prompt.Actions.DELETED && this.onDelete) {
			this.onDelete();
		}
	}
});
