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
		this.clearViews();
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
		me.showTab = true;
		delete me.finished;
		delete me.assignmentsCollection;

		function isSync() {
			return (me.instanceId === (instance && instance.getId()));
		}

		function getLink(rel, e) { return e.getLink(rel) || instance.getLink(rel); }

		function resetView(noAssignments) {
			if (!isSync()) { return; }
			me.clearViews();
			me.maybeUnmask();

			//Do empty state here.
			if (!noAssignments) {
				me.body.add({
					xtype: 'box',
					autoEl: {
						cn: {
							cls: 'empty-state',
							cn: [
								{cls: 'header', html: 'No assignments available at this time.'}//,
								//{cls: 'sub', html: 'Empty.'}
							]
						}
					}
				});
			} else {
				me.showTab = false;
				me.fireEvent('hide-assignments-tab', me);
			}
		}

		if (!isSync()) {
			me.clearViews();
		}

		me.instanceId = instance && instance.getId();
		me.instance = instance;

		if (!instance) {
			return Promise.resolve();
		}

		me.maybeMask();

		return instance.getWrapper().done(function(e) {
			if (!isSync()) { return; }

			if (me.shouldPushViews()) {
				if (e && e.isAdministrative) {
					me.addAdminViews(function(rel) { return getLink(rel, e); });
				} else {
					me.addStudentViews();
				}
				me.onViewChanged();
			}

			return Promise.pool(
				!e.isAdministrative && instance.getAssignmentHistory(),
				instance.getAssignments()
			)
					.done(function(objs) {//responseTexts are in the order requested
						if (!isSync()) { return; }
						var history = objs[0],
							assignments = objs[1];

						me.assignmentsCollection = assignments;
						me.hasAssignments = !assignments.isEmpty();

						if (!me.hasAssignments) {
							console.debug('The assignments call returned no assignments...');
							resetView(false);
							return;
						}

						me.fireEvent('set-assignment-history', history);

						return Promise.pool(me.forEachView(me.callFunction('setAssignmentsData', [assignments, history, instance])))
								.done(function() {
									me.maybeUnmask();
								});
					})
					.fail(function(reason) {
						console.error('No Assignments will be shown:', reason);
						resetView(true);
					});
		});

	},


	maybeMask: function() {
		var el = Ext.get('course-assessment-root');
		if (el && el.dom) {
			if (!this.finished) {
				el.mask('Loading...', 'loading');
			}
		} else {
			this.on({single: true, afterRender: 'maybeMask'});
		}
	},


	maybeUnmask: function() {
		this.finished = true;
		var el = Ext.get('course-assessment-root');
		if (el && el.dom) {
			el.unmask();
		}
	},


	shouldPushViews: function() {
		return !this.body.items.getCount();
	},


	addAdminViews: function(getLink) {
		this.body.add([
			{ xtype: 'course-assessment-admin-activity', title: 'Activity & Notifications',
				activityFeedURL: getLink('CourseActivity') },
			{ xtype: 'course-assessment-admin-assignments', title: 'Assignments' },
			{ xtype: 'course-assessment-admin-performance', title: 'Grades & Performance' }
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
		return this.body.items.items.map(fn, scope || this);
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
		if (!activeCmp) {
			activeCmp = this.body.getLayout().getActiveItem();
		}

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
		var view = null;
		this.body.items.each(function(v) {
			if (v.handlesAssignment) {
				view = v;
			}
		});

		return view;
	}
});
