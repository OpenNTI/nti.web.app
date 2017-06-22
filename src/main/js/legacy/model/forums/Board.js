const Ext = require('extjs');

const ParseUtils = require('legacy/util/Parsing');
const StoreUtils = require('legacy/util/Store');
const NTI = require('legacy/store/NTI');

const Board = require('./Board');
require('./CommentPost');
require('./Base');


module.exports = exports = Ext.define('NextThought.model.forums.Board', {
	extend: 'NextThought.model.forums.Base',
	isBoard: true,

	statics: {
		buildContentsStoreFromData: function (id, data) {
			var store;

			store = Ext.getStore(id) || NTI.create({
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
		getBoardFromForumList: function (forumList) {
			var board;

			(forumList || []).every(function (item) {
				if (item.board) {
					board = item.board;
				}

				if (item.children) {
					board = Board.getBoardFromForumList(item.children);
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

	getTitle: function () {
		return this.get('title');
	},

	findBundle: function () {
		return ContentManagementUtils.findBundleBy(bundle => {
			const links = bundle.get('Links'),
				link = links && links.getRelLink('DiscussionBoard');

			return link && link.ntiid === this.getId();
		})
			.catch(() => this.findCourse());
	},

	findCourse: function () {
		var me = this,
			id = me.getId();

		if (me.course || me.course === false) {
			return Promise.resolve(me.course);
		}

		return CourseWareUtils.getCoursesByPriority(function (course) {
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
		}).then(function (courses) {
			var course = courses.last();

			if (!course) {
				return Promise.reject('No Course found');
			}

			course = course.get('CourseInstance');
			me.course = course;
			return course;
		}).catch(function (reason) {
			console.error(reason);
			me.course = false;
			return false;
		});
	},

	hasForumList: function () { return true; },

	/**
	 * See CourseInstance getForumList for more details the structure this is returning
	 * @return {Object} A forum list of the contents of this board
	 */
	getForumList: function () {
		var me = this,
			content = me.getLink('contents');

		return Service.request(content)
			.then(function (json) {
				json = (json && JSON.parse(json)) || {};
				json.Items = json.Items && ParseUtils.parseItems(json.Items);

				var store = Board.buildContentsStoreFromData(me.getContentsStoreId(), json.Items);

				return [{
					title: '',
					board: me,
					store: store
				}];
			})
			.catch(function (response) {
				console.error('failed to load board contents: ', response);

				return {};
			});
	}
});
