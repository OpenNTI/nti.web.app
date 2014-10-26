Ext.define('NextThought.util.courseware.options.StoreEnrollment', {
	extend: 'NextThought.util.courseware.options.Base',

	singleton: true,

	NAME: 'StoreEnrollment',
	display: 'Lifelong Learner',
	isBase: true,

	EnrolledWording: 'You are enrolled as a Lifelong Learner',

	buildEnrollmentSteps: function(course) {
		var option = course.getEnrollmentOption(this.NAME),
			steps = [];

		if (!option.Purchasable.isModel) {
			option.Purchasable = NextThought.model.store.PurchasableCourse.create(option.Purchasable);
		}

		option.display = this.display;
		option.hasCredit = false;
		option.refunds = false;

		this.__addStep({
			xtype: 'enrollment-purchase',
			name: 'Payment',
			hasPricingCard: true,
			enrollmentOption: option,
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
			enrollmentOption: option,
			hasPricingCard: true,
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
			heading: 'You\'re Enrolled as a Lifelong Learner',
			hasPricingCard: true,
			enrollmentOption: option,
			isComplete: function() { return Promise.resolve(); }
		}, steps);

		return steps;
	},


	ENROLLMENT_STATES: {
		notEnrolled: {
			title: 'Lifelong Learner',
			information: 'Gain complete access to interact with all course content, including lectures, ' +
							'course materials, quizzes, and discussions once the class is in session.',
			refund: 'Enrollment in Lifelong Learner is not refundable.'
		},
		enrolled: {
			title: 'You\'re Enrolled as a Lifelong Learner',
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
			//if we enrolled before it was archived
			} else if (details.EndDate > details.EnrollStartDate) {
				state = this.getWording('arhcivedEnrolled');
			} else { //if we didn't enroll before it was archived
				state = this.getWording('archivedNotEnrolled');
			}
		} else {
			if (details.Enrolled) {
				state = this.getWording('enrolled', {
					date: Ext.Date.format(details.StartDate, this.DateFormat)
				});
			} else {
				state = this.getWording('notEnrolled');
				state.buttonText = 'Enroll as a Lifelong Learner';
				state.price = details.Price;
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
			EnrollStartDate: course.EnrollStartDate,
			Price: option.Price
		};
	},


	buildEnrollmentDetails: function(course, details) {
		var me = this,
			option = course.getEnrollmentOption(this.NAME),
			loadDetails;


		//if there is an option, and its either enrolled or available
		if (!option || (!option.IsEnrolled && !option.IsAvailable)) {
			return {
				loaded: Promise.reject(),
				IsEnrolled: false
			};
		}

		if (!option.Purchasable.isModel) {
			option.Purchasable = NextThought.model.store.PurchasableCourse.create(option.Purchasable);
		}

		loadDetails = new Promise(function(fulfill, reject) {
			var catalogData = {
					Name: me.NAME,
					BaseOption: me.isBase,
					Enrolled: option.IsEnrolled,
					Price: null,
					Wording: me.__getEnrollmentText(details, option),
					doEnrollment: function(cmp) {
						cmp.fireEvent('enroll-in-course', course, me.NAME);
					},
					undoEnrollment: null
				};

			fulfill(catalogData);
		});

		return {
			loaded: loadDetails,
			IsEnrolled: option.isEnroll
		};
	}
});
