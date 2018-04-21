const Ext = require('@nti/extjs');

const PromptStateStore = require('legacy/app/prompt/StateStore');

require('./Index');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.auditlog.Prompt', {
	extend: 'Ext.container.Container',
	alias: 'widget.audit-log-prompt',
	cls: 'audit-log-prompt',
	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		this.record = this.Prompt.data.record;
		this.addAuditLog();
	},

	afterRender: function () {
		this.callParent(arguments);
		this.Prompt.Header.setTitle('Change Log');
		this.Prompt.Footer.setSaveText('');
	},

	addAuditLog: function () {
		return this.add({
			xtype: 'overview-editing-audit-log',
			record: this.record,
			hideHeader: true
		});
	}
}, function () {
	PromptStateStore.register('audit-log', this);
});
