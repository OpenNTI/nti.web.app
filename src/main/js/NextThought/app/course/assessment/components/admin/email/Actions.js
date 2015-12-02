Ext.define('NextThought.app.course.assessment.components.admin.email.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.util.Parsing',
		'NextThought.app.course.StateStore'
	],


	sendEmail: function(record, postURL, scope) {
		var me = this, 
			data = record && record.asJSON();

		delete data.ContainerId;
		delete data.NTIID;

		if (!postURL) {
			postURL = record.get('url');
		}

		if (!postURL) {
			return Promise.reject();
		}

		if (!scope) {
			scope = record.get('scope'); 
		}

		if (scope === 'All') {
			scope = null;
		}

		if (scope === 'Open' || scope === 'open') {
			scope = 'Public';
		}

		return new Promise(function(fulfill, reject) {
			Ext.Ajax.request({
				url: postURL,
				scope: this,
				jsonData: data,
				params: {scope: scope || ""},
				method: 'POST',
				headers: {
					Accept: 'application/json'
				},
				callback: function(q, success, r) {
					if (!success) {
						reject({field: 'Email', message: 'There was an error sending your email.'});
					}
					else {
						fulfill();
					}
				}
			});
		})
	}
});