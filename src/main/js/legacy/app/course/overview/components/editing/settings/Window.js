const Ext = require('@nti/extjs');

const PromptStateStore = require('legacy/app/prompt/StateStore');

const EditingActions = require('../Actions');

require('../controls/Visibility');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.settings.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-settings-window',
	cls: 'content-editor',
	layout: 'none',
	items: [],
	title: 'Advanced Settings',

	statics: {
		canChangeVisibility: function (record) {
			var r = record && record.raw || {};
			return r.hasOwnProperty('visibility');
		}
	},

	initComponent: function () {
		this.callParent(arguments);

		var data = this.Prompt.data;

		this.EditingActions = EditingActions.create();

		this.record = data && data.record;
		this.parentRecord = data && data.parentRecord;

		if (this.record && this.self.canChangeVisibility(this.record)) {
			this.visibilityCmp = this.add({
				xtype: 'overview-editing-controls-visibility',
				record: this.record,
				parentRecord: this.parentRecord,
				defaultValue:  this.record && this.record.get('visibility'),
				onChange: this.enableSave.bind(this)
			});
		}
	},

	afterRender: function () {
		this.callParent(arguments);

		this.setHeaderTitle(this.title);
	},

	enableSave: function () {
		return this.Prompt.Footer.enableSave();
	},

	disableSave: function () {
		return this.Prompt.Footer.disableSave();
	},

	setHeaderTitle: function (title) {
		return this.Prompt.Header.setTitle(title);
	},

	onSave: function () {
		return this.EditingActions.updateRecordVisibility(this.record, this.visibilityCmp);
	},

	onCancel: function () {
		return Promise.resolve();
	}
}, function () {
	PromptStateStore.register('overview-editing-settings', this);
});
