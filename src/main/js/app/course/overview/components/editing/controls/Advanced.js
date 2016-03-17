Ext.define('NextThought.app.course.overview.components.editing.controls.Advanced', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-advanced-settings',

	requires: [
		'NextThought.app.course.overview.components.editing.settings.Window',
		'NextThought.app.course.overview.components.editing.controls.Visibility'
	],

	name: 'Advanced Settings',

	cls: 'nt-button advanced',

	promptName: 'overview-editing-settings',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'text', html: '{name}'},
		{cls: 'toggle'}
	]),


	renderSelectors: {
		textEl: '.text',
		contentEl: '.toggle'
	},

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

		this.mon(this.textEl, 'click', this.handleClick.bind(this));
	},


	handleClick: function(e){
		if (e.getTarget('.disabled')) { return; }

		if (!this.visibilityCmp) {
			this.visibilityCmp = Ext.widget('overview-editing-controls-visibility', {
				record: this.record,
				parentRecord: this.parentRecord,
				renderTo: this.contentEl,
				schema: this.schema,
				defaultValue:  this.record && this.record.get('visibility'),
				onChange: this.onChange.bind(this)
			});

			this.visibilityCmp.hide();
		}

		if (!this.visibilityCmp.isVisible()){
			this.visibilityCmp.show();
		}
		else {
			this.visibilityCmp.hide();
		}	
	},


	onChange: function(){},

	getChangedValues: function(){
		if (this.visibilityCmp) {
			return this.visibilityCmp.getChangedValues();
		}
	},

	getValue: function(){
		if (this.visibilityCmp) {
			return this.visibilityCmp.getValue();
		}
	}
});