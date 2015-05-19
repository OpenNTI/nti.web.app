Ext.define('NextThought.app.course.info.components.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-body',

	requires: [
		'NextThought.app.course.info.components.Panel' //,
		// 'NextThought.view.courseware.info.Roster'
	],

	layout: {
		type: 'card',
		deferredRender: true
	},
	items: [
		{ xtype: 'course-info-panel', itemId: 'info' } //,
		// { xtype: 'course-info-roster', itemId: 'roster' }
	],

	bundleChanged: function(bundle){
		console.log('Building the body');
	}

});