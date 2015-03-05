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


	restoreState: function(state) {
		if (!state) { return; }

		var view;

		this.restoringState = true;

		if (state.activeView) {
			view = this.activateView(state.activeView);
		}

		this.body.items.each(function(item) {
			if (item.restoreState) {
				item.restoreState(state[view.label], item === view);
			}
		});

		this.restoringState = false;
	},


	__getState: function(view, values) {
		var state = {};

		state[view.label] = values;

		return state;
	},


	pushState: function(view, values) {
		var layout = this.body.getLayout(),
			active = layout && layout.getActiveItem(),
			state = this.__getState(view, values);

		if (view === active && !this.restoringState) {
			history.pushState({
				content: {
					assignments: state
				}
			});
		} else {
			view.internalState = values;
		}
	},


	onViewAdd: function(body, item) {
		this.navigation.addView(item);
		this.mon(item, {
			beforeactivate: 'onBeforeViewChanged',
			activate: 'onViewChanged',
			destroy: 'removeNavigationItem',
			notify: 'onSubViewNotify'
		});

		if (!item.pushState) {
			item.pushState = this.pushState.bind(this, item);
		}

		this.mon(this.navigation, {
			'show-view': 'changeView'
		});
	},


	bundleChanged: function(instance) {
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
								{cls: 'header', html: getString('NextThought.view.courseware.assessment.View.empty')}//,
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

		if (!instance || !instance.getWrapper) {
			return Promise.resolve().then(function() {
				resetView(true);
				delete me.instanceId;
				delete me.instance;
			});
		}

		//if the instance shouldn't show assignments hide the tab
		if (!instance.shouldShowAssignments()) {
			return Promise.resolve()
				.then(function() {
					resetView(true);
					delete me.instanceId;
					delete me.instance;
				});
		}

		me.maybeMask();

		return instance.getWrapper()
				.then(function addViews(e) {
					//if we are reloading for the instance we already have set don't push views
					if (!isSync()) { return instance.getAssignments(); }

					//if we get here and we already have views, don't push more
					if (me.shouldPushViews()) {
						if (e && e.isAdministrative) {
							me.addAdminViews(function(rel) { return getLink(rel, e); });
						} else {
							me.addStudentViews();
						}
						me.onViewChanged();
					}

					return instance.getAssignments();
				})
				.then(function applyData(assignments) {
					if (!isSync()) { return; }

					me.assignmentsCollection = assignments;
					me.hasAssignments = !assignments.isEmpty();

					if (!me.hasAssignments) {
						console.debug('The assignments call returned no assignments...');
						resetView(false);
						return;
					}

					assignments.getHistory()
						.then(function(history) {
							try {
								me.fireEvent('set-assignment-history', history);
							} catch (e) {
								Error.raiseForReport(e);
							}
						});


					return Promise.all(
								me.forEachView(
									me.callFunction('setAssignmentsData', [assignments, instance])
								)
							);
				})
				.done(function() {
					me.maybeUnmask();
				})
				.fail(function(reason) {
					console.error('No Assignments will be shown:', reason);
					resetView(true);
					throw reason;
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
			{xtype: 'course-assessment-admin-activity', title: getString('NextThought.view.courseware.assessment.View.activity'), label: 'notifications',
				activityFeedURL: getLink('CourseActivity')},
			{xtype: 'course-assessment-admin-assignments', title: getString('NextThought.view.courseware.assessment.View.assignments'), label: 'assignments'},
			{xtype: 'course-assessment-admin-performance', title: getString('NextThought.view.courseware.assessment.View.grades'), label: 'performance'}
		]);
	},


	addStudentViews: function() {
		this.body.add([
			{xtype: 'course-assessment-activity', title: getString('NextThought.view.courseware.assessment.View.activity'),	label: 'notifications'},
			{xtype: 'course-assessment-assignments', title: getString('NextThought.view.courseware.assessment.View.assignments'), label: 'assignments'},
			{xtype: 'course-assessment-performance', title: getString('NextThought.view.courseware.assessment.View.grades'), label: 'performance'}
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
				try { return fn.apply(v, args); }
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

		//if we still don't have an active cmp no need in going any further
		if (!activeCmp) { return; }

		var state;

		//if there has been some internal state added to the component
		//when it becomes the active view push it to the history
		if (activeCmp.internalState) {
			state = this.__getState(activeCmp, activeCmp.internalState);

		} else {
			state = {};
		}

		//add the active view
		state.activeView = activeCmp.xtype;

		history.pushState({
			content: {
				assignments: state
			}
		});

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

		//if we are given a model, get its id to match
		assignment = assignment.getId ? assignment.getId() : assignment;

		if (/Final_Grade$/i.test(assignment) || /finalgrade$/i.test(assignment)) {
			return this.down('course-assessment-performance,course-assessment-admin-performance');
		}

		this.body.items.each(function(v) {
			if (v.handlesAssignment) {
				view = v;
			}
		});

		return view;
	},


	selectMenuItem: function(viewId) {
		var record = this.navigation.store.findRecord('view', viewId);

		if (!record) {
			console.error('No record for view id', viewId);
			return;
		}

		this.navigation.selModel.select(record);
	}
});
