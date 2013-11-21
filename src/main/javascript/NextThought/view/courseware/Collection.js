Ext.define('NextThought.view.courseware.Collection', {
	extend: 'NextThought.view.library.Collection',
	alias: 'widget.course-collection',

	hidden: true, //don't show this component unless the courseware controller says it can show.
	courseList: true,
	store: 'courses',
	cls: 'courses'

});
