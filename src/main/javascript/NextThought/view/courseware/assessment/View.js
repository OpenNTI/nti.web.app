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
			instance.getEnrollment()
		).done(function(outlineAndEnrollment) {
			var o = outlineAndEnrollment[0],
				e = outlineAndEnrollment[1];
			if (!isSync()) { return; }

			me.body.add([
				{ xtype: 'course-assessment-activity', title: 'Activity & Notifications' },
				{ xtype: 'course-assessment-assignments', title: 'Assignments' },
				{ xtype: 'course-assessment-performance', title: 'Grades & Performance' }
			]);

			function getLink(rel) { return e.getLink(rel) || instance.getLink(rel); }

			Promise.pool(
				Service.request(getLink('AssignmentHistory')),
				Service.request(getLink('AssignmentsByOutlineNode'))//,
				//Service.request(e.getLink('Grades'))
			)
					.done(function(txts) {//responseTexts are in the order requested
						if (!isSync()) { return; }
						var history = ParseUtils.parseItems(txts[0])[0],
							assignments = Ext.decode(txts[1], true);

						me.fireEvent('set-assignemnt-history', history);

						me.forEachView(me.callFunction('setAssignmentsData',
								[assignments, history, o]));
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
