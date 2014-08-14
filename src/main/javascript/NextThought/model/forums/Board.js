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
	}

});
