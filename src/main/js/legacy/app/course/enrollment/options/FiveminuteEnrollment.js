const Ext = require('extjs');

const OpenEnrollment = require('./OpenEnrollment');
const StoreEnrollment = require('./StoreEnrollment');

require('./Base');

module.exports = exports = Ext.define('NextThought.app.course.enrollment.options.FiveminuteEnrollment', {
	extend: 'NextThought.app.course.enrollment.options.Base',

	NAME: 'FiveminuteEnrollment',
	displayKey: 'course-info.pricing-widget.enrolled',
	isBase: true,

	RV_REGEX: /rv:(\d+\.?\d*)/,


	EnrolledWordingKey: 'course-info.description-widget.enrolled',

	buildEnrollmentSteps: function (course) {
		var enrollmentOption = course.getEnrollmentOption(this.NAME),
			openOption = course.getEnrollmentOption(OpenEnrollment.NAME),
			storeOption = course.getEnrollmentOption(StoreEnrollment.NAME),
			steps = [];

		enrollmentOption.display = this.display;
		enrollmentOption.displayKey = this.displayKey;
		enrollmentOption.hasCredit = true;
		//enrollmentOption.refunds = true;
		//enrollmentOption.refundDate = enrollmentOption.OU_RefundCutOffDate && Ext.Date.format(enrollmentOption.OU_RefundCutOffDate, this.DateFormat);

		function getEnrollAndPayLink () {
			var link = course.getEnrollAndPayLink();

			if (!link) {
				link = Service.getLinkFrom(enrollmentOption.Links, 'fmaep.pay.and.enroll');
			}

			return link;
		}

		//the admission form
		this.__addStep({
			xtype: 'enrollment-admission',
			name: 'Admissions',
			hasPricingCard: true,
			hasOpenOption: openOption && openOption.Enabled,
			hasStoreOption: storeOption && storeOption.IsAvailable,
			enrollmentOption: enrollmentOption,
			isComplete: function () {
				return new Promise(function (fulfill, reject) {
					if ($AppConfig.userObject.get('admission_status') === 'Admitted') {
						fulfill();
					} else {
						reject();
					}
				});
			},
			complete: function (cmp, data) {
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
			isComplete: function () {
				var links = enrollmentOption.Links,
					link = Service.getLinkFrom(links, 'fmaep.is.pay.done'),
					crn = enrollmentOption.NTI_CRN,
					term = enrollmentOption.NTI_Term;

				if (!link) {
					return Promise.reject('No is pay done link');
				}

				return Service.post(link, {
					crn: crn,
					term: term
				}).then(function (response) {
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
			complete: function (cmp, data) {
				var link = getEnrollAndPayLink(),
					crn = enrollmentOption.NTI_CRN,
					term = enrollmentOption.NTI_Term,
					returnUrl = course.buildPaymentReturnURL();

				if (!link) {
					return Promise.reject('No enroll and pay link');
				}

				return Service.post(link, {
					crn: crn,
					term: term,
					'return_url': returnUrl,
					AllowVendorUpdates: data.subscribe
				});
			}
		}, steps);

		//payment
		this.__addStep({
			xtype: '',
			name: 'Payment',
			isComplete: function () {
				return Promise.resolve();
			}
		}, steps);


		//confirmation
		this.__addStep({
			xtype: 'enrollment-confirmation',
			name: 'Confirmation',
			heading: 'You\'re Enrolled to Earn College Credit.',
			isComplete: function () { return Promise.resolve(); },
			enrollmentOption: enrollmentOption
		}, steps);

		return steps;
	},


	__getEnrollmentText: function (course, option) {
		var state = {}, now = new Date(),
			details = this.__getOptionDetails(course, option),
			dropDate = details.DropCutOff && Ext.Date.format(details.DropCutOff, this.DateFormat),
			dropText = dropDate && ' by ' + dropDate + ' for a full refund.';

		//if the course is archived
		if (details.EndDate < now) {
			//if we are enrolled
			if (details.Enrolled) {
				state = this.getWording('archivedEnrolled');
			}
		} else if (details.Enrolled) {//if the course is active and we are enrolled in this option
			state = this.getWording('enrolled', {
				date: Ext.Date.format(details.StartDate, this.DateFormat),
				drop: dropText || ''
			});
		} else if (details.AdmissionState === 'Pending') {//if we are pending admission
			state = this.getWording('admissionPending');
		} else if (details.API_DOWN) {//if we detect the admission api is down
			state = this.getWording('apiDown');
			state.price = details.Price;
		} else if (details.UNSUPPORTED) {
			state = this.getWording('unsupported');
			//Hard code this for now, since the strings aren't updating correctly on the server
			state = !Ext.Object.isEmpty(state) ? state : {
				title: 'Earn College Credit',
				information: 'Your browser (FireFox) does not support the enrollment process. Please try Chrome, Safari, or Internet Explorer.'
			};
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


	__getOptionDetails: function (course, option) {
		var drop = option.OU_DropCutOffDate,
			enroll = option.EnrollCutOffDate,
			unsupported = false;

		drop = drop && new Date(drop);
		enroll = enroll ? new Date(enroll) : new Date();

		return {
			StartDate: course.StartDate,
			EndDate: course.EndDate,
			DropCutOff: drop,
			EnrollCutOff: enroll,
			Enrolled: option.IsEnrolled,
			AdmissionState: $AppConfig.userObject.get('admission_status'),
			Price: option.OU_Price,
			API_DOWN: option.API_DOWN,
			AvailableSeats: option.AvailableSeats,
			UNSUPPORTED: unsupported
		};
	},


	__getForCreditEnrolled: function (details) {
		var me = this;

		return {
			name: me.NAME,
			loaded: new Promise(function (fulfill, reject) {
				var state = me.getWording('enrolled', {
					date: Ext.Date.format(details.StartDate, me.DateFormat),
					drop: ''
				});

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


	buildEnrollmentDetails: function (course, details) {
		var me = this,	catalogData, link, p,
			name = me.NAME,
			loadDetails,
			option = course.getEnrollmentOption(name);

		if (!option || (!option.IsEnrolled && !option.IsAvailable) || course.get('isAdmin')) {
			return {
				name: this.NAME,
				loaded: Promise.reject(),
				IsEnrolled: false,
				IsAvailable: false
			};
		}

		link = Service.getLinkFrom(option.Links, 'fmaep.course.details');

		catalogData = {
			Name: name,
			BaseOption: me.isBase,
			Enrolled: option.IsEnrolled,
			Price: option.Price,
			doEnrollment: function (cmp) {
				cmp.fireEvent('enroll-in-course', course, name);
			},
			undoEnrollment: null
		};

		if (link && !option.IsEnrolled) {
			p = Service.request(link)
				.then(function (json) {
					json = Ext.decode(json, true);

					if (json) {
						if (json.Status === 422) {
							option.AvailableForCredit = false;
						} else {
							option.AvailableSeats = json.Course.SeatAvailable;
						}
					}
				})
				.catch(function (reason) {
					console.error('course detail request failed:', reason);

					option.API_DOWN = true;
				});
		} else {
			p = Promise.resolve();
		}


		loadDetails = p.then(function () {
			catalogData.Wording = me.__getEnrollmentText(details, option);

			return catalogData;
		});


		return {
			name: this.NAME,
			loaded: loadDetails,
			IsEnrolled: option.IsEnrolled,
			IsAvailable: true
		};
	}

}).create();
