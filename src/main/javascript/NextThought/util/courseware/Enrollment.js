Ext.define('NextThought.util.courseware.Enrollment', {
	singleton: true,

	OPEN: 'OpenEnrollment',
	FMAEP: 'FiveminuteEnrollment',
	STRIPE: 'StoreEnrollment',

	/*
		Enrollment steps are object that contain info about which views/forms users need to fill out before
		they are enrolled in a course.

		Steps look like

		{
			isComplete: function //returns a promise that fulfills if this step is completed, rejects if they need to complete it
			enrollmentOption: Object //the object from the CCE's EnrollmentOptions
			xtype: String //the view to show for this step if empty this step is just a placeholder in the breadcrumb thingy
			name: String //the name that displays in the progress bread crumb thingy
			buttonCfg: Object //the buttons to show in the window, see the documentation in NextThought.view.library.available.CourseWindow
								these should be defined on the components themselves
			complete: function //completes that step takes the cmp to fire events from and data from the ui, returns a promise
			done: function //moves the ui forward after complete is successful
			Purchasable: Model //only if payment takes place in the app
			//other data necessary for the step to complete
		}

	 */

	/**
	 * Takes a course and a type of enrollment and returns a list of steps
	 * that have to be completed to enroll in that course.
	 *
	 * @param  {CourseCatalogEntry} course the course we are building the steps for
	 * @param {String} enrollmentType the type of enrollment
	 * @return {Array}        an array of steps
	 */
	getEnrollmentSteps: function(course, enrollmentType) {
		var steps = [];

		if (enrollmentType === this.OPEN) {
			steps = this.__buildOpenEnrollmentSteps(course);
		} else if (enrollmentType === this.FMAEP) {
			steps = this.__buildFmaepSteps(course);
		} else if (enrollmentType === this.STRIPE) {
			steps = this.__buildStoreEnrollmentSteps(course);
		} else {
			console.error('Not a recognized enrollment type: ', enrollmentType);
		}

		return steps;
	},


	__stepTpl: {
		xtype: '',
		name: '',
		enrollmentOption: {},
		isActive: false,
		isComplete: function() {},
		comlete: function() {},
		done: function(cmp) {
			cmp.fireEvent('step-completed');
		},
		error: function(cmp) {
			cmp.fireEvent('step-error');
		}
	},


	__addStep: function(cfg, steps) {
		steps.push(Ext.applyIf(cfg, this.__stepTpl));
	},


	__buildOpenEnrollmentSteps: function(course) {
		return [];
	},


	__buildFmaepSteps: function(course) {
		var enrollmentOption = course.getEnrollmentOption(this.FMAEP),
			steps = [];

		//the admission form
		this.__addStep({
			xtype: 'enrollment-admission',
			name: 'Admissions',
			enrollmentOption: enrollmentOption,
			isActive: true,
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
			isActive: false,
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
			enrollmentOption: enrollmentOption
		}, steps);

		return steps;
	},


	__buildStoreEnrollmentSteps: function(course) {

	},

	/*
		Enrollment details are objects with the details about if the enrollment process is open, how long it will be open, when it
		closes, if they have already enrolled in this option and how much it is.

		Enrollment option details look like
		{
			StartDate: Date, //start date of the course
			EndDate: Date, //end date of the course
			Enrolled: String, //null if they aren't enrolled, the name of the option they are enrolled in otherwise
			EnrollStartDate: Date, //then they enrolled in the course
			Options: {
				name: A Promise that fulfills with this data or rejects if that option is not available
				{
					EnrollCutOff: Date, // the last day to enroll in this option, null if there isn't one
					DropCutOff: Date, //the last day to drop from this option, null if there isn't one
					AvailableForCredit: Boolean, //if this option has college credit
					Enrolled: Boolean, //if they are enrolled in this option
					RequiresAdmission: Boolean, //if this option requires admission
					AdmissionState: String, //null if this option doesn't require admission or they aren't admitted, Pending Rejected, or Admitted otherwise
					Price: Number, //how much this option costs, null if its free
					AvailableSeats: Number, //how many seats are left,
					API_DOWN: Boolean, //if there is an external API that we detect is down
					DoEnrollment: Function, //a function to fire the navigation/enrollment events to get the process started
					UndoEnrollment: Function, //drops the course, null if they cannot drop the course in the app
				}
			}
		}
	 */

	 //the order the options should be presented to the user
	 OptionsOrder: ['OpenEnrollment', 'FiveminuteEnrollment', 'StoreEnrollment'],
	 /**
	  * Returns the details about the different enrollment options
	  *
	  * @param  {CourseCatalogEntry} course         The course we are getting the options for
	  * @return {Promise}                fulfills with information needed to show the enrollment options
	  */
	getEnrollmentDetails: function(course) {
		var p, catalogData = {
				StartDate: course.get('StartDate'),
				EndDate: course.get('EndDate'),
				Enrolled: course.getEnrollmentType(),
				Options: {
					OpenEnrollment: this.__buildOpenEnrollmentDetails(course),
					FiveminuteEnrollment: this.__buildFmaepDetails(course),
					StoreEnrollment: this.__buildStoreEnrollmentDetails(course)
				}
			};
		//if we are enrolled in the course get the enrollment instance to see when they enrolled
		if (catalogData.Enrolled) {
			p = CourseWareUtils.findCourseBy(course.findByMyCourseInstance())
				.then(function(instance) {
					if (instance) {
						catalogData.EnrolledStartDate = instance.get('CreatedTime');
					}
				})
				.fail(function(reason) {
					console.error('Failed to find course instance:', reason);
				});
		} else {
			p = Promise.resolve();
		}

		return p.then(function() {
			return catalogData;
		});
	},


	__buildOpenEnrollmentDetails: function(course) {
		var enrollmentOption = course.getEnrollmentOption(this.OPEN);

		if (!enrollmentOption || !enrollmentOption.Enabled) {
			return Promise.reject();
		}

		return new Promise(function(fulfill, reject) {
			var catalogData = {
				EnrollCutOff: null,
				DropCutOff: null,
				AvailableForCredit: false,
				Enrolled: course.getEnrollmentType() === 'Open',
				RequiresAdmission: false,
				AdmissionState: null,
				Price: null,
				AvailableSeats: Infinity,
				DoEnrollment: function(cmp) {
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
				UndoEnrollment: function(cmp) {
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
	},


	__buildFmaepDetails: function(course) {
		var name = this.FMAEP, p, details, catalogData,
			enrollmentOption = course.getEnrollmentOption(name);

		if (!enrollmentOption || !enrollmentOption.NTI_FiveminuteEnrollmentCapable) {
			return Promise.reject();
		}


		details = Service.getLinkFrom(enrollmentOption.Links, 'fmaep.course.details');

		catalogData = {
			EnrollCutOff: enrollmentOption.OU_EnrollCutOffDate,
			DropCutOff: enrollmentOption.OU_DropCutOffDate,
			AvailableForCredit: true,
			Enrolled: course.getEnrollmentType() === 'ForCredit',
			RequiresAdmission: false,
			AdmissionState: $AppConfig.userObject.get('admission_status'),
			AvailableSeats: 0,
			API_DOWN: false,
			Price: enrollmentOption.OU_Price,
			DoEnrollment: function(cmp) {
				cmp.fireEvent('enroll-in-course', course, name);
			},
			UndoEnrollment: null
		};

		//if there is a link to get external info get it and add it to the catalogData
		if (details) {
			p = Service.request(details)
				.then(function(json) {
					json = Ext.decode(json, true);

					if (json) {
						if (json.Status === 422) {
							catalogData.AvailableForCredit = false;
						} else {
							catalogData.AvailableSeats = json.Course.SeatAvailable;
						}
					}
				})
				.fail(function(reason) {
					console.error('course detail request failed:', reason);

					catalogData.API_DOWN = true;
				});
		} else {
			p = Promise.resolve();
		}

		return p.then(function() {
			return catalogData;
		});
	},


	__buildStoreEnrollmentDetails: function(course) {
		var name = this.STORE,
			enrollmentOption = course.getEnrollmentOption('StoreEnrollment');

		if (!enrollmentOption) {
			return Promise.reject();
		}

		return new Promise(function(fulfill, reject) {
			var catalogData = {
					EnrollCutOff: null,
					DropCutOff: null,
					AvailableForCredit: false,
					Enrolled: course.getEnrollmentType() === 'Open', //Since this takes the place of the open course for now, might not be true in the future
					RequiresAdmission: false,
					AdmissionState: null,
					AvailableSeats: Infinity, //May not be true
					Price: enrollmentOption.Price,
					DoEnrollment: function(cmp) {
						cmp.fireEvent('enroll-in-course', course, name);
					},
					UndoEnrollment: null
				};
		});
	}
});
