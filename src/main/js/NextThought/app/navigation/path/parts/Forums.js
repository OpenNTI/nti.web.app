Ext.define('NextThought.app.navigation.path.parts.Forums', {

	requires: ['NextThought.app.library.Actions'],

	constructor: function() {
		this.LibraryActions = NextThought.app.library.Actions.create();
	},


	addHandlers: function(handlers) {
		handlers['application/vnd.nextthought.forums.generalforumcomment'] = this.getPathToTopicComment.bind(this);
		handlers[NextThought.model.forums.CommentPost.mimeType] = this.getPathToTopicComment.bind(this);
		handlers[NextThought.model.forums.CommunityHeadlinePost.mimeType] = this.getPathToTopicPost.bind(this);
		handlers[NextThought.model.forums.CommunityHeadlineTopic.mimeType] = this.getPathToTopic.bind(this);
		handlers[NextThought.model.forums.CommunityForum.mimeType] = this.getPathToForum.bind(this);

		return handlers;
	},


	getPathToForum: function(forum, getPathTo) {
		var href = forum.get('href');

		return this.LibraryActions.findBundleByPriority(function(bundle) {
			var section = bundle.get('Discussions'),
				parent = bundle.get('ParentDiscussions');

			//if the discussions are inlined on the bundle check those href, otherwise look for the links to the board
			section = (section && section.get('href')) || bundle.getLink('DiscussionBoard');
			parent = (parent && parent.get('href')) || bundle.getLink('ParentDiscussionBoard');

			if (section && href.indexOf(section) >= 0) {
				return 2;
			}

			if (parent && href.indexOf(parent) >= 0) {
				return 1;
			}

			return 0;
		}).then(function(courses) {
			return [courses.last(), forum];
		});
	},


	getPathToTopic: function(topic, getPathTo) {
		return Service.getObject(topic.get('ContainerId'))
			.then(function(forum) {
				return getPathTo(forum);
			})
			.then(function(path) {
				path.push(topic);
				return path;
			})
			.fail(function(reason) {
				console.error('Failed to get path to topic:', reason);
				return Promise.reject();
			});
	},


	getPathToTopicPost: function(post, getPathTo) {
		return Service.getObject(post.get('ContainerId'))
			.then(function(topic) {
				return getPathTo(topic);
			})
			.then(function(path) {
				path.push(post);
				return path;
			})
			.fail(function(reason) {
				console.error('Failed to get path to topic: ', reason);
				return Promise.reject();
			});
	},


	getPathToTopicComment: function(comment, getPathTo) {
		return Service.getObject(comment.get('ContainerId'))
			.then(function(topic) {
				return getPathTo(topic);
			})
			.then(function(path) {
				path.push(comment);
				return path;
			})
			.fail(function(reason) {
				console.error('Failed to get path to topic comment: ', reason);
				return Promise.reject();
			});
	}
});
