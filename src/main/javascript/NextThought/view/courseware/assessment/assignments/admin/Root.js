Ext.define('NextThought.view.courseware.assessment.assignments.admin.Root', {
	extend: 'NextThought.view.courseware.assessment.assignments.View',
	alias: 'widget.course-assessment-admin-assignments-root',
	requires: [
		'NextThought.proxy.courseware.PageSource',
		'NextThought.view.courseware.assessment.assignments.admin.List'
	],

	newAssignmentList: function(grouper) {
		return { xtype: 'course-assessment-assignment-admin-list', store: grouper.store };
	},


	onItemClicked: function(view, rec) {
		if (!rec) {
			console.error('Ignoring click because no record was passed.', arguments);
			return;
		}
		//This is the admin view... we will let instructors view them no matter what. (so we will ignore the closed state)
		this.fireEvent('assignment-clicked', rec);
	},


	applyPagerFilter: function() {
		//admins can see all assignments at any time.
		this.store.filter({
			id: 'open',
			filterFn: function(rec) {
				return rec.get('total') > 0; //ensure there are submit parts (if no submit parts, its not to be subbmitted in the platform)
			}
		});
	},


	showAssignment: function(assignment, user) {

		function mask(on) {
			if (tab && tab.dom) {
				tab[on ? 'mask' : 'unmask']('Loading...');
			}
		}

		var id = assignment && ((assignment.getId && assignment.getId()) || assignment),
			me = this,
			x = me.store.getById(id),
			item = x && x.get('item'),
			parts = (item && item.get('parts')) || [],
			tab = me.up('[isTabView]').getEl(),
			view, assignmentView, store, username;


		me.onItemClicked(null, x);


		if (parts.length === 0) {
			console.warn('Cannot show an assignment that does not have submit parts.');
			return;
		}

		view = me.up('course-assessment-admin-assignments');
		assignmentView = view && view.down('course-assessment-admin-assignments-item');

		if (user && assignmentView) {
			mask(true);

			store = assignmentView.store;
			username = user && ((user.getId && user.getId()) || user);

			Service.request([store.getProxy().url, username].join('/'))
				.done(function(res) {
					var assignmentHistory = ParseUtils.parseItems(res)[0];
					if (assignmentHistory.get('Creator') !== username) {
						Ext.Error.raise('Username did not match!');
					}

					assignmentHistory.set('item', item);
					item.getGradeBookEntry().updateHistoryItem(assignmentHistory);

					//Should be a cache hit... so lets just do the most straight forward thing.
					UserRepository.getUser(username)
							.then(function(user) {
								assignmentHistory.set('Creator', user);

								var inst = me.data.instance,
									url = [user.get('href'), 'Courses', 'EnrolledCourses',
										   encodeURIComponent(inst.getCourseCatalogEntry().getId())].join('/');

								return Service.request(url);

							})
							.then(function(json) {
								json = Ext.decode(json, true) || {};
								return json.LegacyEnrollmentStatus || 'ForCredit';
							})
							.done(function(status) {
								mask(false);

								assignmentView.applyFilter(status, true).syncFilterToUI();
								assignmentView.fireGoToAssignment(null, assignmentHistory);
							})
							.fail(function(reason) {
								mask(false);
								console.error('Could not resove ', username, ' because ', reason);
							});
				})
				.fail(function(reason) {
						mask(false);
						console.error('Failure Reason: ', reason);
					});
		}
	}
});
