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


	courseChanged: function(instance, refresh) {
		var me = this;
		me.instanceId = instance && instance.getId();
		me.instance = instance;

		if (!instance) {
			me.clearViews();
			return;
		}

		function isSync() {
			return (me.instanceId === instance.getId());
		}

		Promise.pool(
			instance.getOutline(),
			instance.getWrapper(),
			instance.getRoster()
		).done(function(responses) {
			var o = responses[0],
				e = responses[1],
				r = responses[2],
				grades, courseActivity;

			if (!isSync()) { return; }

			if (!e.isAdministrative) {
				me.body.add([
					{ xtype: 'course-assessment-activity', title: 'Activity & Notifications' },
					{ xtype: 'course-assessment-assignments', title: 'Assignments' },
					{ xtype: 'course-assessment-performance', title: 'Grades & Performance' }
				]);
			} else {
				//filter the active user out of the roster since we are administering this thing.
				r = r.filter(function(o) { return o && !isMe(o.Username); });

				grades = Service.request(getLink('GradeBook'));
				courseActivity = Service.request(getLink('CourseActivity'));

				me.body.add([
					{ xtype: 'course-assessment-admin-activity', title: 'Activity & Notifications' },
					{ xtype: 'course-assessment-admin-assignments', title: 'Assignments', roster: r },
					{ xtype: 'course-assessment-admin-performance', title: 'Grades & Performance', roster: r }
				]);
			}

			function getLink(rel) { return e.getLink(rel) || instance.getLink(rel); }

			Promise.pool(
				Service.request(getLink('AssignmentHistory')),
				Service.request(getLink('AssignmentsByOutlineNode')),
				grades,
				courseActivity
			)
					.done(function(txts) {//responseTexts are in the order requested
						if (!isSync()) { return; }
						var history = ParseUtils.parseItems(txts[0])[0],
							assignments = Ext.decode(txts[1], true),
							gradeBook = txts[2] && ParseUtils.parseItems(txts[2])[0],
							activity = txts[3] && ParseUtils.parseItems(Ext.decode(txts[3], true));

						me.fireEvent('set-assignemnt-history', history);

						me.forEachView(me.callFunction('setAssignmentsData',
								[assignments, history, o, instance, gradeBook, activity]));
					})
					.fail(function(reason) {
						console.error(reason);
						if (!isSync()) { return; }
						me.clearViews();
						//TODO: drop assignments tab...or start off hidden, and show in the above done function.
					});
		});

	},


	forEachView: function(fn, scope) {
		this.body.items.each(fn, scope || this);
	},


	clearViews: function() {
		this.forEachView(this.callFunction('clearAssignmentsData'));
		this.body.removeAll(true);
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


	changeView: function(view, action, data) {

		var //stateData = Ext.clone(this.getStateData()),
			c = this.down(view);

		if (!c) {
			console.error('No view selected from query: ' + view);
			return;
		}

		this.body.getLayout().setActiveItem(c);
		if (c.performAction) {
			c.performAction(action, data);
		} else if (action !== 'view') {
			console.warn(c.$className + ' does not implement performAction and was requested to ' + action + ' but it was dropped');
		}

		//stateData.activeTab = c.getStateData();
		//console.debug('State Data: ', stateData, url);
		//history.pushState({profile: Ext.clone(stateData)},this.ownerCt.title, url);
	}
});
