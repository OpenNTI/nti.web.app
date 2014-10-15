Ext.define('NextThought.view.courseware.enrollment.PaymentConfirmation', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-paymentconfirmation',

	cls: 'enroll-for-credit-confirmation',

	buttonCfg: [
		{name: 'Submit Payment', action: 'submit-payment'}
	],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'details'},
		{cls: 'payment-details', cn: [
			{cls: 'edit', html: 'Edit'},
			{cls: 'header', html: 'Payment Details'},
			{cls: 'card-information', cn: [
				{cls: 'card'},
				{cls: 'name'},
				{cls: 'expiry'}
			]},
			{cls: 'billing-information', cn: [
				{cls: 'address-line1 address-line'},
				{cls: 'address-line2 address-line'},
				{cls: 'city'},
				{cls: 'state'},
				{cls: 'country'},
				{cls: 'zip'}
			]}
		]}
	]),

	renderSelectors: {
		detailsEl: '.details',
		editEl: '.edit',
		cardNumEl: '.card-information .card',
		cardNameEl: '.card-information .name',
		cardExpEl: '.card-information .expiry',
		cardCodeEl: '.card-information .cvc',
		lineOneEl: '.billing-information .address-line1',
		lineTwoEl: '.billing-information .address-line2',
		cityEl: '.billing-information .city',
		stateEl: '.billing-information .state',
		countryEl: '.billing-information .country',
		zipEl: '.billing-information .zip'
	},


	initComponent: function() {
		this.callParent(arguments);
		this.enableBubble(['show-msg', 'update-buttons']);
	},


	getButtonCfg: function() {
		return this.buttonCfg;
	},


	buttonClick: function(action) {
		if (action === 'submit-payment') {
			this.maybeSubmit();
		}
	},


	beforeShow: function() {
		var token = this.enrollmentOption.tokenObject,
			card = token && token.card;

		if (!card || !this.rendered) { return; }

		if (card.last4) {
			this.cardNumEl.update(card.last4);
		}

		if (card.name) {
			this.cardNameEl.update(card.name);
		}

		if (card.exp_month) {
			this.cardExpEl.update(card.exp_month + ' / ' + card.exp_year);
		}

		if (card.address_line1) {
			this.lineOneEl.update(card.address_line1);
		}

		if (card.address_line2) {
			this.lineTwoEl.update(card.address_line2);
		}

		if (card.address_city) {
			this.cityEl.update(card.address_city);
		}

		if (card.address_state) {
			this.stateEl.update(card.address_state);
		}

		if (card.address_country) {
			this.countryEl.update(card.address_country);
		}

		if (card.address_zip) {
			this.zipEl.update(card.address_zip);
		}
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.detailsTable = Ext.widget('enrollment-details-table', {
			course: me.course,
			enrollmentOption: me.enrollmentOption,
			renderTo: me.detailsEl
		});

		me.on('destroy', 'destroy', me.detailsTable);

		me.mon(me.el, 'click', function(e) {
			if (e.getTarget('.edit')) {
				me.error(me);
			}
		});
	},


	showError: function(json) {
		if (json && (json.Message || json.message)) {
			this.fireEvent('show-error', json.Message || json.message, true, 5000);
		} else {
			this.fireEvent('show-error', 'An unknown error occurred. Please try again later.', true, 5000);
		}
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
			} else {
				error.Message = 'An unknown error occurred. Please try again later.';
			}
		} else {
			error.Message = 'An unknown error occurred. Please try again later.';
		}

		this.showError(error);
	},


	maybeSubmit: function() {
		var me = this,
			data = {
				purchaseDescription: me.enrollmentOption.purchaseDescription,
				tokenObject: me.enrollmentOption.tokenObject,
				pricingInfo: me.enrollmentOption.pricing
			};

		me.addMask('Submitting payment. This may take a few moments.');

		me.complete(me, data)
			.then(function() {
				console.log('Payment successful', arguments);
				me.done(me);
			})
			.fail(function(reason) {
				me.showStripeError(reason);
				console.error('Payment failed', arguments);
			});
	}
});
