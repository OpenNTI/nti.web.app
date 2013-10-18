Ext.define('NextThought.view.course.info.outline.View',{
	extend: 'Ext.container.Container',
	alias: 'widget.course-info-outline',
	layout: 'auto',

	requires: [
		'NextThought.view.course.info.outline.Menu',
		'NextThought.view.course.info.outline.OpenCourseInfo'
	],

	setContent: function(info){
		this.removeAll(true);

		if (Ext.isString(info)) {
			this.hide();
			return;
		}

		this.show();

		this.add({
			xtype: 'course-info-outline-menu',
			info: info
		},{
			xtype: 'course-info-outline-open-course',
			info: info
		})
	}
});
