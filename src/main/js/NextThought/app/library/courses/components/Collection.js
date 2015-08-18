Ext.define('NextThought.app.library.courses.components.Collection', {
	extend: 'NextThought.app.library.components.Collection',
	alias: 'widget.course-collection',

	requires: ['NextThought.app.library.courses.components.settings.CourseWindow'],

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
		{ tag: 'ul', cls: 'library-grid', 'role': 'group', 'aria-label': '{name}', cn: {
			tag: 'tpl', 'for': 'items', cn: ['{entry}']}
		}
	]),


	prepareData: function(data, index, record) {
		var i = Ext.Object.chain(this.callParent(arguments)),
			courseRecord = record.get('CourseInstance'),
			course = courseRecord.asUIData();

		if (course) {
			Ext.apply(i, {
				icon: course.icon,
				title: course.title,
				courseName: course.label,
				author: course.author,
				enableSettings: true
			});
			if(courseRecord.getIconImage){
				courseRecord.getIconImage();
			}
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
				course: record,
				renderTo: node
			});

			win.showBy(Ext.get(node), 'tl-tl', win.offsets);

			e.stopPropagation();
			return false;
		}
	},


	handleSelect: function(selModel, record) {
		selModel.deselect(record);

		var node = this.getNodeByRecord(record);
		
		if (this.navigate) {
			this.navigate.call(this, record, node);
		}
	}
});
