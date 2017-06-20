const Ext = require('extjs');

const PromptActions = require('legacy/app/prompt/Actions');

require('../settings/Window');
require('./Visibility');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.controls.Advanced', {
	extend: 'Ext.Component',
	alias: 'widget.overview-editing-controls-advanced-settings',
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


	initComponent () {
		this.callParent(arguments);


		this.defaultValue = this.defaultValue || (this.record && this.record.get('visibility'));
	},


	beforeRender: function () {
		this.callParent(arguments);

		this.PromptActions = PromptActions.create();

		this.renderData = Ext.apply(this.renderData || {}, {
			name: this.name
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		if (this.color) {
			this.addCls(this.color);
		}

		this.mon(this.textEl, 'click', this.handleClick.bind(this));
	},

	handleClick: function (e) {
		if (e.getTarget('.disabled')) { return; }

		if (!this.visibilityCmp) {
			this.visibilityCmp = Ext.widget('overview-editing-controls-visibility', {
				record: this.record,
				parentRecord: this.parentRecord,
				renderTo: this.contentEl,
				schema: this.schema,
				defaultValue:  this.defaultValue,
				onChange: this.onChange.bind(this)
			});

			this.visibilityCmp.hide();
		}

		if (!this.visibilityCmp.isVisible()) {
			this.visibilityCmp.show();
		}
		else {
			this.visibilityCmp.hide();
		}
	},

	onChange: function () {},

	getChangedValues: function () {
		if (this.visibilityCmp) {
			return this.visibilityCmp.getChangedValues();
		}
	},

	getValue: function () {
		if (this.visibilityCmp) {
			return this.visibilityCmp.getValue();
		}

		return {visibility: this.defaultValue};
	}
});
