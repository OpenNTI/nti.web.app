Ext.define('NextThought.view.library.CoursePage', {
	extend: 'Ext.container.Container',
	alias: ['widget.library-view-course-page', 'widget.library-view-tab'],
	requires: [
		'NextThought.view.library.Branding',
		'NextThought.view.courseware.Collection'
	],

	defaultType: 'course-collection',
	showPage: true,
	cls: 'page scrollable',

	initComponent: function() {
		this.callParent(arguments);

		this.emptyCfg = {
			xtype: 'box',
			autoEl: {cls: 'empty-text', html: this.emptyText}
		};

		this.setItems(this.courses);
	},

	showEmptyText: function() {
		if (!this.emptyCmp) {
			this.removeAll(true);
			this.emptyCmp = this.add(this.emptyCfg);
		}
	},

	setItems: function(items) {
		if (Ext.isEmpty(items)) {
			this.showEmptyText();
			return;
		}

		delete this.emptyCmp;
		this.removeAll(true);
		this.binCourses(items);
	},


	binCourses: function(courses) {
		/*
			sample bin:
				year: {
					fall: [],
					winter: [],
					spring: [],
					summer: [],
				}
		 */
		var	me = this,
			bins = {upcoming: []},
			years = [],
			semesters = Ext.Object.getValues(getString('months'));

		function getSemester(date) {
			var month = date.getMonth();
		}

		(courses || []).forEach(function(course) {
			var catalog = course.getCourseCatalogEntry(),
				start = catalog.get('StartDate'),
				year = start.getFullYear(),
				semester = catalog.getSemester(),
				yearBin = bins[year],
				semesterBin = yearBin && yearBin[semester];

			if (yearBin) {
				if (semesterBin) {
					semesterBin.push(course);
				} else {
					semesterBin = yearBin[semester] = [course];
				}
			} else {
				years.push(year);
				yearBin = bins[year] = {};
				semesterBin = yearBin[semester] = [course];
			}

			if (start > new Date()) {
				yearBin.label = 'upcoming';
			}
		});

		years.sort().reverse();
		semesters = ((semesters && Ext.Array.unique(semesters)) || []).reverse();


		years.forEach(function(year) {
			var bin = bins[year];

			semesters.forEach(function(semester) {
				if (bin[semester] && bin[semester].length) {
					me.add({
						label: bin.label || me.groupLabel,
						group: semester + ' ' + year,
						store: me.getCourseStore(bin[semester])
					});
				}
			});
		});
	},


	getCourseStore: function(data) {
		return new Ext.data.Store({
			model: 'NextThought.model.courseware.CourseInstanceEnrollment',
			data: data
		});
	}
});
