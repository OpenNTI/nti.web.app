Ext.define('NextThought.view.courseware.assessment.Container', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-container',
	requires: [
		'NextThought.view.courseware.assessment.View',
		'NextThought.view.courseware.assessment.admin.reader.Panel',
		'NextThought.view.courseware.assessment.reader.Panel'
	],

	notifications: 0,

	items: [{
		title: 'Assignments',
		id: 'course-assessment-root',
		xtype: 'course-assessment'
	}],

	layout: 'card',
	onAdd: function(item) {
		this.getLayout().setActiveItem(item);
		this.mon(item, {
			notify: 'onSubViewNotify'
		});
	},

	initComponent: function() {
		this.callParent(arguments);
		this.on({
			'goto-assignment': 'gotoAssignment',
			'show-assignment': 'showAssignment',
			'update-assignment-view': 'maybeUpdateAssignmentView'
		});

		this.rootContainerShowAssignment = this.showAssignment.bind(this);
	},


	onSubViewNotify: function() {
		var c = 0;
		//aggregate all the views notification counts.
		this.items.each(function(v) {
			c += (v.notifications || 0);
		});
		this.notifications = c;
		this.fireEvent('notify', this, c);
	},


	getRoot: function() {
		return this.items.first();
	},

	//we can't really stop it at this point, but we can at least show the toast
	onBeforeDeactivate: function() {
		this.stopClose(true);
	},


	stopClose: function(forced) {
		return this.maybePreventNavigation(forced);
	},

	//if we have a reader with an assessment
	//and it is allowing close don't allow navigation
	maybePreventNavigation: function(forced) {
		var reader = this.down('reader-content'),
			assessment = reader && reader.getAssessment();

		if (!assessment) {
			return Promise.resolve();
		}

		return assessment.stopClose(forced);
	},


	showRoot: function(assignment) {
		var me = this;

		return me.maybePreventNavigation(true)
			.then(function() {
				me.getLayout().setActiveItem(0);
				Ext.destroy(me.items.getRange().slice(1));
			});
	},


	maybeUpdateAssignmentView: function(view, store) {
		var reader = this.down('reader');

		if (!reader || !reader.parentView.isDestroyed) { return; }

		if (reader.parentView.xtype === view.xtype) {
			reader.parentView = view;
			reader.store = store;
			reader.down('course-assessment-header').store = store;
		}
	},


	gotoAssignment: function(assignment, user) {
		var me = this,
			r = me.getRoot(),
			v = r.getViewFor(assignment, user);

		if (!v) {
			console.warn('No view found');
			return;
		}

		me.showRoot(assignment)
			.then(function() {
				v = r.activateView(v);

				return me.activeCourseSetup
					.then(function() {
						return v.showAssignment && v.showAssignment(assignment, user);
					});
			});
	},


	showAssignment: function(view, assignment, assignmentHistory, student, path, pageSource) {
		var me = this, time,
			active = me._showAssignmentPromise || Promise.resolve();

		me.maybePreventNavigation()
			.then(function() {
				return active.always(function() {
					active = me._showAssignmentPromise = new Promise(function(fulfill, reject) {
						var r = assignmentHistory,
							link = r && r.getLink && r.getLink('UsersCourseAssignmentHistoryItem');

						if (!r || !r.isSummary) {
							fulfill(r);
							return;
						}

						Service.request(link)
								.done(function(json) {
									var o = ParseUtils.parseItems(json)[0];

									r.set({
										Feedback: o.get('Feedback'),
										Submission: o.get('Submission'),
										pendingAssessment: o.get('pendingAssessment'),
										Grade: o.get('Grade')
									});
									delete r.isSummary;

									fulfill(r);
								})
								.fail(reject);

					});

					return active.done(function(history) {
							//both course-asessment-reader and the admin-reader extend the reader so this takes care of both
							Ext.destroy(me.down('reader'));

							var reader = me.add({
								xtype: isMe(student) ? 'course-assessment-reader' : 'course-assessment-admin-reader',
								parentView: view,
								assignmentHistory: history,
								student: student,
								path: path,
								location: assignment.getId(),
								assignment: assignment,
								pageSource: pageSource
							});

							me.mon(reader, {
								'goup': 'showRoot',
								'removed-placeholder': me.showAssignment.bind(me, view, assignment, assignmentHistory, student, path, pageSource)
							});

                            var assignmentCollection = me.down("#course-assessment-root") && me.down("#course-assessment-root").assignmentsCollection;
                            if(assignmentCollection){
                                assignmentCollection.addStoreToStoreSync(pageSource);
                            }

							return reader;
						})
						.fail(function(reason) {
							alert({
								title: getString('NextThought.view.courseware.assessment.Container.errortitle'),
								msg: getString('NextThought.view.courseware.assessment.Container.errormsg')
							});
							setTimeout(function() { throw reason; }, 1);
						});
				});
			});
	},


	bundleChanged: function() {
		var args = arguments;
		this.showRoot();
		this.activeCourseSetup = Promise.all(this.items.items.map(function(o) {
			try {
				return o.bundleChanged && o.bundleChanged.apply(o, args);
			} catch (e) {
				console.error(e.stack || e.message || e);
				return Promise.reject(e);
			}
		}));
		return this.activeCourseSetup;
	}
});
