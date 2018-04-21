const Ext = require('@nti/extjs');

const BatchInterface = require('legacy/store/BatchInterface');


module.exports = exports = Ext.define('NextThought.mixins.AuditLog', {
	BATCH_SIZE: 20,

	hasAuditLog: function () {
		return !!this.getLink('audit_log');
	},

	hasRecursiveLog: function () {
		return !!this.getLink('recursive_audit_log');
	},

	getLog: function () {
		var auditLink = this.getLink('recursive_audit_log') || this.getLink('audit_log');

		if (auditLink) {
			return this.getCurrentBatch(auditLink);
		}
	},

	getCurrentBatch: function (link) {
		this.currentBatch = new BatchInterface({
			url: link,
			params: {
				batchSize: this.BATCH_SIZE,
				sortOn: 'CreatedTime',
				sortOrder: 'descending'
			}
		});

		return this.currentBatch;
	}
});
