Ext.define('NextThought.app.course.overview.components.editing.controls.Edit', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-edit',

	requires: [
		'NextThought.app.prompt.Actions'
	],

	promptName: 'overview-editing',

	name: 'Edit',

	cls: 'nt-button edit',

	renderTpl: '{name}',

	beforeRender: function() {
		this.callParent(arguments);

		this.PromptActions = NextThought.app.prompt.Actions.create();

		this.renderData = Ext.apply(this.renderData || {}, {
			name: this.name
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		if (this.color) {
			this.addCls(this.color);
		}

		this.mon(this.el, 'click', this.handleClick.bind(this));
	},


	handleClick: function(e) {
		if (e.getTarget('.disabled')) { return; }

		if (this.onPromptOpen) {
			this.onPromptOpen();
		}

		this.PromptActions.prompt(this.promptName, {record: this.record, parent: this.parentRecord, root: this.root})
			.then(this.onPromptSuccess.bind(this))
			.fail(this.onPromptCancel.bind(this));
	},


	onPromptSuccess: function() {
		if (this.afterSave) {
			this.afterSave();
		}
		
		if (this.onPromptClose) {
			this.onPromptClose(true);
		}
	},


	onPromptCancel: function() {
		if (this.onPromptClose) {
			this.onPromptClose(false);
		}
	}
});
