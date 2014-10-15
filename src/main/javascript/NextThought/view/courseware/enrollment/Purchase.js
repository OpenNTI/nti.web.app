Ext.define('NextThought.view.courseware.enrollment.Purchase', {
	extend: 'Ext.container.Container',
	alias: 'widget.enrollment-purchase',

	requires: ['NextThought.view.courseware.enrollment.parts.*'],

	mixins: {
		form: 'NextThought.mixins.enrollment-feature.Form'
	},

	defaultType: 'enrollment-group',

	buttonCfg: [
		{name: 'Continue to Enrollment', disabled: true, action: 'submit-payment'},
		{name: 'Cancel', disabled: false, action: 'go-back', secondary: true}
	],

	STATE_NAME: 'enrollment-purchase',


	form: [
		{
			name: 'payment',
			label: 'Payment Information',
			items: [
				{
					xtype: 'enrollment-set',
					label: 'Who are you purchasing for?',
					inputs: [
						{type: 'radio-group', name: 'quantity', required: true, options: [
							{text: 'Me. I want to buy a license for my account', value: -1},
							{
								text: 'I want to purchase {input} activation keys to share with to share with others',
								value: 'input',
								inputWidth: 48,
								inputCfg: {
									type: 'number',
									pattern: '[0-9]*'
								}
							}
						]}
					],
					help: [
						{text: 'What is an activation key?', type: 'text', info: 'An activation key is a code that gives you access to the content.'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Coupon',
					inputs: [
						{type: 'text', name: 'coupon', placeholder: 'Coupon Code'}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Credit Card Information',
					inputs: [
						{type: 'text', name: 'name', required: true, placeholder: 'Name on Card', size: 'full'},
						{
							type: 'text',
							name: 'number',
							required: true,
							doNotStore: true,
							//valueType: 'numeric',
							placeholder: '1234 1234 1234 1234',
							size: 'left',
							validateOnChange: true,
							paymentFormatter: 'formatCardNumber',
							validator: 'validateCardNumber',
							getter: function(val) {
								return val.replace(/[^0-9]/g, '');
							}
						},
						{
							type: 'text',
							name: 'exp_',
							required: true,
							doNotStore: true,
							placeholder: 'MM / YY',
							size: 'small left',
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
							placeholder: 'Security Code',
							size: 'small left',
							validateOnChange: true,
							paymentFormatter: 'formatCardCVC',
							validator: 'validateCardCVC'
						}
					]
				},
				{
					xtype: 'enrollment-set',
					label: 'Billing Address',
					inputs: [
						{type: 'text', name: 'address_line1', placeholder: 'Address', required: true, size: 'full'},
						{type: 'text', name: 'address_line2', placeholder: 'Address (optional)', size: 'full'},
						// {type: 'text', name: 'address_line3', hidden: true, placeholder: 'Address (optional)', size: 'full'},
						// {type: 'text', name: 'address_line4', hidden: true, placeholder: 'Address (optional)', size: 'full'},
						// {type: 'text', name: 'address_line5', hidden: true, placeholder: 'Address (optional)', size: 'full'},
						{type: 'text', name: 'address_city', placeholder: 'City / Town', size: 'large'},
						{type: 'text', name: 'address_state', placeholder: 'State / Province / Territory / Region', size: 'full'},
						{type: 'text', name: 'address_country', placeholder: 'Country', required: true, size: 'large left'},
						{type: 'text', name: 'address_zip', placeholder: 'ZIP / Postal Code', size: 'small left', required: false}
					]//,
					// help: [
					// 	{text: 'Add Address Line', type: 'event', event: 'add-address-line'}
					// ]
				},
				{
					xtype: 'enrollment-set',
					reveals: 'enable-submit',
					inputs: [
						{type: 'checkbox', name: 'affirm', doNotSend: true, doNotTrack: true, text: 'I have read an agree to the licensing terms.', correct: true}
					],
					help: [
						{text: 'Licensing Terms', type: 'event', event: 'viewLicense'}
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

		this.enableBubble(['show-msg', 'update-buttons']);

		this.submitBtnCfg = this.buttonCfg[0];

		this.updatePrice = Ext.Function.createBuffered(this.updatePrice, 1000);

		this.addListeners();

		this.on('viewLicense', 'showTerms');

		this.add(this.form);
	},


	getButtonCfg: function() {
		return this.buttonCfg;
	},


	buttonClick: function(action) {
		if (action === 'submit-payment') {
			this.maybeSubmit();
		}
	},


	showPrice: function() {

	},


	showTerms: function() {
		//TODO hardcoded link needs to go away preferably for a link like what we use for the welcome guide
		window.open(Service.getSupportLinks().termsOfService, '_blank');
	},


	updatePrice: function() {
		var me = this,
			value = this.getParsedValues(),
			pricingInfo = this.getPricingInfo(value);

		function onSuccess(result) {
			me.enrollmentOption.pricing = result;
			me.showPrice();
		}

		function onFailure(reason) {
			console.error('failed to price purchase');
		}

		this.fireEvent('price-enroll-purchase', this, pricingInfo, onSuccess, onFailure);
	},


	getPricingInfo: function(formValue) {
		var desc = {Purchasable: this.enrollmentOption.Purchasable},
			wantsCode = formValue.quantity === 'other',
			coupon = (formValue.coupon || '').trim(),
			count = (formValue.count || '').trim();

		if (wantsCode) {
			count = count ? parseInt(count, 10) : 1;
			desc.Quantity = count || 1;
		}

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
			this.showError({Messge: 'Invalid number of licenses'});
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
				me.fireEvent('show-msg', 'Please fill out all required information.', true, 5000);
				reject();
			}
		});
	},


	maybeSubmit: function() {
		var me = this,
			value = me.getParsedValues(),
			pricingInfo = me.getPricingInfo(value),
			data = {
				purchaseDescription: pricingInfo,
				cardInfo: value
			};

		me.shouldAllowSubmission()
			.then(me.complete.bind(me, me, data))
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
			.fail(function() {
				console.error('failed to create token', arguments);
			});
	}
});
