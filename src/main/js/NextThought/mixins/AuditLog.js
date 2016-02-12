Ext.define('NextThought.mixins.AuditLog', {

	requires: ['NextThought.store.BatchInterface'],

	BATCH_SIZE: 20,

	hasAuditLog: function() {
		return !!this.getLink('audit_log');
	},

	hasRecursiveLog: function() {
		return !!this.getLink('recursive_audit_log');
	},


	getLog: function() {
		var auditLink = this.getLink('recursive_audit_log') || this.getLink('audit_log');
		if(auditLink) {
			return this.getCurrentBatch(auditLink);
		}
	},

	getCurrentBatch: function(link) {
		this.currentBatch = new NextThought.store.BatchInterface({
			url: link,
			params: {
				batchSize: this.BATCH_SIZE
			}
		});
		return this.currentBatch;
	}
});
