const Ext = require('extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.options.OpenEnrollment', {
	extend: 'NextThought.app.course.enrollment.options.Base',


	NAME: 'OpenEnrollment',
	isBase: true,


	EnrolledWordingKey: 'course-info.description-widget.open-enrolled',


	buildEnrollmentSteps: function () {
		return [];
	},

	DefaultStrings: {
		notEnrolled: {
			title: 'Take the Course for Free',
			price: 0,
			information: 'Gain complete access to interact with all course content.'
		},
		enrolled: {
			title: 'You are enrolled in the Open Course',
			cls: 'enrolled',
			information: 'Class begins {date} and will be conducted fully online.',
			links: [
				{href: 'welcome', text: ''},
				{href: 'profile', text: 'Complete Your Profile'}
			]
		},
		enrolledWithNoStartDate: {
			title: 'You are enrolled in the Open Course',
			cls: 'enrolled',
			information: 'Class will be conducted fully online.',
			links: [
				{href: 'welcome', text: ''},
				{href: 'profile', text: 'Complete Your Profile'}
			]
		},
		archivedEnrolled: {
			title: 'You took the Open Course!',
			cls: 'enrolled',
			information: 'Thanks for your participation! ' +
							'The content of this course will remain available for you to review at any time.'
		},
		archivedNotEnrolled: {
			title: 'This Course is Archived.',
			price: 0,
			information: 'Archived courses are out of session but all course content will remain available.'
		}
	},

	__getEnrollmentText: function (course, option) {
		var state = {}, now = new Date(),
			details = this.__getOptionDetails(course, option);

		//if the course is archived
		if (details.EndDate < now) {
			//if we aren't enrolled
			if (!details.Enrolled) {
				state = this.getWording('archivedNotEnrolled');
				state.buttonText = 'Add Archived Course';

			//if we enrolled before the course was archived
			} else if (details.EndDate > details.EnrollStartDate) {
				state = this.getWording('archivedEnrolled');
				state.buttonText = 'Drop the Open Course';
			} else { //if we enrolled after the course was archived
				state = this.getWording('archivedEnrolled');
				state.buttonText = 'Drop the Archived Course';
			}
		} else {//if the course is current or upcoming
			//if we are enrolled
			if (details.Enrolled) {
				state = this.getWording(details.StartDate ? 'enrolled' : 'enrolledWithNoStartDate', {
					date: Ext.Date.format(details.StartDate, this.DateFormat)
				});
				state.buttonText = 'Drop the Open Course';
			} else { //if we aren't enrolled
				state = this.getWording('notEnrolled');
				state.buttonText = 'Enroll in the Open Course';
			}
		}

		state.name = this.NAME;

		return state;
	},


	__getAdmin: function (details) {
		var me = this;

		return {
			name: me.NAME,
			loaded: new Promise(function (fulfill, reject) {
				var state = me.getWording(details.StartDate ? 'enrolled' : 'enrolledWithNoStartDate', {
					date: Ext.Date.format(details.StartDate, me.DateFormat),
					drop: ''
				});

				state.cls = '';
				state.price = null;
				state.title = 'You are administering this course.';
				state.name = me.NAME;

				fulfill({
					Name: me.NAME,
					BaseOption: me.isBase,
					Enrolled: true,
					Wording: state
				});
			}),
			IsEnrolled: true,
			IsAvailable: true
		};
	},


	__getOptionDetails: function (course, option) {
		return {
			Enrolled: option.IsEnrolled,
			StartDate: course.StartDate,
			EndDate: course.EndDate,
			EnrollStartDate: course.EnrollStartDate
		};
	},


	buildEnrollmentDetails: function (course, details) {
		var me = this,
			loadDetails,
			option = course.getEnrollmentOption && course.getEnrollmentOption(me.NAME);

		if (course.get('IsAdmin')) {
			return this.__getAdmin(details);
		}

		if (!option || (!option.IsAvailable && !option.IsEnrolled)) {
			return {
				name: this.NAME,
				loaded: Promise.reject(),
				IsEnrolled: false,
				IsAvailable: false
			};
		}

		loadDetails = new Promise(function (fulfill, reject) {
			var catalogData = {
				Name: me.NAME,
				BaseOption: me.isBase,
				Enrolled: option.IsEnrolled,
				Price: null,
				Wording: me.__getEnrollmentText(details, option),
				lock: true,
				doEnrollment: function (cmp) {
					return new Promise((fulfill2, reject2) => {
						cmp.CourseEnrollmentActions.enrollCourse(course, function (success, changed, status) {
							if (success) {
								fulfill2(changed);
							} else {
								reject2(status);
							}
						});
					});
				},
				undoEnrollment: function (cmp) {
					return new Promise(function (fulfill2, reject2) {
						cmp.CourseEnrollmentActions.dropCourse(course, function (success, changed, status) {
							if (success) {
								fulfill2(changed);
							} else {
								reject2(status);
							}
						});
					});
				}
			};

			fulfill(catalogData);
		});

		return {
			name: this.NAME,
			loaded: loadDetails,
			IsEnrolled: option.IsEnrolled,
			IsAvailable: true
		};
	}
}).create();
