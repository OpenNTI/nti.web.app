Ext.define('NextThought.model.forums.Board', {
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
		var me = this;

		if (me.course || me.course === false) {
			return Promise.resolve(me.course);
		}

		return CourseWareUtils.findCourseBy(function(course) {
			var instance = course.get('CourseInstance');
			return me.getId() === instance.get('Discussions').getId();
		}).done(function(course) {
			course = course.get('CourseInstance');
			me.course = course;
			return course;
		}).fail(function(reason) {
			console.log(reason);
			me.course = false;
			return false;
		});
	},

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
