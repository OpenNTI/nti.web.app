Ext.define('NextThought.view.courseware.assessment.assignments.admin.Root', {
	extend: 'NextThought.view.courseware.assessment.assignments.View',
	alias: 'widget.course-assessment-admin-assignments-root',
	requires: [
		'NextThought.proxy.courseware.PageSource',
		'NextThought.view.courseware.assessment.assignments.admin.List'
	],


	restoreState: function(state) {
		var record, params,
			bar = this.getFilterBar();

		if (!state) { return Promise.resolve(); }

		if (state.group) {
			bar.selectGroupBy(state.group);
		}

		if (state.activeStudent) {
			params = {
				batchAroundUsernameFilterByScope: state.activeStudent
			};
		}

		return Promise.resolve();
	},


	newAssignmentList: function(grouper) {
		return { xtype: 'course-assessment-assignment-admin-list', store: grouper.store };
	},


	onItemClicked: function(view, rec) {
		if (!rec) {
			console.error('Ignoring click because no record was passed.', arguments);
			return;
		}
		//This is the admin view... we will let instructors view them no matter what. (so we will ignore the closed state)
		this.goToRecord(rec);
	},


	goToRecord: function(rec, extraParams) {
		if (!rec) { return; }

		this.fireEvent('assignment-clicked', rec, extraParams);
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
				tab[on ? 'mask' : 'unmask'](getString('NextThought.view.courseware.assessment.assignments.admin.Root.loading'));
			}
		}

		var id = assignment && ((assignment.getId && assignment.getId()) || assignment),
			me = this,
			x = me.store.getById(id),
			item = x && x.get('item'),
			tab = me.up('[isTabView]').getEl(),
			view, assignmentView, store, username, params;

		username = user && ((user.getId && user.getId()) || user);

		//if we are drilling in to one user, batch the store around it
		if (user) {
			params = {
				'batchAroundUsernameFilterByScope': username
			};
		}

		me.goToRecord(x, params);

		view = me.up('course-assessment-admin-assignments');
		assignmentView = view && view.down('course-assessment-admin-assignments-item');

		if (user && assignmentView) {
			mask(true);

			store = assignmentView.store;

			return new Promise(function(fulfill, reject) {

				function loaded(success) {
					var params = store.proxy.extraParams;

					//remove the param so it doesn't affect the next loads
					delete params.batchAroundUsernameFilterByScope;

					if (success) {
						fulfill();
					} else {
						reject('Failed to load store');
					}
				}

				//if the store hasn't loaded yet wait until it does
				if (store.loading) {
					me.mon(store, {
						single: true,
						load: function(store, records, success) {
							loaded(success);
						}
					});
				} else {
					loaded(true);
				}

			}).then(function() {
				var record,
					//find the record for this user
					index = store.findBy(function(rec) {
						var user = rec.get('User'),
							userId = user && NextThought.model.User.getIdFromRaw(user);

						return userId && userId === username;
					});

				if (index >= 0) {
					record = store.getAt(index);
				}

				if (!record) {
					return Promise.reject('No Record for that user');
				}

				return record;
			}).then(function(record) {
				return UserRepository.getUser(username)
					.then(function(user) {
						var historyItem = record.get('HistoryItemSummary');

						record.set('User', user);
						historyItem.set('Creator', user);

						assignmentView.currentFilter = store.getEnrollmentScope();
						assignmentView.syncFilterToUI();

						store.proxy.extraParams.filter = assignmentView.currentFilter;

						return assignmentView.fireGoToAssignment(null, record);
					})
					.always(function() {
						mask(false);
					});
			}).fail(function(reason) {
				mask(false);
				console.error('Failed to load users assignment:', reason);
			});
		}
	}
});
