Ext.define('NextThought.view.courseware.assessment.View', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.course-assessment',
	ui: 'course-assessment',

	requires: [
		'NextThought.view.courseware.assessment.Activity',
		'NextThought.view.courseware.assessment.Navigation',
		'NextThought.view.courseware.assessment.Performance',
		'NextThought.view.courseware.assessment.assignments.View'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	notifications: 0,

	navigation: { xtype: 'course-assessment-navigation', margin: '0 0 10 0', override: true },
	body: {
		xtype: 'container',
		cls: 'make-white',
		layout: { type: 'card', deferredRender: true },
		activeItem: 0,
		items: [
			{ xtype: 'course-assessment-activity', title: 'Activity & Notifications' },
			{ xtype: 'course-assessment-assignments', title: 'Assignments' },
			{ xtype: 'course-assessment-performance', title: 'Grades & Performance' }
		]
	},


	initComponent: function() {
		var me = this;
		me.callParent(arguments);
		me.initCustomScrollOn('content');
		me.navigation.setTitle(me.title);


		function monitor(panel) {
			me.navigation.addView(panel);
			me.mon(panel, {
				beforeactivate: 'onBeforeViewChanged',
				activate: 'onViewChanged',
				destroy: 'removeNavigationItem',
				notify: 'onSubViewNotify'
			});
		}

		me.forEachView(monitor, this);
		me.mon(me.navigation, {
			'show-view': 'changeView'
		});

		this.activity = this.down('course-assessment-activity');
		this.assignments = this.down('course-assessment-assignments');
		this.performance = this.down('course-assessment-performance');
	},


	courseChanged: function(instance) {
		var me = this;
		me.instanceId = instance && instance.getId();

		if (!instance) {
			me.clearViews();
			return;
		}

		function isSync() {
			return (me.instanceId === instance.getId());
		}

		Promise.pool(
			instance.getOutline(),
			instance.getEnrollment()
		).done(function(outlineAndEnrollment) {
			var o = outlineAndEnrollment[0],
				e = outlineAndEnrollment[1];
			if (!isSync()) { return; }

			Promise.pool(
				Service.request(e.getLink('AssignmentHistory')),
				Service.request(e.getLink('AssignmentsByOutlineNode'))//,
				//Service.request(e.getLink('Grades'))
			)
					.done(function(txts) {//responseTexts are in the order requested
						if (!isSync()) { return; }
						var history = ParseUtils.parseItems(txts[0])[0],
							assignments = Ext.decode(txts[1], true);

						me.forEachView(function(v) {
							var fn = v.setAssignmentsData;
							if (fn) { fn.call(v, assignments, history, o); }
						});
					})
					.fail(function(reason) {
						console.error(reason);
						if (!isSync()) { return; }
						me.clearViews();
					});
		});

	},


	forEachView: function(fn, scope) {
		this.body.items.each(fn, scope || this);
	},


	clearViews: function() {
		this.forEachView(function(v) {
			var fn = v.clearAssignmentsData;
			if (fn) { fn.call(v); }
		});
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
