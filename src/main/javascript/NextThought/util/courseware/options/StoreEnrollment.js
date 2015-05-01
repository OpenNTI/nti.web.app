Ext.define('NextThought.util.courseware.options.StoreEnrollment', {
	extend: 'NextThought.util.courseware.options.Base',

	singleton: true,

	NAME: 'StoreEnrollment',
	display: 'Lifelong Learner',
	isBase: true,

	//set it to true so the getEnrolledWording won't short circuit
	EnrolledWordingKey: true,
	EnrolledWording: 'You are enrolled as a Lifelong Learner',

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
		this.__addStep({
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
					cmp.fireEvent('create-enroll-purchase', cmp, data.purchaseDescription, data.cardInfo, fulfill, reject);
				});
			}
		}, steps);


		this.__addStep({
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
					cmp.fireEvent('enrollment-enroll-started');
					cmp.fireEvent('submit-enroll-purchase', cmp, data.purchaseDescription, data.tokenObject, data.pricingInfo, fulfill, reject);
				}).then(function(result) {
					//trigger the library to reload
					return new Promise(function(fulfill, reject) {
						cmp.fireEvent('enrollment-enrolled-complete', fulfill.bind(null, result), reject);
					});
				});
			}
		}, steps);


		this.__addStep({
			xtype: 'enrollment-confirmation',
			name: 'Confirmation',
			heading: 'You\'re Enrolled as a Lifelong Learner',
			hasPricingCard: true,
			lockCoupon: true,
			enrollmentOption: option,
			isComplete: function() { return Promise.resolve(); }
		}, steps);

		return steps;
	},


	__addGiftSteps: function(course, option, steps) {
		this.__addStep({
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
					cmp.fireEvent('create-gift-purchase', cmp, data.purchaseDescription, data.cardInfo, fulfill, reject);
				});
			}
		}, steps);


		this.__addStep({
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
					cmp.fireEvent('submit-gift-purchase', cmp, data.purchaseDescription, data.tokenObject, data.pricingInfo, fulfill, reject);
				});
			}
		}, steps);

		this.__addStep({
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

		this.__addStep({
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
					cmp.fireEvent('redeem-gift', cmp, data.purchasable, data.token, data.AllowVendorUpdates, course.getId(), fulfill, reject);
				}).then(function(result) {
					//trigger the library to reload
					return new Promise(function(fulfill, reject) {
						cmp.fireEvent('enrollment-enrolled-complete', fulfill, reject);
					});
				});
			}
		}, steps);

		this.__addStep({
			xtype: 'enrollment-confirmation',
			name: 'Confirmation',
			enrollmentOption: option,
			heading: 'You\'re Enrolled as a Lifelong Learner',
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
		if (!option || (!option.IsEnrolled && !option.IsAvailable)) {
			return {
				loaded: Promise.reject(),
				IsEnrolled: false
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
			loaded: loadDetails,
			IsEnrolled: option.IsEnrolled
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
