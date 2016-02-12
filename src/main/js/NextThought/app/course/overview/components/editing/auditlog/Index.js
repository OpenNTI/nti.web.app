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
			.then(function(batch) {
				me.addItems(batch.Items);

				if(!batch.isLast) {
					me.addNext();
				}
			});

	},

	getItems: function() {
		this.currentBatch = this.record.getLog();

		return this.currentBatch.getBatch();
	},

	getNextItems: function() {
		var me = this;

		if(!me.currentBatch) { return; }

		return me.currentBatch.getNextBatch()
			.then(function(batch) {
				me.currentBatch = batch;
				return me.currentBatch.getBatch();
			});
	},

	addItems: function(items) {
		var me = this;

		me.removeAll(true);

		if(!this.hideHeader) {
			me.add({
				xtype: 'box',
				autoEl: {
					cls: 'audit-log-header',
					cn: {tag: 'span', cls: 'change-log', html: 'Change Log'}
				}
			});
		}


		me.add(items.map(function(item, index) {
			return {
				xtype: 'overview-editing-auditlog-item',
				item: item,
				index: index,
				parentRecord: me.record
			};
		}));

	},

	addNext: function() {
		var me = this;

		me.nextBatchCmp = me.add({
			xtype: 'box',
			autoEl: {
				cls: 'next-batch-record',
				cn: {tag: 'div', cls: 'load-more', html: 'Show More'}
			},
			listeners: {
				click: {
					element: 'el',
					fn: function(e) {
						me.getNextItems()
							.then(function(batch) {
								me.addItems(batch.Items);

								if(!batch.isLast) {
									me.addNext();
								}
							});
					}
				}
			}
		});
	}
});
