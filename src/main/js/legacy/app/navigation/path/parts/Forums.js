var Ext = require('extjs');
var UserRepository = require('../../../../cache/UserRepository');
var LibraryActions = require('../../../library/Actions');


module.exports = exports = Ext.define('NextThought.app.navigation.path.parts.Forums', {
	constructor: function () {
		this.LibraryActions = NextThought.app.library.Actions.create();
	},

	addHandlers: function (handlers) {
		// handlers['application/vnd.nextthought.forums.generalforumcomment'] = this.getPathToTopicComment.bind(this);
		// handlers[NextThought.model.forums.CommentPost.mimeType] = this.getPathToTopicComment.bind(this);
		// handlers[NextThought.model.forums.CommunityHeadlinePost.mimeType] = this.getPathToTopicPost.bind(this);
		// handlers[NextThought.model.forums.CommunityHeadlineTopic.mimeType] = this.getPathToTopic.bind(this);
		// handlers[NextThought.model.forums.CommunityForum.mimeType] = this.getPathToForum.bind(this);

		return handlers;
	},

	getPathToForum: function (forum, getPathTo) {
		var href = forum.get('href');

		return this.LibraryActions.findBundleByPriority(function (bundle) {
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
		}).then(function (bundles) {
			if (!bundles.length) {
				return Promise.reject();
			}

			var bundle = bundles.last(),
				parent = bundle.get('Discussions'),
				section = bundle.get('ParentDiscussions'),
				parentHref = (parent && parent.get('href')) || bundle.getLink('ParentDiscussionBoard'),
				sectionHref = (section && section.get('href')) || bundle.getLink('DiscussionBoard'),
				board;

			if (sectionHref && href.indexOf(sectionHref) >= 0) {
				board = section;
			} else if (parentHref && href.indexOf(parentHref) >= 0) {
				board = parent;
			}

			return [bundles.last(), board, forum];
		});
	},

	getPathToTopic: function (topic, getPathTo) {
		return Service.getObject(topic.get('ContainerId'))
			//if we can resolve the forum then get the path to that
			.then(function (forum) {
				return getPathTo(forum);
			//otherwise find the creator so we can show it from their profile
			}, function () {
				return UserRepository.getUser(topic.get('Creator'))
					.then(function (user) {
						return [user];
					});
			})
			.then(function (path) {
				return path.concat([topic]);
			})
			.fail(function (reason) {
				console.error('Failed to get path to topic:', reason);
				return Promise.reject();
			});
	},

	getPathToTopicPost: function (post, getPathTo) {
		return Service.getObject(post.get('ContainerId'))
			.then(function (topic) {
				return getPathTo(topic);
			})
			.then(function (path) {
				return path;
			})
			.fail(function (reason) {
				console.error('Failed to get path to topic post: ', reason);
				return Promise.reject();
			});
	},

	getPathToTopicComment: function (comment, getPathTo) {
		return Service.getObject(comment.get('ContainerId'))
			.then(function (topic) {
				return getPathTo(topic);
			})
			.then(function (path) {
				return path.concat([comment]);
			})
			.fail(function (reason) {
				console.error('Failed to get path to topic comment: ', reason);
				return Promise.reject();
			});
	}
});
