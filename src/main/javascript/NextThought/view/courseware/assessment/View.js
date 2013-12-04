Ext.define('NextThought.view.courseware.assessment.View', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.course-assessment',
	ui: 'course-assessment',
	requires: [
	],


	navigation: {xtype: 'box', cls: 'make-white', margin: '0 0 10 0', override: true},
	body: {xtype: 'box', cls: 'make-white'}

});
