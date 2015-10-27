Ext.define('NextThought.app.course.assessment.components.admin.email.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.util.Parsing',
		'NextThought.app.course.StateStore'
	],


	sendEmail: function(record, postURL, scope) {
		var me = this, 
			p = record && record.getProxy();

		if (!postURL) {
			postURL = record.get('url');
		}

		if (!scope) {
			scope = record.get('scope');
		}

		if (scope && p) {
			if (p && p.setExtraParam) {
				p.setExtraParam('scope', scope);	
			}
		}

		return new Promise(function(fulfill, reject) {
			record.save({
				url: postURL,
				scope: me,
				success: function(post, operation) {
					//the first argument is the record...problem is, it was a post, and the response from the server is
					// a PersonalBlogEntry. All fine, except instead of parsing the response as a new record and passing
					// here, it just updates the existing record with the "updated" fields. ..we normally want this, so this
					// one off re-parse of the responseText is necissary to get at what we want.
					// HOWEVER, if we are editing an existing one... we get back what we send (type wise)

					fulfill(isEdit ? record : ParseUtils.parseItems(operation.response.responseText)[0]);
				},
				failure: function() {
					console.debug('Failed to send email: ', arguments);
					reject();
				}
			});
		})
	}
});