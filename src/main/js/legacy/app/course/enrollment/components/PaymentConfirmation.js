var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.PaymentConfirmation', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-paymentconfirmation',

	cls: 'payment-verification',

	buttonCfg: [
		{name: getString('NextThought.view.courseware.enrollment.PaymentConfirmation.SubmitPayment'), action: 'submit-payment'},
		{name: getString('NextThought.view.courseware.enrollment.PaymentConfirmation.Cancel'), action: 'go-back', secondary: true}
	],

	renderTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'info', cn: [
			{cls: 'title', html: '{{{NextThought.view.courseware.enrollment.PaymentConfirmation.ReviewPay}}}'},
			{cls: 'description', html: '{{{NextThought.view.courseware.enrollment.PaymentConfirmation.PleaseReview}}}'},
			{cls: 'warning', html: '{{{NextThought.view.courseware.enrollment.PaymentConfirmation.SaleFinal}}}'}
		]},
		{cls: 'gift-info', cn: [
			{cls: 'title', cn: [
				{tag: 'span', html: '{{{NextThought.view.courseware.enrollment.PaymentConfirmation.GiftInfo}}}'},
				{cls: 'edit', html: '{{{NextThought.view.courseware.enrollment.PaymentConfirmation.Edit}}}'}
			]},
			{cls: 'from info', cn: [
				{tag: 'span', cls: 'label', html: '{{{NextThought.view.courseware.enrollment.PaymentConfirmation.GiftFrom}}}'},
				{tag: 'span', cls: 'name'}
			]},
			{cls: 'to info', cn: [
				{tag: 'span', cls: 'label', html: '{{{NextThought.view.courseware.enrollment.PaymentConfirmation.GiftTo}}}'},
				{tag: 'span', cls: 'to-email'}
			]},
			{cls: 'message info', cn: [
				{tag: 'span', cls: 'label', html: '{{{NextThought.view.courseware.enrollment.PaymentConfirmation.GiftMessage}}}'},
				{tag: 'span', cls: 'message-text'}
			]}
		]},
		{cls: 'payment-info', cn: [
			{cls: 'title', cn: [
				{tag: 'span', html: '{{{NextThought.view.courseware.enrollment.PaymentConfirmation.PayInfo}}}'},
				{cls: 'edit', html: '{{{NextThought.view.courseware.enrollment.PaymentConfirmation.Edit}}}'}
			]},
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
			{cls: 'title', cn: [
				{tag: 'span', html: '{{{NextThought.view.courseware.enrollment.PaymentConfirmation.BillAddress}}}'},
				{cls: 'edit', html: '{{{NextThought.view.courseware.enrollment.PaymentConfirmation.Edit}}}'}
			]},
			{cls: 'street line1 info'},
			{cls: 'street line2 info'},
			{cls: 'city-info info', cn: [
				{tag: 'span', cls: 'city'},
				{tag: 'span', cls: 'state'},
				{tag: 'span', cls: 'zip'}
			]},
			{cls: 'country info'}
		]},
		{cls: 'subscribe-container', cn: [
			{cls: 'subscribe', cn: [
				{tag: 'input', id: '{id}-subscribe-check', type: 'checkbox', name: 'subscribe'},
				{tag: 'label', cls: '{cls}', 'for': '{id}-subscribe-check', html: ''}
			]},
			{cls: 'legal'}
		]}
	])),


	renderSelectors: {
		descriptionEl: '.description',
		nameEl: '.payment-info .name',
		cardTypeEl: '.payment-info .card .type',
		cardNumberEl: '.payment-info .card .last-four',
		expirationEl: '.payment-info .expiration .date',
		streetOneEl: '.billing-info .street.line1',
		streetTwoEl: '.billing-info .street.line2',
		cityEl: '.billing-info .city',
		stateEl: '.billing-info .state',
		zipEl: '.billing-info .zip',
		countryEl: '.billing-info .country',
		subscribeContainerEl: '.subscribe-container',
		subscribeEl: '.subscribe input[name=subscribe]',
		subscribeLabelEl: '.subscribe label',
		subscribeLegalEl: '.subscribe-container .legal',
		giftEl: '.gift-info',
		giftFromEl: '.gift-info .from',
		giftToEl: '.gift-info .to',
		giftMessageEl: '.gift-info .message'
	},


	initComponent: function () {
		this.callParent(arguments);
		this.enableBubble(['show-msg', 'update-buttons', 'close-msg', 'submit-enroll-purchase', 'enrollment-enrolled-complete', 'submit-gift-purchase']);
		this.submitButton = this.buttonCfg[0];
	},


	getButtonCfg: function () {
		return this.buttonCfg;
	},


	buttonClick: function (action) {
		if (action === 'submit-payment') {
			this.maybeSubmit();
		}
	},


	beforeShow: function () {
		var token = this.enrollmentOption.tokenObject,
			purchaseDesc = this.enrollmentOption.purchaseDescription,
			card = token && token.card;

		if (!card || !this.rendered) { return; }


		this.submitButton.disabled = false;
		this.fireEvent('update-buttons');

		if (this.enrollmentOption.AllowVendorUpdates && false) {
			this.subscribeLabelEl.update(getString('SubscribeToVendor') || 'Subscribe to updates.');
			this.subscribeLegalEl.update(getString('SubscribeToVendorLegal'));
			this.subscribeContainerEl.show();
		} else {
			this.subscribeContainerEl.hide();
		}

		if (purchaseDesc.from) {
			this.giftEl.show();

			if (purchaseDesc.sender) {
				this.giftFromEl.down('.name').update(purchaseDesc.sender + ' (' + purchaseDesc.from + ')');
			} else {
				this.giftFromEl.down('.name').update(purchaseDesc.from);
			}
		} else {
			this.giftEl.hide();
		}

		if (purchaseDesc.receiver) {
			this.giftToEl.show();

			if (purchaseDesc.to) {
				this.giftToEl.down('.to-email').update(purchaseDesc.to + ' (' + purchaseDesc.receiver + ')');
			} else {
				this.giftToEl.down('.to-email').update(purchaseDesc.receiver);
			}
		} else {
			this.giftToEl.hide();
		}

		if (purchaseDesc.message) {
			this.giftMessageEl.show();
			this.giftMessageEl.down('.message-text').update(purchaseDesc.message);
		} else {
			this.giftMessageEl.hide();
		}

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


	afterRender: function () {
		this.callParent(arguments);

		var me = this;

		me.mon(me.el, 'click', function (e) {
			if (e.getTarget('.edit')) {
				me.fireEvent('close-msg');
				me.error(me);
			}
		});

		me.giftEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		me.giftToEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		me.giftMessageEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
	},


	stopClose: function () {
		var r, me = this;

		if (me.hasMask()) {
			r = Promise.reject();
		} else {
			r = new Promise(function (fulfill, reject) {
				Ext.Msg.show({
					title: getString('NextThought.view.courseware.enrollment.PaymentConfirmation.PayNotSubmitted'),
					msg: getString('NextThought.view.courseware.enrollment.PaymentConfirmation.ProgressLost'),
					icon: 'warning-red',
					buttons: {
						primary: {
							text: getString('NextThought.view.courseware.enrollment.PaymentConfirmation.StayFinish'),
							handler: reject
						},
						secondary: {
							text: getString('NextThought.view.courseware.enrollment.PaymentConfirmation.LeavePage'),
							handler: function () {
								fulfill();
							}
						}
					}
				});
			});
		}

		return r;
	},


	showError: function (json) {
		if (json && (json.Message || json.message)) {
			this.fireEvent('show-msg', json.Message || json.message, true);
		} else {
			this.fireEvent('show-msg', getString('NextThought.view.courseware.enrollment.PaymentConfirmation.UnknownError'), true);
		}
	},


	parsePurchaseAttempt: function (attempt) {
		var error = attempt.get('Error');

		return {
			Message: (error && error.get('Message')) || getString('NextThought.view.courseware.enrollment.PaymentConfirmation.UnknownError')
		};
	},


	showStripeError: function (json) {
		var error = {},
			purchaseAttempt = json && json.purchaseAttempt;

		if (purchaseAttempt && purchaseAttempt.isModel) {
			error = this.parsePurchaseAttempt(purchaseAttempt);
		} else if (json) {
			if (json.type && json.type === 'card_error') {
				error.field = json.param;
				error.Message = json.message;
			} else if (json.Type && json.Type === 'PricingError') {
				error.field = 'coupon';
				error.Message = json.Message;
			} else {
				error.Message = getString('NextThought.view.courseware.enrollment.PaymentConfirmation.UnknownError');
			}
		} else {
			error.Message = getString('NextThought.view.courseware.enrollment.PaymentConfirmation.UnknownError');
		}

		this.showError(error);
	},


	maybeSubmit: function () {
		var me = this,
			data = {
				purchaseDescription: me.enrollmentOption.purchaseDescription,
				tokenObject: me.enrollmentOption.tokenObject,
				pricingInfo: me.enrollmentOption.pricing
			};

		data.purchaseDescription.subscribe = this.subscribeEl && this.subscribeEl.isVisible() && this.subscribeEl.dom.checked;

		me.submitButton.disabled = true;
		me.fireEvent('update-buttons');
		me.addMask(getString('NextThought.view.courseware.enrollment.PaymentConfirmation.SubPaymentTime'));

		me.complete(me, data)
			.then(function (result) {
				console.log('Payment successful', arguments);
				me.enrollmentOption.purchaseAttempt = result.purchaseAttempt;
				me.removeMask();
				me.clearProcessStorage();
				me.done(me);
			})
			.catch(function (reason) {
				me.submitButton.disabled = false;
				me.fireEvent('update-buttons');
				me.showStripeError(reason);
				me.removeMask();
				me.error(me);
				console.error('Payment failed', arguments);
			});
	}
});
