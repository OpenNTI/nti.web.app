var Ext = require('extjs');

module.exports = exports = Ext.define('NextThought.app.library.courses.components.Page', {
	extend: 'Ext.container.Container',
	alias: ['widget.library-view-course-page', 'widget.library-view-tab'],
	layout: 'none',
	defaultType: 'course-collection',
	showPage: true,
	cls: 'page scrollable',

	initComponent: function () {
		this.callParent(arguments);

		this.setItems(this.upcoming, this.current, this.archived);
	},

	setItems: function (upcoming, current, archived) {
		this.removeAll(true);

		if (upcoming && upcoming.length) {
			this.addCourses(upcoming, 'Upcoming Courses');
		}

		if (current && current.length) {
			this.addCourses(current, 'Current Courses');
		}

		if (archived && archived.length) {
			this.addBinnedCourses(this.binCourses(archived), 'Archived Courses');
		}
	},

	/*
		returns {
			bins: {},
			years: [],
			upcoming: [],
			semesters: []
		}
	*/
	binCourses: function (courses) {
		var me = this,
			bins = {upcoming: {}},
			years = [], upcoming = [],
			semesters = Ext.Object.getValues(getString('months'));

		function getSemester (date) {
			var month = date.getMonth();
		}

		(courses || []).forEach(function (course) {
			var isCatalogEntry = course instanceof NextThought.model.courses.CourseCatalogEntry,
				catalog = isCatalogEntry ? course : course.getCourseCatalogEntry(),
				start = catalog.get('StartDate'),
				year = start.getFullYear(),
				semester = catalog.getSemester(),
				yearBin = bins[year], list = years, bin = bins,
				semesterBin = yearBin && yearBin[semester];

			//if we already have a bin for the year
			if (yearBin) {
				//if we already have a bin in that year for the semester
				if (semesterBin) {
					semesterBin.push(course);
				} else {
					//create a bin for that semester
					semesterBin = yearBin[semester] = [course];
				}
			} else {
				//create a bin for that year
				list.push(year);
				yearBin = bin[year] = {};
				semesterBin = yearBin[semester] = [course];
			}
		});

		return {
			bins: bins,
			years: years,
			upcoming: upcoming,
			semesters: semesters
		};
	},

	addBinnedCourses: function (binObj, label, options) {
		var me = this, i, semester,
			bins = binObj.bins || {},
			years = binObj.years || [],
			semesters = binObj.semesters || [];

		//show the ongoing courses by biggest year first (biggest will be the current)
		years.sort().reverse();

		//show the ongoing courses by last semester first (it will be the current)
		semesters = ((semesters && Ext.Array.unique(semesters)) || []).reverse();


		years.forEach(function (year) {
			var bin = bins[year];

			semesters.forEach(function (semester) {
				if (bin[semester] && bin[semester].length) {
					me.addCourses(bin[semester], label, semester + ' ' + year, options);
				}
			});
		});
	},

	addCourses: function (courses, label, group, options) {
		var o = {
			label: label,
			group: group || '',
			store: this.getCourseStore(courses),
			navigate: this.navigate && this.navigate.bind(this)
		};

		o = Ext.applyIf(o, options || {});
		this.add(o);
	},

	getCourseStore: function (data) {
		return new Ext.data.Store({
			model: 'NextThought.model.courseware.CourseInstanceEnrollment',
			data: data,
			sorters: [{
				sorterFn: function (a, b) {
					var aVal = a.get('CourseInstance'),
						bVal = b.get('CourseInstance');

					aVal = aVal && aVal.getCourseCatalogEntry();
					bVal = bVal && bVal.getCourseCatalogEntry();

					aVal = aVal && aVal.get('ProviderUniqueId');
					bVal = bVal && bVal.get('ProviderUniqueId');

					return aVal < bVal ? -1 : aVal === bVal ? 0 : 1;
				}
			}]
		});
	}
});
