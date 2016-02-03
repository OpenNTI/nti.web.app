Ext.define('NextThought.app.course.enrollment.options.StoreEnrollment', {
	extend: 'NextThought.app.course.enrollment.options.Base',

	requires: [
		'NextThought.app.store.Actions',
		'NextThought.app.course.enrollment.Actions'
	],

	singleton: true,

	NAME: 'StoreEnrollment',
	displayKey: 'course-info.pricing-widget.store-enrolled',
	isBase: true,

	//set it to true so the getEnrolledWording won't short circuit
	EnrolledWordingKey: 'course-info.description-widget.store-enrolled',

	DefaultStrings: {
		notEnrolled: {
			title: 'Candidate',
			information: 'Gain complete access to all exam preparation materials in the course',
			refund: 'Enrollment is not refundable.'
		},
		enrolled: {
			title: 'You\'re Enrolled',
			information: 'Your access to exam preparation materials begins now.',
			links: [],
			cls: 'enrolled'
		},
		archivedEnrolled: {
			title: 'You took the Course',
			information: 'Thanks for your participation!' +
							'The content of this course will remain available for you to review at any time.'
		},
		archivedNotEnrolled: {
			title: 'This Course is Archived',
			information: 'Archived courses are out of session but all course content will remain available ' +
							'including the lectures, course materials, quizzes, and discussions.'
		}
	},


	constructor: function(config) {
		this.callParent(arguments);

		this.StoreActions = NextThought.app.store.Actions.create();
		this.CourseEnrollmentActions = NextThought.app.course.enrollment.Actions.create();
	},

	__getPurchasableByNTIID: function(ntiid, option) {
		var items = option.Purchasables.Items, i, item,
			purchasable;

		for (i = 0; i < items.length; i++) {
			item = items[i];

			if ((item.getId && item.getId() === ntiid) || item.NTIID === ntiid) {
				purchasable = item;
				break;
			}
		}

		if (purchasable && !purchasable.isModel) {
			purchasable = NextThought.model.store.PurchasableCourse.create(purchasable);
			items[i] = purchasable;
		}

		return purchasable;
	},


	__getGiftPurchasable: function(option) {
		var ntiid = option && option.Purchasables && option.Purchasables.DefaultGiftingNTIID;

		if (!ntiid) {
			return null;
		}

		return this.__getPurchasableByNTIID(ntiid, option);
	},


	__getPurchasable: function(option) {
		var ntiid = option && option.Purchasables && option.Purchasables.DefaultPurchaseNTIID;

		if (!ntiid) {
			return null;
		}

		return this.__getPurchasableByNTIID(ntiid, option);
	},


	buildEnrollmentSteps: function(course, type, config) {
		var option = course.getEnrollmentOption(this.NAME),
			steps = [];

		option.display = this.display;
		option.displayKey = thid.displayKey;
		option.hasCredit = false;
		//option.Refunds = false;

		function addPurchasable(purchasable) {
			option.Purchasable = purchasable;
			option.Price = purchasable.get('Amount');
		}

		if (!type || type === 'self') {
			addPurchasable(this.__getPurchasable(option));
			steps = this.__addBaseSteps(course, option, steps, config);
		} else if (type === 'gift') {
			addPurchasable(this.__getGiftPurchasable(option));
			steps = this.__addGiftSteps(course, option, steps, config);
		} else if (type === 'redeem') {
			addPurchasable(this.__getGiftPurchasable(option));
			steps = this.__addRedeemSteps(course, option, steps, config);
		}

		return steps;
	},


	__addBaseSteps: function(course, option, steps) {
		var me = this,
			confirmationText = getString('EnrollmentConfirmation') || {};

		me.__addStep({
			xtype: 'enrollment-purchase',
			name: 'Payment Info',
			hasPricingCard: true,
			enrollmentOption: option,
			isComplete: function() {return Promise.reject(); },
			complete: function(cmp, data) {
				if (!data.purchaseDescription || !data.cardInfo) {
					console.error('Incorrect data passed to complete', agruments);
					return Promise.reject();
				}

				return new Promise(function(fulfill, reject) {
					me.StoreActions.createEnrollmentPurchase(cmp, data.purchaseDescription, data.cardInfo, fulfill, reject);
				});
			}
		}, steps);


		me.__addStep({
			xtype: 'enrollment-paymentconfirmation',
			name: 'Review and Purchase',
			enrollmentOption: option,
			hasPricingCard: true,
			goBackOnError: true,
			lockCoupon: true,
			isComplete: function() {return Promise.reject(); },
			complete: function(cmp, data) {
				if (!data.purchaseDescription || !data.tokenObject || !data.pricingInfo) {
					console.error('Incorrect data passed to complete', arguments);
					return Promise.reject();
				}

				return new Promise(function(fulfill, reject) {
					cmp.fireEvent('enrollment-enroll-started');//Nothing is listening to this...
					me.StoreActions.submitEnrollmentPurchase(cmp, data.purchaseDescription, data.tokenObject, data.pricingInfo, fulfill, reject);
				}).then(function(result) {
					//trigger the library to reload
					return new Promise(function(fulfill, reject) {
						me.CourseEnrollmentActions.refreshEnrolledCourses(fulfill.bind(null, result), reject);
					});
				});
			}
		}, steps);


		me.__addStep({
			xtype: 'enrollment-confirmation',
			name: 'Confirmation',
			heading: confirmationText.heading || 'You\'re Enrolled as a Lifelong Learner',
			hasPricingCard: true,
			lockCoupon: true,
			enrollmentOption: option,
			isComplete: function() { return Promise.resolve(); }
		}, steps);

		return steps;
	},


	__addGiftSteps: function(course, option, steps) {
		var me = this,
			redemptionText = getString('RedemptionConfirmation') || {};

		me.__addStep({
			xtype: 'enrollment-gift-purchase',
			name: 'Payment Info',
			hasPricingCard: true,
			enrollmentOption: option,
			isComplete: function() { return Promise.reject(); },
			complete: function(cmp, data) {
				if (!data.purchaseDescription || !data.cardInfo) {
					console.error('Incorrect data passed to complete', arguments);
					return Promise.reject();
				}

				return new Promise(function(fulfill, reject) {
					me.StoreActions.createEnrollmentPurchase(cmp, data.purchaseDescription, data.cardInfo, fulfill, reject);
				});
			}
		}, steps);


		me.__addStep({
			xtype: 'enrollment-paymentconfirmation',
			name: 'Review and Purchase',
			enrollmentOption: option,
			hasPricingCard: true,
			goBackOnError: true,
			lockCoupon: true,
			isComplete: function() { return Promise.reject(); },
			complete: function(cmp, data) {
				if (!data.purchaseDescription || !data.tokenObject || !data.pricingInfo) {
					console.error('Incorrect data passed to complete', arguments);
					return Promise.reject();
				}

				return new Promise(function(fulfill, reject) {
					me.StoreActions.submitGiftPurchase(cmp, data.purchaseDescription, data.tokenObject, data.pricingInfo, fulfill, reject);
				});
			}
		}, steps);

		me.__addStep({
			xtype: 'enrollment-gift-confirmation',
			name: 'Confirmation',
			lockCoupon: true,
			enrollmentOption: option,
			hasPricingCard: true,
			isComplete: function() { return Promise.resolve(); }
		}, steps);

		return steps;
	},


	__addRedeemSteps: function(course, option, steps, config) {
		if (config && config[0]) {
			option.redeemToken = config[0];
		}

		var me = this;

		me.__addStep({
			xtype: 'enrollment-gift-redeem',
			name: 'Redeem',
			enrollmentOption: option,
			hasPricingCard: true,
			hidePrice: true,
			isComplete: function() { return Promise.reject(); },
			complete: function(cmp, data) {
				if (!data.token || !data.purchasable) {
					console.error('Incorrect data passed to redeem', arguments);
					return Promise.reject();
				}
				return new Promise(function(fulfill, reject) {
					me.StoreActions.redeemGift(cmp, data.purchasable, data.token, data.AllowVendorUpdates, course.getId(), fulfill, reject);
				}).then(function(courseInstanceEnrollment) {
					//trigger the library to reload
					var courseInstance = courseInstanceEnrollment.get('CourseInstance');

					return new Promise(function(fulfill, reject) {
						Service.request(courseInstance.getLink('CourseCatalogEntry'))
							.then(function(catalogEntry) {
								catalogEntry = ParseUtils.parseItems(catalogEntry)[0];
								course.set('EnrollmentOptions', catalogEntry.get('EnrollmentOptions'));
								me.CourseEnrollmentActions.refreshEnrolledCourses(fulfill, reject);
							})
							.fail(reject);
					});
				});
			}
		}, steps);

		me.__addStep({
			xtype: 'enrollment-confirmation',
			name: 'Confirmation',
			enrollmentOption: option,
			heading: redemptionText.heading || 'You\'re Enrolled as a Lifelong Learner',
			hasPricingCard: false,
			isComplete: function() { return Promise.resolve(); }
		}, steps);

		return steps;
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
				state.price = details.Price;
			//if we enrolled before it was archived
			} else if (details.EndDate > details.EnrollStartDate) {
				state = this.getWording('arhcivedEnrolled');
			} else { //if we didn't enroll before it was archived
				state = this.getWording('archivedNotEnrolled');
				state.price = details.Price;
			}
		} else {
			if (details.Enrolled) {
				state = this.getWording('enrolled', {
					date: Ext.Date.format(details.StartDate, this.DateFormat)
				});
			} else {
				state = this.getWording('notEnrolled');
				// Give strings files preferences in determining the text of the button text
				state.buttonText = state.buttonText || 'Enroll as a Lifelong Learner';
				state.price = details.Price;
			}
		}

		state.name = this.NAME;

		return state;
	},

	__getGiftText: function(purchasable, course, option) {
		var state = {},
			details = this.__getOptionDetails(course, option);

		if (purchasable && purchasable.isGiftable()) {
			state.giftClass = 'show';
			state.giveClass = 'show';
			state.giveTitle = 'Lifelong Learner Only';
		}

		//if you are enrolled at all don't show the redeem option
		if (purchasable && purchasable.isRedeemable() && !details.Enrolled && !course.Enrolled) {
			state.giftClass = 'show';
			state.redeemClass = 'show';
		}

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
			giftPurchasable = this.__getGiftPurchasable(option),
			defaultPurchasable = this.__getPurchasable(option),
			loadDetails;

		//if there is an option, and its either enrolled or available
		if (!option || (!option.IsEnrolled && !option.IsAvailable) || course.get('isAdmin')) {
			return {
				name: this.NAME,
				loaded: Promise.reject(),
				IsEnrolled: false,
				IsAvailable: false
			};
		}

		if (!option.Price && defaultPurchasable) {
			option.Price = defaultPurchasable.get('Amount');
		}


		loadDetails = new Promise(function(fulfill, reject) {
			var catalogData = {
					Name: me.NAME,
					BaseOption: me.isBase,
					Enrolled: option.IsEnrolled,
					Price: null,
					Wording: me.__getEnrollmentText(details, option),
					doEnrollment: function(cmp, type, config) {
						cmp.fireEvent('enroll-in-course', course, me.NAME, type, config);
					},
					undoEnrollment: null
				};

			fulfill(catalogData);
		});

		return {
			name: this.NAME,
			loaded: loadDetails,
			IsEnrolled: option.IsEnrolled,
			IsAvailable: true
		};
	},


	buildGiftOptions: function(course, details) {
		var me = this,
			option = course.getEnrollmentOption(this.NAME),
			giftPurchasable = this.__getGiftPurchasable(option),
			loadDetails;


		if (!giftPurchasable || !(giftPurchasable.isGiftable() || giftPurchasable.isRedeemable())) {
			return {};
		}

		return {
			Wording: me.__getGiftText(giftPurchasable, details, option),
			//if the purchasable is redeemable and you're not enrolled
			Redeemable: giftPurchasable.isRedeemable() && !course.isActive(),
			doEnrollment: function(cmp, type, config) {
				cmp.fireEvent('enroll-in-course', course, me.NAME, type, config);
			}
		};
	}
});
