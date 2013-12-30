Ext.define('NextThought.view.courseware.assessment.Container', {
	extend: 'Ext.container.Container',
	alias: 'widget.course-assessment-container',
	requires: [
		'NextThought.view.courseware.assessment.View'
	],

	items: [{
		title: 'Assignments',
		id: 'course-assessment-root',
		xtype: 'course-assessment'
	}],

	layout: 'card',
	onAdd: function(item) { this.getLayout().setActiveItem(item); },


	showRoot: function() {
		this.getLayout().setActiveItem(0);
		Ext.destroy(this.items.getRange(1));
	},


	courseChanged: function() {
		var args = arguments;
		this.showRoot();
		this.items.each(function(o) {
			try {
				o.courseChanged.apply(o, args);
			} catch (e) {
				console.error(e.stack || e.message || e);
			}
		});
	}
});
