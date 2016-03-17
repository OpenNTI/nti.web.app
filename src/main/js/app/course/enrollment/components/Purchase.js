export default Ext.define('NextThought.app.course.enrollment.components.Purchase', {
	extend: 'Ext.container.Container',
	alias: 'widget.enrollment-purchase',

	requires: [
		'NextThought.app.course.enrollment.components.parts.BaseInput',
		'NextThought.app.course.enrollment.components.parts.Checkbox',
		'NextThought.app.course.enrollment.components.parts.CheckboxGroup',
		'NextThought.app.course.enrollment.components.parts.DateInput',
		'NextThought.app.course.enrollment.components.parts.Description',
		'NextThought.app.course.enrollment.components.parts.Description',
		'NextThought.app.course.enrollment.components.parts.DetailsTable',
		'NextThought.app.course.enrollment.components.parts.DropDown',
		'NextThought.app.course.enrollment.components.parts.Group',
		'NextThought.app.course.enrollment.components.parts.GroupedSet',
		'NextThought.app.course.enrollment.components.parts.Links',
		'NextThought.app.course.enrollment.components.parts.Pricing',
		'NextThought.app.course.enrollment.components.parts.RaioGroup',
		'NextThought.app.course.enrollment.components.parts.Set',
		'NextThought.app.course.enrollment.components.parts.SplitRadio',
		'NextThought.app.course.enrollment.components.parts.SubmitButton',
		'NextThought.app.course.enrollment.components.parts.Textarea',
		'NextThought.app.course.enrollment.components.parts.TextInput'
	],

	mixins: {
		form: 'NextThought.mixins.enrollment-feature.Form'
	},

	defaultType: 'enrollment-group',

	buttonCfg: [
		{name: getString('NextThought.view.courseware.enrollment.Purchase.ContEnroll'), disabled: true, action: 'submit-payment'},
		{name: getString('NextThought.view.courseware.enrollment.Purchase.CancelEnroll'), disabled: false, action: 'go-back', secondary: true}
	],

	STATE_NAME: 'enrollment-purchase',


	form: [
		{
			name: 'payment',
			label: getString('NextThought.view.courseware.enrollment.Purchase.PayInfo'),
			items: [
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Purchase.CCInfo'),
					inputs: [
						{type: 'text', name: 'name', required: true, placeholder: getString('NextThought.view.courseware.enrollment.Purchase.CardName'), size: 'card-name'},
						{
							type: 'text',
							name: 'number',
							required: true,
							doNotStore: true,
							//valueType: 'numeric',
							placeholder: getString('NextThought.view.courseware.enrollment.Purchase.Card1234'),
							size: 'left card-number',
							validateOnChange: true,
							paymentFormatter: 'formatCardNumber',
							//validator: 'validateCardNumber',
							getter: function(val) {
								return val.replace(/[^0-9]/g, '');
							}
						},
						{
							type: 'text',
							name: 'exp_',
							required: true,
							doNotStore: true,
							placeholder: getString('NextThought.view.courseware.enrollment.Purchase.CardExpDate'),
							size: 'left card-code',
							validateOnChange: true,
							paymentFormatter: 'formatCardExpiry',
							validator: 'validateCardExpiry',
							paymentGetter: 'cardExpiryVal'
						},
						{
							type: 'text',
							name: 'cvc',
							required: true,
							doNotStore: true,
							placeholder: getString('NextThought.view.courseware.enrollment.Purchase.CardCVC'),
							size: 'left card-code',
							validateOnChange: true,
							paymentFormatter: 'formatCardCVC',
							validator: 'validateCardCVC'
						}
					]
				},
				{
					xtype: 'enrollment-set',
					label: getString('NextThought.view.courseware.enrollment.Purchase.BillInfo'),
					inputs: [
						{type: 'text', name: 'address_line1', placeholder: getString('NextThought.view.courseware.enrollment.Purchase.BillAddress'), required: true, size: 'full'},
						{type: 'text', name: 'address_line2', placeholder: getString('NextThought.view.courseware.enrollment.Purchase.BillAddressOpt'), size: 'full'},
						// {type: 'text', name: 'address_line3', hidden: true, placeholder: 'Address (optional)', size: 'full'},
						// {type: 'text', name: 'address_line4', hidden: true, placeholder: 'Address (optional)', size: 'full'},
						// {type: 'text', name: 'address_line5', hidden: true, placeholder: 'Address (optional)', size: 'full'},
						{type: 'text', name: 'address_city', placeholder: getString('NextThought.view.courseware.enrollment.Purchase.CityTown'), size: 'large'},
						{type: 'text', name: 'address_state', placeholder: getString('NextThought.view.courseware.enrollment.Purchase.StateProvTerrReg'), size: 'full'},
						{type: 'text', name: 'address_country', placeholder: getString('NextThought.view.courseware.enrollment.Purchase.Country'), required: true, size: 'large left'},
						{type: 'text', name: 'address_zip', placeholder: getString('NextThought.view.courseware.enrollment.Purchase.ZIPPostCode'), size: 'small left', required: false}
					]//,
					// help: [
					//	{text: 'Add Address Line', type: 'event', event: 'add-address-line'}
					// ]
				},
				{
					xtype: 'enrollment-set',
					reveals: 'enable-submit',
					inputs: [
						{
							type: 'checkbox',
							name: 'affirm',
							doNotSend: true,
							doNotStore: true,
							text: getString('NextThought.view.courseware.enrollment.Purchase.LicenseAgree'),
							correct: true
						}
					]
				}
			]
		}
	],


	changeMonitors: {
		'coupon': 'updatePrice',
		'quantity': 'updatePrice'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.enableBubble(['show-msg', 'update-buttons', 'create-enroll-purchase']);

		this.submitBtnCfg = this.buttonCfg[0];

		this.addListeners();

		this.on('viewLicense', 'showTerms');

		this.add(this.form);
	},


	afterRender: function() {
		this.callParent(arguments);

		this.beforeShow();
	},


	fillInDefaults: function(values) {
		values.number = '';
		values.cvc = '';
		values.affirm = false;

		return values;
	},


	lock: function() {
		this.locked = true;
		this.previousDisabled = this.submitBtnCfg.disabled;
		this.submitBtnCfg.disabled = true;
		this.fireEvent('update-buttons');
	},


	unlock: function() {
		this.locked = false;
		this.submitBtnCfg.disabled = !!this.previousDisabled;
		this.fireEvent('update-buttons');
	},


	beforeShow: function() {
		// this.submitBtnCfg.disabled = false;
		// this.fireEvent('update-buttons');
		this.updateFromStorage();
	},


	getButtonCfg: function() {
		return this.buttonCfg;
	},


	buttonClick: function(action) {
		if (action === 'submit-payment') {
			this.maybeSubmit();
		}
	},


	stopClose: function() {
		var r, me = this;

		if (this.hasMask()) {
			r = Promise.reject();
		} else {
			r = new Promise(function(fulfill, reject) {
				Ext.Msg.show({
					title: getString('NextThought.view.courseware.enrollment.Purchase.PayNotSubmitted'),
					msg: getString('NextThought.view.courseware.enrollment.Purchase.ProgressLost'),
					icon: 'warning-red',
					buttons: {
						primary: {
							text: getString('NextThought.view.courseware.enrollment.Purchase.StayFinish'),
							handler: reject
						},
						secondary: {
							text: getString('NextThought.view.courseware.enrollment.Purchase.LeavePage'),
							handler: function() {
								me.clearStorage();
								fulfill();
							}
						}
					}
				});
			});
		}
		return r;
	},


	showTerms: function() {
		//TODO hardcoded link needs to go away preferably for a link like what we use for the welcome guide
		window.open(Service.getSupportLinks().termsOfService, '_blank');
	},


	getPricingInfo: function(formValue) {
		var desc = {Purchasable: this.enrollmentOption.Purchasable},
			coupon = this.getCoupon();

		if (coupon) {
			desc.Coupon = coupon;
		}

		return desc;
	},


	getParsedValues: function() {
		var raw = this.getValue();

		if (raw.exp_) {
			raw.exp_month = raw.exp_.month;
			raw.exp_year = raw.exp_.year;
		}

		if (raw.quantity < 0) {
			raw.quantity = 'self';
			raw.count = '1';
		} else if (raw.quantity === 0) {
			this.showError({Messge: getString('NextThought.view.courseware.enrollment.Purchase.InvalidNumbofLicenses')});
			raw = false;
		} else {
			raw.count = raw.quantity;
			raw.quantity = 'other';
		}

		return raw;
	},


	shouldAllowSubmission: function() {
		var me = this;

		return new Promise(function(fulfill, reject) {
			if (me.isValid()) {
				fulfill();
			} else {
				me.fireEvent('show-msg', getString('NextThought.view.courseware.enrollment.Purchase.FillInfo'), true, 5000);
				reject();
			}
		});
	},


	showStripeError: function(json) {
		var error = {};

		if (json) {
			if (json.type && json.type === 'card_error') {
				error.field = json.param;
				error.Message = json.message;
			} else if (json.Type && json.Type === 'PricingError') {
				error.field = 'coupon';
				error.Message = json.Message;
			} else if (json.Type && json.Type === 'FormError') {
				error = json;
			} else {
				error.Message = getString('NextThought.view.courseware.enrollment.Purchase.UnknownError');
			}
		} else {
			error.Message = getString('NextThought.view.courseware.enrollment.Purchase.UnknownError');
		}

		this.showError(error);
	},


	maybeSubmit: function() {
		var me = this,
			invalid,
			value = me.getParsedValues(),
			pricingInfo = me.getPricingInfo(value),
			data = {
				purchaseDescription: pricingInfo,
				cardInfo: value
			};

		me.shouldAllowSubmission()
			.then(
				function() {
					invalid = false;
					me.submitBtnCfg.disabled = true;
					me.fireEvent('update-buttons');
					me.addMask(getString('NextThought.view.courseware.enrollment.Purchase.CardProcessNotCharge'));
					return me.complete(me, data);
				},
				function() {
					invalid = true;
					return Promise.reject();
				}
			)
			.then(function(result) {
				if (!result.pricing || !result.tokenObject) {
					console.error('Unexpected result', result);
					return Promise.reject({});
				}

				me.enrollmentOption.purchaseDescription = pricingInfo;
				me.enrollmentOption.pricing = result.pricing;
				me.enrollmentOption.tokenObject = result.tokenObject;
				me.done(me);
			})
			.fail(function(error) {
				if (!invalid) {
					console.error('failed to create token', arguments);
					me.removeMask();
					me.submitBtnCfg.disabled = false;
					me.fireEvent('update-buttons');
					me.showStripeError(error);
				}
			});
	}
});
