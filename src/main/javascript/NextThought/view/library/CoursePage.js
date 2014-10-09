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

		if (me.emptyCmp) {
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

		years.sort().reverse();
		upcoming.sort().reverse();
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

			semesters.forEach(function(semester) {
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
