Ext.define('NextThought.view.courseware.enrollment.PaymentConfirmation', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-paymentconfirmation',

	cls: 'payment-verification',

	buttonCfg: [
		{name: 'Submit Payment', action: 'submit-payment'}
	],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'info', cn: [
			{cls: 'title', html: 'Review and Pay'},
			{cls: 'description', html: 'Please take a moment to review your order and then submit payment.'}
		]},
		{cls: 'payment-info', cn: [
			{cls: 'edit', html: 'edit'},
			{cls: 'title', html: 'Payment Information'},
			{cls: 'name info'},
			{cls: 'card info', cn: [
				{tag: 'span', cls: 'type label'},
				{tag: 'span', cls: 'last-four'}
			]},
			{cls: 'expiration info', cn: [
				{tag: 'span', cls: 'label', html: 'Expires'},
				{tag: 'span', cls: 'date', html: ''}
			]}
		]},
		{cls: 'billing-info', cn: [
			{cls: 'edit', html: 'edit'},
			{cls: 'title', html: 'Billing Address'},
			{cls: 'street line1 info'},
			{cls: 'street line2 info'},
			{cls: 'city-info info', cn: [
				{tag: 'span', cls: 'city'},
				{tag: 'span', cls: 'state'},
				{tag: 'span', cls: 'zip'}
			]},
			{cls: 'country info'}
		]}
	]),


	renderSelectors: {
		nameEl: '.payment-info .name',
		cardTypeEl: '.payment-info .card .type',
		cardNumberEl: '.payment-info .card .last-four',
		expirationEl: '.payment-info .expiration .date',
		streetOneEl: '.billing-info .street.line1',
		streetTwoEl: '.billing-info .street.line2',
		cityEl: '.billing-info .city',
		stateEl: '.billing-info .state',
		zipEl: '.billing-info .zip',
		countryEl: '.billing-info .country'
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

		if (card.brand) {
			this.cardTypeEl.update(card.brand);
		}

		if (card.last4) {
			this.cardNumberEl.update(card.last4);
		}

		if (card.name) {
			this.nameEl.update(card.name);
		}

		if (card.exp_month) {
			this.expirationEl.update(card.exp_month + '/' + card.exp_year);
		}

		if (card.address_line1) {
			this.streetOneEl.update(card.address_line1);
		}

		if (card.address_line2) {
			this.streetTwoEl.update(card.address_line2);
		}

		if (card.address_city) {
			this.cityEl.update(card.address_city + ',');
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

		var me = this,
			container = this.el.up('.enrollment-container');

		me.mon(me.el, 'click', function(e) {
			if (e.getTarget('.edit')) {
				me.error(me);
			}
		});

		if (me.pricingInfo) {
			me.pricingInfo.show();
		} else {
			me.pricingInfo = Ext.widget('enrollment-pricing', {
				course: this.course,
				renderTo: container,
				scrollTarget: container,
				enrollmentOption: this.enrollmentOption
			});

			me.on('destroy', 'destroy', me.pricingInfo);
		}
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
