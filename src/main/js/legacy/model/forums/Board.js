var Ext = require('extjs');
var ParseUtils = require('../../util/Parsing');
var StoreUtils = require('../../util/Store');
var ForumsBase = require('./Base');
var StoreNTI = require('../../store/NTI');
var ForumsCommentPost = require('./CommentPost');


module.exports = exports = Ext.define('NextThought.model.forums.Board', {
	extend: 'NextThought.model.forums.Base',
	isBoard: true,

	statics: {
		buildContentsStoreFromData: function(id, data) {
			var store;

			store = Ext.getStore(id) || NextThought.store.NTI.create({
				storeId: id,
				data: data,
				sorters: [{
					property: 'CreatedTime',
					direction: 'DESC'
				}]
			});

			StoreUtils.fillInUsers(store);

			return store;
		},
		getBoardFromForumList: function(forumList) {
			var board;

			(forumList || []).every(function(item) {
				if (item.board) {
					board = item.board;
				}

				if (item.children) {
					board = NextThought.model.forums.Board.getBoardFromForumList(item.children);
				}

				return !board;
			});

			return board;
		}
	},

	fields: [
		{ name: 'ForumCount', type: 'int', persist: false },
		{ name: 'title', type: 'auto', persist: false}
	],

	getTitle: function() {
		return this.get('title');
	},

	findBundle: function() {
		var me = this;

		return ContentManagementUtils.findBundleBy(function(bundle) {
			var links = bundle.get('Links'),
				link = links && links.getRelLink('DiscussionBoard');

			return link && link.ntiid === me.getId();
		})
		.fail(function(reason) {
			return me.findCourse();
		});
	},

	findCourse: function() {
		var me = this,
			id = me.getId();

		if (me.course || me.course === false) {
			return Promise.resolve(me.course);
		}

		return CourseWareUtils.getCoursesByPriority(function(course) {
			var instance = course.get('CourseInstance'),
				section = instance.get('Discussions'),
				parent = instance.get('ParentDiscussions');

			if (section && section.getId() === id) {
				return 2;
			}

			if (parent && parent.getId() === id) {
				return 1;
			}

			return 0;
		}).then(function(courses) {
			var course = courses.last();

			if (!course) {
				return Promise.reject('No Course found');
			}

			course = course.get('CourseInstance');
			me.course = course;
			return course;
		}).fail(function(reason) {
			console.error(reason);
			me.course = false;
			return false;
		});
	},

	hasForumList: function() { return true; },

	/**
	 * See CourseInstance getForumList for more details the structure this is returning
	 * @return {Object} A forum list of the contents of this board
	 */
	getForumList: function() {
		var me = this,
			content = me.getLink('contents');

		return Service.request(content)
			.then(function(json) {
				json = (json && JSON.parse(json)) || {};
				json.Items = json.Items && ParseUtils.parseItems(json.Items);

				var store = NextThought.model.forums.Board.buildContentsStoreFromData(me.getContentsStoreId(), json.Items);

				return [{
					title: '',
					board: me,
					store: store
				}];
			})
			.fail(function(response) {
				console.error('failed to load board contents: ', response);

				return {};
			});
	}
});
