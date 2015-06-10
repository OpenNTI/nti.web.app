Ext.define('NextThought.app.forums.Actions', {
	extend: 'NextThought.common.Actions',

	saveTopicComment: function(topic, comment, values) {
		var isEdit = Boolean(comment) && !comment.phantom,
			postLink = topic.getLink('add');

		comment = comment || NextThought.model.forums.Post.create();

		comment.set({body: values.body});

		isEdit = isEdit && !Ext.isEmpty(comment.get('href'));

		if (isEdit) {
			postLink = undefined;
		}

		return new Promise(function(fulfill, reject) {
			comment.save({
				url: postLink,
				success: function(_, operation) {
					var rec = isEdit ? commentForum : ParseUtils.parseItems(operation.response.responseText)[0];

					//TODO: increment PostCount in topic the same way we increment reply count in notes.
					if (!isEdit) {
						topic.set('PostCount', topic.get('PostCount') + 1);
					}

					fulfill(rec);
				},
				failure: function() {
					console.error('Failed to save topic comment:', arguments);
					reject();
				}
			});
		});
	}
});
