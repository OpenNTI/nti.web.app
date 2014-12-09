Ext.define('NextThought.util.courseware.options.OpenEnrollment', {
	extend: 'NextThought.util.courseware.options.Base',

	singleton: true,

	NAME: 'OpenEnrollment',
	isBase: true,

	//FIXME: getString CANNOT be called at class define time. (breaks MANY things, Chrome is holding your hand)
	EnrolledWording: getString('course-info.description-widget.open-enrolled'),


	buildEnrollmentSteps: function() {
		return [];
	},

	//FIXME: getString CANNOT be called at class define time. (breaks MANY things, Chrome is holding your hand)
	ENROLLMENT_STATES: getString('EnrollmentText').OpenEnrollment || {},


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
				state = this.getWording('archivedEnrolled');
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
			loadDetails,
			option = course.getEnrollmentOption(me.NAME);


		if (!option || (!option.Enabled && !option.IsEnrolled)) {
			return {
				loaded: Promise.reject(),
				IsEnrolled: false
			};
		}

		loadDetails = new Promise(function(fulfill, reject) {
			var catalogData = {
					Name: me.NAME,
					BaseOption: me.isBase,
					Enrolled: option.IsEnrolled,
					Price: null,
					Wording: me.__getEnrollmentText(details, option),
					lock: true,
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

		return {
			loaded: loadDetails,
			IsEnrolled: option.IsEnrolled
		};
	}
});
