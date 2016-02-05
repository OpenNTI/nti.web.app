Ext.define('NextThought.app.course.overview.components.editing.controls.Advanced', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-advanced-settings',

	requires: [
		'NextThought.app.course.overview.components.editing.settings.Window'
	],

	name: 'Advanced Settings',

	cls: 'nt-button advanced',

	promptName: 'overview-editing-settings',

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


	handleClick: function(e){
		if (e.getTarget('.disabled')) { return; }

		if (this.onPromptOpen) {
			this.onPromptOpen();
		}

		this.PromptActions.prompt(this.promptName, {record: this.record, parent: this.parentRecord})
			.then(this.onPromptSuccess.bind(this))
			.fail(this.onPromptCancel.bind(this));	
	},


	onPromptSuccess: function(rec){
		if (this.record.getId() === rec.getId()) {
			this.record.syncWith(rec);
		}
	},


	onPromptCancel: function(){}
});