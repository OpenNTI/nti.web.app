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
			goBackOnError: Boolean //if there is an error show the previous step
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


	__buildStoreEnrollmentSteps: function(course) {
		var enrollmentOption = course.getEnrollmentOption(this.STRIPE),
			steps = [];

		if (!enrollmentOption.Purchasable.isModel) {
			enrollmentOption.Purchasable = NextThought.model.store.PurchasableCourse.create(enrollmentOption.Purchasable);
		}

		this.__addStep({
			xtype: 'enrollment-purchase',
			name: 'Payment',
			enrollmentOption: enrollmentOption,
			isComplete: function() {return Promise.reject(); },
			complete: function(cmp, data) {
				if (!data.purchaseDescription || !data.cardInfo) {
					console.error('Incorrect data passed to complete', agruments);
					return Promise.reject();
				}

				return new Promise(function(fulfill, reject) {
					cmp.fireEvent('create-enroll-purchase', cmp, data.purchaseDescription, data.cardInfo, fulfill, reject);
				});
			}
		}, steps);


		this.__addStep({
			xtype: 'enrollment-paymentconfirmation',
			name: 'Verification',
			enrollmentOption: enrollmentOption,
			goBackOnError: true,
			isComplete: function() {return Promise.reject(); },
			complete: function(cmp, data) {
				if (!data.purchaseDescription || !data.tokenObject || !data.pricingInfo) {
					console.error('Incorrect data passed to complete', arguments);
					return Promise.reject();
				}

				return new Promise(function(fulfill, reject) {
					cmp.fireEvent('submit-enroll-purchase', cmp, data.purchaseDescription, data.tokenObject, data.pricingInfo, fulfill, reject);
				}).then(function(result) {
					//trigger the library to reload
					cmp.fireEvent('enrollment-enrolled-complete');
				});
			}
		}, steps);


		this.__addStep({
			xtype: 'enrollment-confirmation',
			name: 'Confirmation',
			enrollmentOption: enrollmentOption,
			isComplete: function() { return Promise.resolve(); }
		}, steps);

		return steps;
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
					Name: String, // the name of the option
					BaseOption: Boolean, //if the option is a base or add on
					EnrollCutOff: Date, // the last day to enroll in this option, null if there isn't one
					DropCutOff: Date, //the last day to drop from this option, null if there isn't one
					AvailableForCredit: Boolean, //if this option has college credit
					Enrolled: Boolean, //if they are enrolled in this option
					RequiresAdmission: Boolean, //if this option requires admission
					AdmissionState: String, //null if this option doesn't require admission or they aren't admitted, Pending Rejected, or Admitted otherwise
					Price: Number, //how much this option costs, null if its free
					AvailableSeats: Number, //how many seats are left,
					API_DOWN: Boolean, //if there is an external API that we detect is down
					getWording: Function, //returns the wording for the state the option is in
					doEnrollment: Function, //a function to fire the navigation/enrollment events to get the process started
					undoEnrollment: Function, //drops the course, null if they cannot drop the course in the app
				}
			}
		}
	 */

	 /**
	  * Returns the details about the different enrollment options
	  *
	  * @param  {CourseCatalogEntry} course         The course we are getting the options for
	  * @return {Promise}                fulfills with information needed to show the enrollment options
	  */
	getEnrollmentDetails: function(course) {
		var p, catalogData = {
				DateFormat: 'F j, g:i A T',
				StartDate: course.get('StartDate'),
				EndDate: course.get('EndDate'),
				Enrolled: course.isActive(),
				EnrolledType: course.get('enrollmentType'),
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

	//return all the possible options, wait is true if it should block the enrollment card
	//should wait on it to load (wait === false means its an add on)
	Options: [
		{name: 'OpenEnrollment', wait: true},
		{name: 'FiveminuteEnrollment', wait: false},
		{name: 'StoreEnrollment', wait: true}
	],

	//a shortcut for CourseWareUtils.Enrollment.Options.forEach
	forEachOption: function(fn) {
		this.Options.forEach(fn);
	},

	//Put all the wordings together in one spot so they are easy to find
	ENROLLMENT_STATES: {
		OpenEnrollment: {
			notEnrolled: {
				title: 'Enroll for Free',
				price: 0,
				information: 'Gain complete access to interact with all course content, including lectures ' +
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
		FiveminuteEnrollment: {
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
		StoreEnrollment: {
			notEnrolled: {
				title: 'Lifelong Learner',
				information: 'Gain complete access to interact with all course content, including lectures' +
								'course materials, quizzes, and discussions once the class is in session'
			},
			enrolled: {
				title: 'You are in the Lifelong Learner',
				information: 'Class begins {date} and will be conducted fully online.',
				links: [
					{href: 'welcome', text: 'Get Acquainted with Janux'},
					{href: 'profile', text: 'Complete your Profile'}
				],
				cls: 'enrolled'
			},
			archivedEnrolled: {
				title: 'You took the Lifelong Learner',
				information: 'Thanks for your participation in OU Janux!' +
								'The content of this course will remain available for you to review at any time.'
			},
			archivedNotEnrolled: {
				title: 'This Course is Archived',
				information: 'Archived courses are out of session but all course content will remain available' +
								'including the lectures, course materials, quizzes, and discussions.'
			}
		}
	},

	//get the wording for the option in a given state
	getWording: function(name, state, data) {
		var text = this.ENROLLMENT_STATES[name][state],
			prop, key;

		if (!text) { return {}; }

		for (prop in data) {
			if (data.hasOwnProperty(prop)) {
				key = '{' + prop + '}';
				text.information = text.information.replace(key, data[prop]);
				text.title = text.title.replace(key, data[prop]);

				if (text.warning) {
					text.warning = text.warning.replace(key, data[prop]);
				}

				if (text.drop) {
					text.drop = text.drop.replace(key, data[prop]);
				}
			}
		}

		return Ext.clone(text);
	},

	/**
	 * Takes the details of the option, and returns the wording for the state
	 * @param  {Object} course the details of course
	 * @param  {Object} option the details specific to this option
	 * @return {Object}        the wording for the state it is in
	 */
	getOpenEnrollmentText: function(course, option) {
		var name = this.OPEN,
			state,	now = new Date();

		//if the course is archived
		if (course.EndDate < now) {
			//if we aren't enrolled
			if (!option.Enrolled) {
				state = this.getWording(name, 'archivedNotEnrolled');
				state.buttonText = 'Add Archived Course';

			//if we enrolled before the course was archived
			} else if (course.EndDate > course.EnrollStartDate) {
				state = this.getWording(name, 'archivedEnrolled');
				state.butonText = 'Drop the Open Course';
			} else { //if we enrolled after the course was archived
				state = this.getWording(name, 'arhivedNotEnrolled');
				state.buttonText = 'Drop the Archived Course';
			}
		} else {//if the course is current or upcoming
			//if we are enrolled
			if (option.Enrolled) {
				state = this.getWording(name, 'enrolled', {
					date: Ext.Date.format(course.StartDate, course.DateFormat)
				});
				state.buttonText = 'Drop the Open Course';
			} else { //if we aren't enrolled
				state = this.getWording(name, 'notEnrolled');
				state.buttonText = 'Enroll in the Open Course';
			}
		}

		state.name = option.Name;

		return state;
	},


	__buildOpenEnrollmentDetails: function(course) {
		var me = this,
			enrollmentOption = course.getEnrollmentOption(me.OPEN);

		if (!enrollmentOption || !enrollmentOption.Enabled) {
			return Promise.reject();
		}

		return new Promise(function(fulfill, reject) {
			var catalogData = {
				Name: me.OPEN,
				EnrollCutOff: null,
				DropCutOff: null,
				AvailableForCredit: false,
				BaseOption: true, //TODO: this should come from the server
				Enrolled: enrollmentOption.IsEnrolled,
				RequiresAdmission: false,
				AdmissionState: null,
				Price: null,
				AvailableSeats: Infinity,
				getCardText: me.getOpenEnrollmentText.bind(me),
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
	},


	getFmaepText: function(course, option) {
		var name = this.FMAEP,
			state = {}, now = new Date();

		//if the course is archived
		if (course.EndDate < now) {
			//if we are enrolled
			if (option.Enrolled) {
				state = thie.getWording(name, 'archivedEnrolled');
			}
		} else if (option.Enrolled) {//if the course is active and we are enrolled in this option
			state = this.getWording(name, 'enrolled', {
				date: Ext.Date.format(course.StartDate, course.DateFormat),
				drop: Ext.Date.format(option.DropCutOff, course.DateFormat)
			});
		} else if (option.AdmissionState === 'Pending') {//if we are pending admission
			state = this.getWording(name, 'admissionPending');
		} else if (option.API_DOWN) {//if we detect the admission api is down
			state = this.getWording(name, 'apiDown');
			state.price = option.Price;
		} else if (option.AdmissionState === 'Rejected') {//if our application was rejected
			state = this.getWording(name, 'admissionRejected');
		} else {//we aren't enrolled
			state = this.getWording(name, 'notEnrolled', {
				date: Ext.Date.format(option.EnrollCutOff, course.DateFormat)
			});

			state.buttonText = 'Enroll for College Credit';

			state.price = option.Price;

			//if the available seats has been set
			if (option.AvailableSeats !== undefined) {
				state.hasSeats = true;
				state.seatcount = option.AvailableSeats;

				//if there are no seats left mark it as full
				if (option.AvailableSeats === 0) {
					state.cls = (state.cls || '') + ' full';
					state.warning = '';
					state.buttonText = '';
				} else if (option.AvailableSeats <= 10) {//if there are less than 10 seats left tell the user
					state.seats = 'Only' + Ext.util.Format.plural(option.AvailableSeats, 'seat') + ' left.';
				}
			}
		}

		state.name = option.Name;

		return state;
	},


	__buildFmaepDetails: function(course) {
		var name = this.FMAEP, p, details, catalogData,
			enrollmentOption = course.getEnrollmentOption(name),
			isEnrolled = enrollmentOption && enrollmentOption.IsEnrolled;

		if (!enrollmentOption || !enrollmentOption.NTI_FiveminuteEnrollmentCapable) {
			return Promise.reject();
		}


		details = Service.getLinkFrom(enrollmentOption.Links, 'fmaep.course.details');

		catalogData = {
			Name: name,
			EnrollCutOff: new Date(enrollmentOption.OU_EnrollCutOffDate),
			DropCutOff: new Date(enrollmentOption.OU_DropCutOffDate),
			AvailableForCredit: true,
			Enrolled: isEnrolled,
			RequiresAdmission: false,
			AdmissionState: $AppConfig.userObject.get('admission_status'),
			AvailableSeats: 0,
			API_DOWN: false,
			Price: enrollmentOption.OU_Price,
			getCardText: this.getFmaepText.bind(this),
			doEnrollment: function(cmp) {
				cmp.fireEvent('enroll-in-course', course, name);
			},
			undoEnrollment: null
		};

		//if there is a link to get external info get it and add it to the catalogData
		//only request the details if we aren't enrolled
		if (details && !isEnrolled) {
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


	getStoreEnrollmentText: function(course, option) {
		var name = this.STRIPE,
			state, now = new Date();

		//if the course is archived
		if (course.EndDate < now) {
			//if we aren't enrolled
			if (!option.Enrolled) {
				state = this.getWording(name, 'archivedNotEnrolled');
				state.buttonText = 'Add Archived Course';
			//if we enrolled before it was archived
			} else if (course.EndDate > course.EnrollStartDate) {
				state = this.getWording(name, 'arhcivedEnrolled');
			} else { //if we didn't enroll before it was archived
				state = this.getWording(name, 'archivedNotEnrolled');
			}
		} else {
			if (option.Enrolled) {
				state = this.getWording(name, 'enrolled', {
					date: Ext.Date.format(course.StartDate, course.DateFormat)
				});
			} else {
				state = this.getWording(name, 'notEnrolled');
				state.buttonText = 'Enroll as a Lifelong Learner';
				state.price = option.Price;
			}
		}

		state.name = option.Name;

		return state;
	},


	__buildStoreEnrollmentDetails: function(course) {
		var me = this,
			name = this.STRIPE,
			enrollmentOption = course.getEnrollmentOption('StoreEnrollment');

		if (!enrollmentOption) {
			return Promise.reject();
		}

		if (!enrollmentOption.Purchasable.isModel) {
			enrollmentOption.Purchasable = NextThought.model.store.PurchasableCourse.create(enrollmentOption.Purchasable);
		}

		return new Promise(function(fulfill, reject) {
			var catalogData = {
					Name: name,
					EnrollCutOff: null,
					DropCutOff: null,
					AvailableForCredit: false,
					BaseOption: true,//TODO: this should come from the server
					Giftable: true,//TODO: this should come from the server
					Enrolled: enrollmentOption.IsEnrolled, //Since this takes the place of the open course for now, might not be true in the future
					RequiresAdmission: false,
					AdmissionState: null,
					AvailableSeats: Infinity, //May not be true
					Price: enrollmentOption.Price,
					getCardText: me.getStoreEnrollmentText.bind(me),
					doEnrollment: function(cmp) {
						cmp.fireEvent('enroll-in-course', course, name);
					},
					undoEnrollment: null
				};

			if (enrollmentOption.Purchasable) {
				catalogData.RedeemToken = function(cmp, code) {
					return new Promise(function(fulfill, reject) {
						cmp.fireEvent('redeem-enrollment-token', cmp, enrollmentOption.Purchasable, code, fulfill, reject);
					});
				};
			}

			fulfill(catalogData);
		});
	}
});
