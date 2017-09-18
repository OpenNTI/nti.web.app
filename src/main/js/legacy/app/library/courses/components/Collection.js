const Ext = require('extjs');

require('../../components/Collection');
require('./settings/CourseWindow');
require('./settings/CourseMenu');


module.exports = exports = Ext.define('NextThought.app.library.courses.components.Collection', {
	extend: 'NextThought.app.library.components.Collection',
	alias: 'widget.course-collection',

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

	prepareData: function (data, index, record) {
		var i = Ext.Object.chain(this.callParent(arguments)),
			courseRecord = record.get('CourseInstance'),
			course = courseRecord.asUIData(),
			badge;

		if (course.upcoming) {
			badge = Ext.Date.format(course.startDate, 'F j, Y');
		} else if (course.archived) {
			badge = course.semester;
		}

		if (course) {
			Ext.apply(i, {
				icon: course.icon,
				title: course.title,
				courseName: course.label,
				author: course.author,
				enableSettings: true,
				semester: course.semester,
				badge: badge,
				archived: course.archived ? 'archived' : '',
				upcoming: course.upcoming ? 'upcoming' : ''
			});

			if (courseRecord.getIconImage) {
				courseRecord.getIconImage();
			}
		}

		return i;
	},

	collectData: function () {
		var data = this.callParent(arguments);

		data.label = this.label;
		data.group = this.group;

		return data;
	},

	onItemClick: function (record, node, index, e) {
		var settingsTarget = e.getTarget('.settings');

		if (settingsTarget) {
			var menuWidth = 310,
				course = record.get('CourseInstance');

			// TODO: newly created courses don't have a title field, why is that?
			if(!course.title) {
				course.title = course.asUIData().title;
			}

			this.menu = Ext.widget('course-menu',
				{
					collectionEl: this.el,
					width: menuWidth,
					course,
					record
				});
			this.menu.showBy(settingsTarget, 'tr-br');

			// avoid having hidden menus build up in the dom
			this.menu.on('hide', () => {
				this.menu && !this.menu.isDestroyed && this.menu.destroy();
			});

			// don't have menu linger after scrolling
			window.addEventListener('scroll', () => {
				this.menu.hide();
			});

			this.on('destroy', () => {
				this.menu && !this.menu.isDestroyed && this.menu.destroy();
			});

			e.stopPropagation();
			return false;
		}
	},

	handleSelect: function (selModel, record) {
		selModel.deselect(record);

		var node = this.getNodeByRecord(record);

		if (this.navigate) {
			this.navigate.call(this, record, node);
		}
	}
});
