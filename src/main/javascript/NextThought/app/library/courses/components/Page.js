Ext.define('NextThought.app.library.courses.components.Page', {
	extend: 'Ext.container.Container',
	alias: ['widget.library-view-course-page', 'widget.library-view-tab'],

	requires: [
		'NextThought.app.library.courses.components.Collection'
	],

	layout: 'none',
	defaultType: 'course-collection',
	showPage: true,
	cls: 'page scrollable',

	initComponent: function() {
		this.callParent(arguments);

		this.enableBubble(['show-available']);

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


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		if (me.emptyCmp && me.emptyCmp.el) {
			me.mon(me.emptyCmp.el, 'click', function(e) {
				var a = e.getTarget('a[data-event]'),
					eventName = a && a.getAttribute('data-event');

				if (eventName) {
					me.fireEvent(eventName);
				}
			});
		}
	},


	setItems: function(items) {
		if (Ext.isEmpty(items)) {
			this.showEmptyText();
			return;
		}

		delete this.emptyCmp;
		this.removeAll(true);
		this.addBinnedCourses(this.binCourses(items));
	},

	/*
		returns {
			bins: {},
			years: [],
			upcoming: [],
			semesters: []
		}
	*/
	binCourses: function(courses) {

		var	me = this,
			bins = {upcoming: {}},
			years = [], upcoming = [],
			semesters = Ext.Object.getValues(getString('months'));

		function getSemester(date) {
			var month = date.getMonth();
		}

		(courses || []).forEach(function(course) {
			var catalog = course.getCourseCatalogEntry(),
				start = catalog.get('StartDate'),
				year = start.getFullYear(),
				semester = catalog.getSemester(),
				yearBin = bins[year], list = years, bin = bins,
				semesterBin = yearBin && yearBin[semester];

			//if it hasn't started yet put it in an upcoming bin
			if (start > new Date()) {
				yearBin = bins.upcoming[year];
				semesterBin = yearBin && yearBin[semester];
				list = upcoming;
				bin = bins.upcoming;
			}

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


	addBinnedCourses: function(binObj) {
		var me = this, i, semester,
			bins = binObj.bins || {},
			years = binObj.years || [],
			upcoming = binObj.upcoming || [],
			semesters = binObj.semesters || [];

		//show the ongoing courses by biggest year first (biggest will be the current)
		years.sort().reverse();
		//show the upcoming courses by smallest year first (smallest will be closest to the current)
		upcoming.sort();
		//show the ongoing courses by last semester first (it will be the current)
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


		upcoming.forEach(function(year) {
			var bin = bins.upcoming[year];

			//show the first semester first
			semesters.reverse().forEach(function(semester) {
				if (bin[semester] && bin[semester].length) {
					me.add({
						label: 'upcoming',
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
