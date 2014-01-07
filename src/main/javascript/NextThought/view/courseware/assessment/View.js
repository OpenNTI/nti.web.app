Ext.define('NextThought.view.courseware.assessment.View', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.course-assessment',
	ui: 'course-assessment',

	requires: [
		'NextThought.view.courseware.assessment.Activity',
		'NextThought.view.courseware.assessment.Navigation',
		'NextThought.view.courseware.assessment.Performance',
		'NextThought.view.courseware.assessment.assignments.View',
		'NextThought.view.courseware.assessment.assignments.admin.View',
		'NextThought.view.courseware.assessment.admin.Activity',
		'NextThought.view.courseware.assessment.admin.performance.View'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	notifications: 0,

	navigation: { xtype: 'course-assessment-navigation', margin: '0 0 10 0', override: true },
	body: {
		xtype: 'container',
		cls: 'make-white',
		layout: { type: 'card', deferredRender: true }
	},


	initComponent: function() {
		this.callParent(arguments);
		this.initCustomScrollOn('content');
		this.navigation.setTitle(this.title);
		this.mon(this.body, 'add', 'onViewAdd');
	},


	onViewAdd: function(body, item) {
		this.navigation.addView(item);
		this.mon(item, {
			beforeactivate: 'onBeforeViewChanged',
			activate: 'onViewChanged',
			destroy: 'removeNavigationItem',
			notify: 'onSubViewNotify'
		});

		this.mon(this.navigation, {
			'show-view': 'changeView'
		});
	},


	courseChanged: function(instance) {
		var me = this;

		me.hasAssignments = false;

		function isSync() {
			return (me.instanceId === (instance && instance.getId()));
		}

		function getLink(rel, e) { return e.getLink(rel) || instance.getLink(rel); }

		if (!isSync()) {
			me.clearViews();
		}

		me.instanceId = instance && instance.getId();
		me.instance = instance;

		if (!instance) {
			return;
		}


		Promise.pool(
			instance.getOutline(),
			instance.getWrapper(),
			instance.getRoster()
		).done(function(responses) {
			var o = responses[0],
				e = responses[1],
				r = responses[2],
				grades = e && e.isAdministrative && Service.request(getLink('GradeBook', e));

			if (!isSync()) { return; }

			if (me.shouldPushViews()) {
				if (e && e.isAdministrative) {
					me.addAdminViews(r, function(rel) { return getLink(rel, e); });
				} else {
					me.addStudentViews();
				}
			}

			Promise.pool(
				!e.isAdministrative && instance.getAssignmentHistory(),
				instance.getAssignments(),
				grades
			)
					.done(function(txts) {//responseTexts are in the order requested
						if (!isSync()) { return; }
						var history = txts[0],
							assignments = txts[1],
							gradeBook = txts[2] && ParseUtils.parseItems(txts[2])[0];

						me.hasAssignments = !assignments.isEmpty();
						if (me.hasAssignments) {
							me.fireEvent('show-assignments-tab');
						} else {
							me.clearViews();
							me.fireEvent('failed-to-load', me.up('[isTabView]'));
							return;
						}

						me.fireEvent('set-assignemnt-history', history);

						me.forEachView(me.callFunction('setAssignmentsData',
								[assignments, history, o, instance, gradeBook]));
					})
					.fail(function(reason) {
						console.error(reason);
						if (!isSync()) { return; }
						me.clearViews();
						me.fireEvent('failed-to-load', me.up('[isTabView]'));
					});
		});

	},


	shouldPushViews: function() {
		return !this.body.items.getCount();
	},


	addAdminViews: function(roster, getLink) {
		//filter the active user out of the roster since we are administering this thing.
		var r = roster.filter(function(o) { return o && !isMe(o.Username); });

		this.body.add([
			{ xtype: 'course-assessment-admin-activity', title: 'Activity & Notifications',
				activityFeedURL: getLink('CourseActivity') },
			{ xtype: 'course-assessment-admin-assignments', title: 'Assignments', roster: r },
			{ xtype: 'course-assessment-admin-performance', title: 'Grades & Performance', roster: r }
		]);
	},


	addStudentViews: function() {
		this.body.add([
			{ xtype: 'course-assessment-activity', title: 'Activity & Notifications' },
			{ xtype: 'course-assessment-assignments', title: 'Assignments' },
			{ xtype: 'course-assessment-performance', title: 'Grades & Performance' }
		]);
	},


	forEachView: function(fn, scope) {
		this.body.items.each(fn, scope || this);
	},


	clearViews: function() {
		this.forEachView(this.callFunction('clearAssignmentsData'));
		this.body.removeAll(true);
		this.navigation.clear();
	},


	callFunction: function(name, args) {
		return function(v) {
			var fn = v[name];
			if (fn) {
				try { fn.apply(v, args); }
				catch (e) {console.error(e.stack || e.message || e);}
			}
		};
	},


	onSubViewNotify: function() {
		var c = 0;
		//aggregate all the views notification counts.
		this.forEachView(function(v) {
			c += (v.notifications || 0);
		});
		this.notifications = c;
		this.fireEvent('notify', this, c);
	},


	onBeforeDeactivate: function() {
		return Ext.Array.every(this.body.items.items, function(item) {
			return item.fireEvent('beforedeactivate');
		});
	},


	onBeforeViewChanged: function() {},


	onViewChanged: function(activeCmp) {
		this.navigation.updateSelection(activeCmp);
	},


	removeNavigationItem: function(cmp) {
		this.navigation.removeNavigationItem(cmp);
	},


	activateView: function(view) {
		var c = this.down(view);
		if (!c) {
			console.error('No view selected from query: ' + view);
			return;
		}
		this.body.getLayout().setActiveItem(c);
		return c;
	},


	changeView: function(view, action, data) {

		var //stateData = Ext.clone(this.getStateData()),
			c = this.activateView(view);

		if (!c) {
			return;
		}

		if (c.performAction) {
			c.performAction(action, data);
		} else if (action !== 'view') {
			console.warn(c.$className + ' does not implement performAction and was requested to ' + action + ' but it was dropped');
		}

		//stateData.activeTab = c.getStateData();
		//console.debug('State Data: ', stateData, url);
		//history.pushState({profile: Ext.clone(stateData)},this.ownerCt.title, url);
	},


	getViewFor: function(assignment, user) {
		var view;
		this.body.items.each(function(v) {
			if (v.handlesAssignment) {
				view = v;
			}
		});

		return view;
	}
});
