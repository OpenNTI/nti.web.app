const Ext = require('@nti/extjs');

require('legacy/model/recorder/TransactionRecord');
require('./Item');


module.exports = exports = Ext.define('NextThought.app.course.overview.components.editing.auditlog.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.overview-editing-audit-log',
	cls: 'audit-log',
	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		if (!this.record || !this.record.getLog) {
			console.error('Invalid record passed');

			this.add({
				xtype: 'box',
				autoEl: {
					cls: 'error-msg',
					html: 'No log to show.'
				}
			});

			return;
		}

		if (!this.hideHeader) {
			this.add({
				xtype: 'box',
				autoEl: {
					cls: 'audit-log-header',
					cn: {tag: 'span', cls: 'change-log', html: 'Change Log'}
				}
			});
		}


		this.loadBatch(this.record.getLog());
	},

	loadBatch: function (batchInterface) {
		this.currentBatch = batchInterface;

		if (batchInterface.getBatch) {
			this.showLoading();
			batchInterface.getBatch()
				.then(this.__addBatch.bind(this))
				.always(this.hideLoading.bind(this));
		}
	},

	loadNextBatch: function () {
		this.removeNext();
		this.showLoading();

		if (this.currentBatch && this.currentBatch.getNextBatch) {
			this.currentBatch.getNextBatch()
				.then(this.loadBatch.bind(this));
		}
	},

	__addBatch: function (batch) {
		this.removeNext();

		this.addItems(batch.Items);

		if (!batch.isLast) {
			this.addNext();
		}
	},

	addItems: function (items) {
		var parentRecord = this.record;

		this.add(items.map(function (item, index) {
			return {
				xtype: 'overview-editing-auditlog-item',
				item: item,
				index: index,
				parentRecord: parentRecord
			};
		}));

	},

	removeNext: function () {
		if (this.nextBatchCmp) {
			this.remove(this.nextBatchCmp);
			this.nextBatchCmp = null;
		}
	},

	addNext: function () {
		this.nextBatchCmp = this.add({
			xtype: 'box',
			autoEl: {
				cls: 'next-batch-record',
				cn: {tag: 'div', cls: 'load-more', html: 'Show More'}
			},
			listeners: {
				click: {
					element: 'el',
					fn: this.loadNextBatch.bind(this)
				}
			}
		});
	},

	showLoading: function () {
		if (!this.loadingCmp) {
			this.loadingCmp = this.add({
				xtype: 'box',
				autoEl: {cls: 'loading-container control-item', cn: {cls: 'loading', html: 'Loading...'}}
			});
		}
	},

	hideLoading: function () {
		if (this.loadingCmp) {
			this.remove(this.loadingCmp);
			this.loadingCmp = null;
		}
	}
});
