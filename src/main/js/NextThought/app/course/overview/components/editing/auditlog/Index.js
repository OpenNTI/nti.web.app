Ext.define('NextThought.app.course.overview.components.editing.auditlog.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-audit-log',

	requires: [
		'NextThought.model.recorder.TransactionRecord',
		'NextThought.app.course.overview.components.editing.auditlog.Item'
	],

	cls: 'audit-log',
	layout: 'none',
	items: [],

	initComponent: function() {
		this.callParent(arguments);
		var me = this;

		me.getItems()
			.then(function(logs) {
				me.addItems(logs);
			});
	},

	getItems: function() {
		return this.record.getLog();
	},

	addItems: function(items) {
		var me = this;

		me.removeAll(true);
		me.add({
			xtype: 'box',
			autoEl: {
				cls: 'audit-log-header',
				cn: {tag: 'span', cls: 'change-log', html: 'Change Log'}
			}
		});

		me.add(items.map(function(item, index) {
			return {
				xtype: 'overview-editing-auditlog-item',
				item: item,
				index: index,
				parentRecord: me.record
			};
		}));

	}
});
