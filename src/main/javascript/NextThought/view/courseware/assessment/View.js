Ext.define('NextThought.view.courseware.assessment.View', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.course-assessment',
	ui: 'course-assessment',

	requires: [
		'NextThought.view.courseware.assessment.Activity',
		'NextThought.view.courseware.assessment.Navigation'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	notifications: 6,

	navigation: { xtype: 'course-assessment-navigation', margin: '0 0 10 0', override: true },
	body: {
		xtype: 'container',
		cls: 'make-white',
		layout: 'card',
		items: [
			{ xtype: 'course-assessment-activity', title: 'Activity & Notifications' }
		]
	},


	initComponent: function() {
		this.callParent(arguments);
		this.initCustomScrollOn('content');
		this.navigation.setTitle(this.title);
	},


	courseChanged: function(instance) {
	}
});
