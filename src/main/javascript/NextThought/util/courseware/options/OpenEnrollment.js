Ext.define('NextThought.util.courseware.options.OpenEnrollment', {
	extend: 'NextThought.util.courseware.options.Base',

	singleton: true,

	NAME: 'OpenEnrollment',
	isBase: true,

	EnrolledWording: getString('course-info.description-widget.open-enrolled'),


	buildEnrollmentSteps: function() {
		return [];
	},

	ENROLLMENT_STATES: {
		notEnrolled: {
			title: 'Enroll for Free',
			price: 0,
			information: 'Gain complete access to interact with all course content, including lectures, ' +
							'course materials, quizzes, and discussions once the class is in session'
		},
		enrolled: {
			title: 'You are in the Open Course',
			information: 'Class begins {date} and will be conducted fully online.',
			links: [
				{href: 'welcome', text: 'Get Acquainted with Janux'},
				{href: 'profile', text: 'Complete your Profile'}
			],
			cls: 'enrolled'
		},
		archivedEnrolled: {
			title: 'You Took the Open Course!',
			information: 'Thanks for your participation in OU Janux!' +
							'The content of this course will remain available for you to review at any time.'
		},
		archivedNotEnrolled: {
			title: 'This Course is Archived.',
			price: 0,
			information: 'Archived courses are out of session but all course content will remain available' +
							'including the lectures, course materials, quizzes, and discussions.'
		}
	},


	__getEnrollmentText: function(course, option) {
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
				state.butonText = 'Drop the Open Course';
			} else { //if we enrolled after the course was archived
				state = this.getWording(name, 'arhivedNotEnrolled');
				state.buttonText = 'Drop the Archived Course';
			}
		} else {//if the course is current or upcoming
			//if we are enrolled
			if (details.Enrolled) {
				state = this.getWording('enrolled', {
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


	__getOptionDetails: function(course, option) {
		return {
			Enrolled: option.IsEnrolled,
			StartDate: course.StartDate,
			EndDate: course.EndDate,
			EnrollStartDate: course.EnrollStartDate
		};
	},


	buildEnrollmentDetails: function(course, details) {
		var me = this,
			option = course.getEnrollmentOption(me.NAME);

		if (!option || !option.Enabled) {
			return Promise.reject();
		}

		return new Promise(function(fulfill, reject) {
			var catalogData = {
					Name: me.NAME,
					BaseOption: me.isBase,
					Enrolled: option.IsEnrolled,
					Price: null,
					Wording: me.__getEnrollmentText(details, option),
					doEnrollment: function(cmp) {
						return new Promise(function(fulfill, reject) {
							cmp.fireEvent('change-enrollment', course, true, function(success, changed) {
								if (success) {
									fulfill(changed);
								} else {
									reject();
								}
							});
						});
					},
					undoEnrollment: function(cmp) {
						return new Promise(function(fulfill, reject) {
							cmp.fireEvent('change-enrollment', course, false, function(success, changed) {
								if (success) {
									fulfill(changed);
								} else {
									reject();
								}
							});
						});
					}
				};

			fulfill(catalogData);
		});
	}
});
