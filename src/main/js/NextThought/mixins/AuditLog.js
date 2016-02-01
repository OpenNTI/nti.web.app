Ext.define('NextThought.mixins.AuditLog', {

	hasAuditLog: function() {
		return !!this.getLink('audit_log');
	},

	getLog: function() {
		var auditLink = this.getLink('audit_log');

		return Service.request(auditLink)
			.then(function(response) {
				var resp = JSON.parse(response),
					items = resp && resp.Items;

				return ParseUtils.parseItems(items);
			})
			.then(function(auditLog) {
				return auditLog;
			});
	}
});
