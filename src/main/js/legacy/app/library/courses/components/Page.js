const Ext = require('extjs');
const naturalSort = require('node-natural-sort');

const {getString} = require('legacy/util/Localization');
const CourseCatalogEntry = require('legacy/model/courses/CourseCatalogEntry');

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

		if (archived) {
			if (archived.length) {
				this.addBinnedCourses(this, this.binCourses(archived), 'Archived Courses');
			}
		} else if (this.archivedLoader) {
			// deferred archived loading
			const me = this;
			const loadArchived = () => {
				if(me.loadArchivedButton) {
					me.loadArchivedButton.el.mask('Loading...');
				}

				me.archivedLoader().then((items) => {
					if(me.loadArchivedButton) {
						me.loadArchivedButton.destroy();
					}

					me.archived = items;
					me.addBinnedCourses(this, me.binCourses(me.archived), 'Archived Courses');
				});
			};

			this.loadArchivedButton = this.add({
				xtype: 'component',
				cls: 'load-archived-button',
				autoEl: {
					tag: 'div',
					html: 'Load Archived'
				},
				listeners: {
					render: function (el) {
						el.getEl().on({
							click: function () {
								loadArchived();
							}
						});
					}
				}
			});
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
		var bins = {upcoming: {}},
			years = [], upcoming = [],
			semesters = Ext.Object.getValues(getString('months'));


		(courses || []).forEach(function (course) {
			var isCatalogEntry = course instanceof CourseCatalogEntry,
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

	addBinnedCourses: function (containerCmp, binObj, label, options) {
		var me = this,
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
					me.addCoursesToContainer(containerCmp, bin[semester], label, semester + ' ' + year, options);
				}
			});
		});

		return containerCmp;
	},

	addCourses: function (courses, label, group, options) {
		return this.addCoursesToContainer(this, courses, label, group, options);
	},

	addCoursesToContainer: function (container, courses, label, group, options) {
		var o = {
			label: label,
			group: group || '',
			store: this.getCourseStore(courses),
			navigate: this.navigate && this.navigate.bind(this)
		};

		o = Ext.applyIf(o, options || {});
		return container.add(o);
	},

	getCourseStore: function (data) {
		return new Ext.data.Store({
			model: 'NextThought.model.courseware.CourseInstanceEnrollment',
			data: data,
			sorters: [{
				sorterFn: this.sorterFn
			}]
		});
	},

	sorterFn (a, b) {
		var aVal = a.get('CourseInstance'),
			bVal = b.get('CourseInstance');

		aVal = aVal && aVal.getCourseCatalogEntry();
		bVal = bVal && bVal.getCourseCatalogEntry();

		aVal = aVal && aVal.get('ProviderUniqueID');
		bVal = bVal && bVal.get('ProviderUniqueID');

		const strComp = naturalSort({caseSensitive: false});

		return strComp(aVal, bVal);
	}
});
