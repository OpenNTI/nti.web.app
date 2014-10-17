Ext.define('NextThought.util.courseware.options.FiveminuteEnrollment', {
	extend: 'NextThought.util.courseware.options.Base',

	singleton: true,

	NAME: 'FiveminuteEnrollment',
	display: 'For Credit',
	isBase: false,

	buildEnrollmentSteps: function(course) {
		var enrollmentOption = course.getEnrollmentOption(this.NAME),
			steps = [];

		enrollmentOption.display = this.display;

		//the admission form
		this.__addStep({
			xtype: 'enrollment-admission',
			name: 'Admissions',
			enrollmentOption: enrollmentOption,
			isComplete: function() {
				return new Promise(function(fulfill, reject) {
					if ($AppConfig.userObject.get('admission_status') === 'Admitted') {
						fulfill();
					} else {
						reject();
					}
				});
			},
			complete: function(cmp, data) {
				var link = $AppConfig.userObject.getLink('fmaep.admission');

				if (!link) {
					console.error('No admit link');
					return Promise.reject();
				}

				return Service.post({
					url: link,
					timeout: 120000 //2 minutes
				}, data);
			}
		}, steps);

		//the payment confirmation
		this.__addStep({
			xtype: 'enrollment-enroll',
			name: 'Enrollment',
			enrollmentOption: enrollmentOption,
			isComplete: function() {
				var link = course.getLink('fmaep.is.pay.done'),
					crn = enrollmentOption.NTI_CRN,
					term = enrollmentOption.NTI_Term;

				if (!link) {
					return Promise.reject('No is pay done link');
				}

				return Service.post(link, {
					crn: crn,
					term: term
				}).then(function(response) {
					var json = Ext.JSON.decode(response, true);

					if (json.Status !== 200) {
						return Promise.reject(response);
					}

					if (json.State) {
						return true;
					} else {
						return Promise.reject(response);
					}
				});
			},
			complete: function(cmp, data) {
				var link = course.getEnrollAndPayLink(),
					crn = enrollmentOption.NTI_CRN,
					term = enrollmentOption.NTI_Term,
					returnUrl = course.buildPaymentReturnURL();

				if (!link) {
					return Promise.reject('No enroll and pay link');
				}

				return Service.post(link, {
					crn: crn,
					term: term,
					return_url: returnUrl
				});
			}
		}, steps);

		//payment
		this.__addStep({
			xtype: '',
			name: 'Payment',
			isComplete: function() {
				return Promise.resolve();
			}
		}, steps);


		//confirmation
		this.__addStep({
			xtype: 'enrollment-confirmation',
			name: 'Confirmation',
			isComplete: function() { return Promise.resolve(); },
			enrollmentOption: enrollmentOption
		}, steps);

		return steps;
	},

	ENROLLMENT_STATES: {
		notEnrolled: {
			title: 'Earn College Credit',
			information: 'Earn transcripted college credit from the University of Oklahoma',
			warning: 'Not available after {date}.',
			cls: 'checkbox'
		},
		enrolled: {
			title: 'Enrolled for College Credit!',
			information: 'Class begins {date} and will be conducted fully online.',
			links: [
				{href: 'welcome', text: 'Get Acquainted with Janux'},
				{href: 'profile', text: 'Complete your Profile'}
			],
			cls: 'enrolled',
			drop: 'If you are currently enrolled as an OU student, visit ' +
				'<a class=\'link\' target=\'_blank\' href=\'http://ozone.ou.edu\'>oZone</a>. ' +
				'If not, please contact the ' +
				'<a class=\'link\' target=\'_blank\' href=\'http://www.ou.edu/admissions.html\'>Admission office</a> ' +
				'by {drop} for a full refund.'
		},
		archivedEnrolled: {
			title: 'Enrolled for College Credit!',
			information: 'Thanks for your participation in OU Janux!' +
							'The content of this course will remain available for you to review at any time.'
		},
		admissionPending: {
			title: 'Admission Pending...',
			information: 'We\'re processing your request to earn college credit.' +
							'This process should take no more than two business days.' +
							'If you believe there has been an error, please contact the ' +
							'<a class=\'link\' href=\'mailto:support@nextthought.com\'>help desk.</a>',
			cls: 'pending'
		},
		admissionRejected: {
			title: 'We are unable to confirm your eligibility to enroll through this process.',
			information: 'Please contact the <a class=\'link\' href=\'mailto:support@nextthought.com\'>help desk.</a>' +
							'or <a class=\'link\' href=\'resubmit\'>resubmit your application.</a>',
			cls: 'rejected'
		},
		apiDown: {
			title: 'Earn College Credit',
			information: 'Transcripted credit is available from the University of Oklahoma but unfortunately' +
							'we cannot process an application at this time. Please contact the ' +
							'<a class=\'link\' href=\'mailto:support@nextthought.com\'>help desk.</a>',
			cls: 'down'
		}
	},

	__getEnrollmentText: function(course, option) {
		var state = {}, now = new Date(),
			details = this.__getOptionDetails(course, option);

		details.AvailableSeats = 99;

		//if the course is archived
		if (details.EndDate < now) {
			//if we are enrolled
			if (details.Enrolled) {
				state = this.getWording('archivedEnrolled');
			}
		} else if (details.Enrolled) {//if the course is active and we are enrolled in this option
			state = this.getWording('enrolled', {
				date: Ext.Date.format(details.StartDate, this.DateFormat),
				drop: Ext.Date.format(details.DropCutOff, this.DateFormat)
			});
		} else if (details.AdmissionState === 'Pending') {//if we are pending admission
			state = this.getWording('admissionPending');
		} else if (details.API_DOWN) {//if we detect the admission api is down
			state = this.getWording('apiDown');
			state.price = details.Price;
		} else if (details.AdmissionState === 'Rejected') {//if our application was rejected
			state = this.getWording('admissionRejected');
		} else {//we aren't enrolled
			state = this.getWording('notEnrolled', {
				date: Ext.Date.format(details.EnrollCutOff, this.DateFormat)
			});

			state.buttonText = 'Enroll for College Credit';

			state.price = details.Price;

			//if the available seats has been set
			if (details.AvailableSeats !== undefined) {
				state.hasSeats = true;
				state.seatcount = details.AvailableSeats;

				//if there are no seats left mark it as full
				if (details.AvailableSeats === 0) {
					state.cls = (state.cls || '') + ' full';
					state.warning = '';
					state.buttonText = '';
				} else if (details.AvailableSeats <= 10) {//if there are less than 10 seats left tell the user
					state.seats = 'Only' + Ext.util.Format.plural(details.AvailableSeats, 'seat') + ' left.';
				}
			}
		}

		state.name = this.NAME;

		return state;
	},


	__getOptionDetails: function(course, option) {
		var drop = option.OU_DropCutOffDate;

		drop = drop ? new Date(drop) : new Date();

		return {
			StartDate: course.StartDate,
			EndDate: course.EndDate,
			DropCutOff: drop,
			Enrolled: option.IsEnrolled,
			AdmissionState: $AppConfig.userObject.get('admission_status'),
			Price: option.OU_Price,
			API_DOWN: option.API_DOWN,
			AvailableSeats: option.AvailableSeats
		};
	},


	buildEnrollmentDetails: function(course, details) {
		var me = this,	catalogData, link, p,
			name = me.NAME,
			option = course.getEnrollmentOption(name);

		if (!option) {
			return Promise.reject();
		}

		link = Service.getLinkFrom(option.Links, 'fmaep.course.details');

		catalogData = {
			Name: name,
			BaseOption: me.isBase,
			Enrolled: option.IsEnrolled,
			Price: option.Price,
			doEnrollment: function(cmp) {
				cmp.fireEvent('enroll-in-course', course, name);
			},
			undoEnrollment: null
		};

		if (link && !option.IsEnrolled) {
			p = Service.request(link)
				.then(function(json) {
					json = Ext.decode(json, true);

					if (json) {
						if (json.Status === 422) {
							option.AvailableForCredit = false;
						} else {
							option.AvailableSeats = json.Course.SeatAvailable;
						}
					}
				})
				.fail(function(reason) {
					console.error('course detail request failed:', reason);

					option.API_DOWN = true;
				});
		} else {
			p = Promise.resolve();
		}


		return p.then(function() {
			catalogData.Wording = me.__getEnrollmentText(details, option);

			return catalogData;
		});
	}

});
