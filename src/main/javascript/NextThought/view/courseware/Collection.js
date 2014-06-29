Ext.define('NextThought.view.courseware.Collection', {
	extend: 'NextThought.view.library.Collection',
	alias: 'widget.course-collection',

	requires: ['NextThought.view.library.settings.CourseWindow'],

	//hidden: true, //don't show this component unless the courseware controller says it can show.
	courseList: true,
	store: 'courseware.EnrolledCourses',
	cls: 'courses',

	tpl: Ext.DomHelper.markup([
		//{ cls: 'stratum collection-name', 'aria-label': '{name} {count} items', 'role': 'heading', cn: {
		//	'aria-hidden': 'true', cn: [
		//		'{name}', {cls: 'count', 'aria-hidden': 'true', html: '{count}'}
		//	]
		//}},
		{ cls: 'library-group-header', cn: [
			{cls: 'label', html: '{label}'},
			{cls: 'group', html: '{group}'}
		]},
		{ cls: 'grid', 'role': 'group', 'aria-label': '{name}', cn: {
			tag: 'tpl', 'for': 'items', cn: ['{entry}']}
		}
	]),


	prepareData: function(data, index, record) {
		var i = Ext.Object.chain(this.callParent(arguments)),
			course = record.get('CourseInstance').asUIData();

		if (course) {
			Ext.apply(i, {
				icon: course.icon,
				title: course.title,
				courseName: course.label,
				author: course.author,
				enableSettings: true
			});
		}

		return i;
	},


	collectData: function() {
		var data = this.callParent(arguments);

		data.label = this.label;
		data.group = this.group;

		return data;
	},


	onItemClick: function(record, node, index, e) {
		var win;

		if (e.getTarget('.settings')) {
			win = Ext.widget('library-course-settings', {
				course: record
			});

			win.showBy(Ext.get(node), 'tl-tl', win.offsets);

			e.stopPropagation();
			return false;
		}
	},


	handleSelect: function(selModel, record) {
		selModel.deselect(record);
		var instance = record && record.get('CourseInstance');
		instance.fireNavigationEvent(this);
	}
});
