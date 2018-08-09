const Ext = require('@nti/extjs');

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
			course = record.asUIData(),
			badge;

		if (course.completed) {
			badge = 'Completed';
		} else if (course.upcoming) {
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
				byline: null,
				enableSettings: true,
				semester: course.semester,
				badge: badge,
				//if the course is completed don't mark it as archived
				archived: course.archived && !course.completed ? 'archived' : '',
				upcoming: course.upcoming ? 'upcoming' : '',
				completed: course.completed ? 'completed' : '',
				progress: course.progress
			});

			if (record.getIconImage) {
				record.getIconImage();
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
			var menuWidth = 310;

			record.getCourseInstance().then(course => {
				// TODO: newly created courses don't have a title field, why is that?
				if(!course.title) {
					course.title = record.asUIData().title;
				}

				this.menu = Ext.widget('course-menu',
					{
						collectionEl: this.el,
						width: menuWidth,
						course,
						record,
						goToRecord: this.goToRecord.bind(this)
					});

				// showBy settings icon
				this.menu.showBy(settingsTarget, 'tr-br');

				// re-adjust left location if left overlaps left side of window
				const offsetX = this.menu.getEl().dom.getBoundingClientRect().left;

				if(offsetX < 0) {
					this.menu.setX(this.menu.getX() + Math.abs(offsetX));
				}

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
			}).catch(err => console.log(err));

			e.stopPropagation();
			return false;
		}
	},

	goToRecord: function (record, subRoute) {
		var node = this.getNodeByRecord(record);

		if (this.navigate) {
			this.navigate.call(this, record, node, subRoute);
		}
	},

	handleSelect: function (selModel, record) {
		selModel.deselect(record);

		this.goToRecord(record);
	}
});
