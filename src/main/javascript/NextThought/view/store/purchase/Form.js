/**
 * Created with JetBrains WebStorm.
 * User: cutz
 * Date: 4/16/13
 * Time: 4:11 PM
 * To change this template use File | Settings | File Templates.
 */
Ext.define('NextThought.view.store.purchase.Form', {
	extend: 'Ext.Component',
	alias: 'widget.purchase-form',

	mixins: {
		placeholderFix: 'NextThought.view.form.fields.PlaceholderPolyfill'
	},

	ui: 'purchase-form',

	ordinal: 1,
	showColumns: false,//for debugging in this view
	confirmLabel: 'Continue',
	checkboxAction: 'agreeToTerms',
	checkboxLabel: Ext.DomHelper.markup(['I have read and agree to the ', {tag: 'a', href: '#', target: '_blank', html: 'licensing terms.'}]),

	//To use some of stipes test cards we cant send address or cvc but those are required on our form.
	//Use this flag only for testing locally to make those fields not required.  I miss preprocessor statements...
	//ignoreClientSideValidation: true,

	renderTpl: Ext.DomHelper.markup({tag: 'form', autocomplete: 'on', cn: [
		{tag: 'fieldset', cn: [
			{tag: 'tpl', 'if': 'Activated', cn: [
				{tag: 'legend', html: 'You\'ve already purchased this item, but you can still buy licenses for others.'}
			]},
			{tag: 'tpl', 'if': '!Activated', cn: [
				{tag: 'legend', html: 'Who are you purchasing for?'}
			]},
			{tag: 'tpl', 'if': '!Activated', cn: {tag: 'label', cn: [
				{tag: 'input', type: 'radio', name: 'quantity', value: 'self'},
				{html: 'Me. I want to buy a license for my account.'}
			]}},
			{tag: 'label', cn: [
				{tag: 'input', type: 'radio', name: 'quantity', value: 'other'},
				{cn: [
					{tag: 'div', cn: ['I want to purchase ', {
						tag: 'a',
						cls: 'activation',
						href: '#',
						html: 'Activation Keys',
						cn: [
							{ cls: 'desc', html: 'An activation key is a key code that gives you access to purchased content.'}
						]
					}, ' to share with others.']},
					{tag: 'input', type: 'text', placeholder: '1', name: 'count',
						'data-width': '1/8', autocomplete: 'off', pattern: '\\d*',
						'data-formatter': 'restrictNumeric'},
					'License'
				]}
			]}
		]},
		{tag: 'fieldset', cls: 'smaller-margin', cn: [
			{tag: 'legend', html: 'Coupon'},
			{cn: [
				{tag: 'input', type: 'text', placeholder: 'Coupon', name: 'coupon', 'data-no-autovalidate': true}
			]}
		]},
		{tag: 'fieldset', cn: [
			{tag: 'legend', html: 'Payment Information'},
			{cn: [
				{tag: 'input', type: 'text', 'data-required': true, placeholder: 'Name on card', name: 'name'}
			]},
			{cn: [
				{tag: 'input', type: 'text', placeholder: '1234 - 1234 - 1234 - 1234', name: 'number',
					required: 'required', pattern: '\\d*', autocompletetype: 'cc-number',
					'data-required': true, 'data-width': '1/2',
					'data-validator': 'validateCardNumber', 'data-formatter': 'formatCardNumber', 'data-getter': 'getCardNumberVal' },
				{tag: 'input', type: 'text', placeholder: 'MM / YY', name: 'exp_',
					'data-required': true, 'data-width': '1/4', autocomplete: 'off',
					'data-validator': 'validateCardExpiry', 'data-getter': 'cardExpiryVal', 'data-formatter': 'formatCardExpiry',
					'data-cardfields': 'exp_month,exp_year', 'data-cardfields-separator': '/'},
				{tag: 'input', type: 'text', placeholder: 'Code', name: 'cvc',
					'data-required': true, 'data-width': '1/4', autocomplete: 'off', required: 'required', pattern: '\\d*',
					'data-validator': 'validateCardCVC', 'data-formatter': 'formatCardCVC'}
			]}
		]},
		{tag: 'fieldset', cn: [
			{tag: 'legend', html: 'Billing Address'},
			{cn: [
				{tag: 'input', type: 'text', 'data-required': true, placeholder: 'Address', name: 'address_line1'}
			]},
			{cn: [
				{tag: 'input', type: 'text', placeholder: 'Address', name: 'address_line2'}
			]},
			{cn: [
				{tag: 'input', type: 'text', placeholder: 'City / Town', name: 'address_city', 'data-width': '2/3'}
			]},
			{cn: [
				{tag: 'input', type: 'text', placeholder: 'State / Province / Territory / Region', name: 'address_state'}
			]},
			{cn: [
				{tag: 'input', type: 'text', 'data-required': true, 'data-width': '2/3',
					placeholder: 'Country', name: 'address_country'},
				{tag: 'input', type: 'text', placeholder: 'ZIP / Postal Code', name: 'address_zip',
					pattern: '\\d*', 'data-width': '1/3', 'data-formatter': 'restrictNumeric'}
			]}
		]}
	]}),


	renderSelectors: {
		couponEl: 'input[name=coupon]',
		quantityEl: 'input[name=count]',
		othersEl: 'input[name=quantity][value=other]',
		selfEl: 'input[name=quantity][value=self]'
	},


	initComponent: function () {
		this.callParent(arguments);
		if (!this.record && this.purchaseDescription) {
			this.record = this.purchaseDescription.Purchasable;
		}

		this.renderData = Ext.apply(this.renderData || {}, this.record.getData());
	},


	publishQuantityAndPrice: function (quantity, price, currency) {
		this.up('window').publishQuantityAndPrice(quantity, price, currency);
	},


	afterRender: function () {
		this.callParent(arguments);

		this.fixPlaceholders(this.getEl().query('input'));

		var inputs = this.getEl().select('input'),
			validator = Ext.bind(this.generateTokenData, this),
			bufferedValidator = Ext.Function.createBuffered(validator, 250),
			bufferedPricer = Ext.Function.createBuffered(this.pricePurchase, 1000, this),
			firstRadio = this.getEl().select('input[type=radio]').first();

		if (firstRadio) {
			firstRadio.set({checked: 'true'});
		}

		inputs.each(function (input) {
			var formatter = input.getAttribute('data-formatter'),
				jqd = jQuery(input.dom);
			if (formatter) {
				jqd.payment(formatter);
			}
			jqd.blur(validator).keypress(bufferedValidator).keyup(bufferedValidator);
			jqd.focus(function () {
				jqd.attr('data-focused', 'true');
			});
			jqd.keypress(function(){
				jqd.attr('data-visited',
					(jqd.attr('data-focused') && (jqd.val() || jqd.attr('data-visited'))) ? 'true' : undefined
				);
			});
		});

		this.getEl().select('input[name=quantity]').on('click', function (e) {
			var t = e.getTarget();
			if (t && Ext.fly(t).is('input')) {
				this.pricePurchase();
			}
			else {
				console.log('Ignoring target t', t);
			}
		}, this);
		this.getEl().select('input[name=count]').on('blur', this.pricePurchase, this);
		this.getEl().select('input[name=count]').on({
			keypress: bufferedPricer,
			keyup: bufferedPricer,
			scope: this
		});
		this.couponEl.on({
			keypress: bufferedPricer,
			keyup: bufferedPricer,
			scope: this
		});
		this.couponEl.on('blur', this.pricePurchase, this);

		this.enableSubmission(false);

		if (this.tokenObject && this.tokenObject.card) {
			this.fillFromToken(this.tokenObject.card);
			this.validateForm();
		}

		if (this.purchaseDescription) {
			this.fillFromDescription(this.purchaseDescription);
		}
	},


	fillFromDescription: function (desc) {
		this.couponEl.dom.value = desc.Coupon || '';
		if (desc.Quantity !== undefined) {
			this.othersEl.dom.checked = true;
			this.quantityEl.dom.value = desc.Quantity;
		}
		else {
			this.selfEl.dom.checked = true;
		}
		this.pricePurchase();
	},


	fillFromToken: function (card) {
		var inputs = this.getEl().select('input');
		inputs.each(function (input) {
			input = Ext.getDom(input);
			var fields = input.getAttribute('data-cardfields'),
				name = input.getAttribute('name'),
				val, formatter;

			if (fields) {
				fields = fields.split(',');
				val = Ext.Array.map(fields, function (f) {
					return card[f];
				});
				if (!Ext.Array.some(val, function (v) {
					return v === null || v === undefined;
				})) {
					val = val.join(input.getAttribute('data-cardfields-separator') || '');
				}
			}
			else if (name) {
				val = card[name];
			}

			if (val !== undefined && val !== null) {
				input.setAttribute('data-visited', 'true');
				input.value = val;
			}

		});
	},


	gatherPricingInfo: function () {
		var desc = {Purchasable: this.record},
			wantsCode = this.othersEl.dom.checked,
			coupon = (this.couponEl.dom.value || '').trim(),
			quantity = (this.quantityEl.dom.value || '').trim();

		if (wantsCode) {
			quantity = quantity ? parseInt(quantity, 10) : 1;
			desc.Quantity = quantity || 1;
		}

		if (coupon) {
			desc.Coupon = coupon;
		}

		return desc;
	},


	pricePurchase: function () {
		var desc = this.gatherPricingInfo(),
			sendingCoupon = Boolean(desc.Coupon);

		if (this.lastPricingDesc
			&& desc.Coupon === this.lastPricingDesc.Coupon
			&& desc.Quantity === this.lastPricingDesc.Quantity) {
			return;
		}


		function unmask() {
			var el = this.getEl();
			if (el) {
				el.unmask();
			}
		}

		function onSuccess(pricing) {
			unmask.call(this);

			this.couponEl.removeCls(['invalid', 'valid']);
			if (sendingCoupon) {
				this.couponEl.addCls(pricing.get('Coupon') ? 'valid' : 'invalid');
			}


			this.publishQuantityAndPrice(pricing.get('Quantity'), pricing.get('PurchasePrice'), pricing.get('Currency'));
		}

		function onFailure() {
			unmask.call(this);
			//What to actually do here, if we can't price we really can't let them purchase.
			//maybe let it go and up the final pricing before submission works, then if
			//that fails abort?
			console.error('Unable to price purchase', desc, arguments);
		}

		console.log('Pricing purchase info', desc);
		this.getEl().mask('Calculating price.');
		this.lastPricingDesc = desc;
		this.fireEvent('price-purchase', this, desc, onSuccess, onFailure, this);
	},


	enableSubmission: function (enabled) {
		var win = this.up('window');
		if (win) {
			win.setConfirmState(enabled);
		}
	},


	getCardNumberVal: function (input) {
		var val = input.value;

		return val.replace(/[^0-9]/g, '');
	},


	valueForInput: function (input) {
		var val = input.value,
			getter = input.getAttribute('data-getter');

		if (getter) {
			if (this[getter]) {
				val = this[getter](input);
			}
			else {
				val = jQuery(input).payment(getter);
			}
		}

		return val;
	},


	validateForRequired: function (input, val) {
		var required = input.getAttribute('data-required'),
			visited = input.getAttribute('data-visited');

		if (this.ignoreClientSideValidation) {
			console.warn('Ignoring client side validation this should only be used in specific test cases');
			return true;
		}

		if (required && !val) {
			if (visited) {
				Ext.fly(input).addCls('invalid');
				Ext.fly(input).removeCls('valid');
			}
			return false;
		}
		return true;
	},


	validateWithValidator: function (input, val) {
		var validator = input.getAttribute('data-validator'),
			visited = input.getAttribute('data-visited');

		if (this.ignoreClientSideValidation) {
			console.warn('Ignoring client side validation this should only be used in specific test cases');
			return true;
		}

		if (validator && !jQuery.payment[validator](val)) {
			if (visited) {
				Ext.fly(input).addCls('invalid');
				Ext.fly(input).removeCls('valid');
			}
			return false;
		}
		return true;
	},


	validateInput: function (input) {
		var val, visited = input.getAttribute('data-visited'),
			auto = input.getAttribute('data-no-autovalidate');
		input = Ext.getDom(input);

		val = this.valueForInput(input);

		if (auto) {
			return val;
		}

		if (!this.validateForRequired(input, val)) {
			return null;
		}

		if (!this.validateWithValidator(input, val)) {
			return null;
		}

		Ext.fly(input).removeCls('invalid');
		Ext.fly(input)[(visited && !Ext.isEmpty(val)) ?'addCls':'removeCls']('valid');

		return val;
	},


	collectVal: function (data, input, val) {
		if (Ext.isObject(val)) {
			Ext.Object.each(val, function (k, v) {
				data[input.getAttribute('name') + k] = v;
			});
		}
		else if (!Ext.isEmpty(val)) {
			data[input.getAttribute('name')] = val;
		}
	},


	generateTokenData: function () {
		var inputs = this.getEl().select('input'),
			data = {}, failed = false;
		inputs.each(function (input) {
			//First we validate
			var val = this.validateInput(input);
			if (val === null) {
				failed = true;
				return true; //continue
			}

			//If that passed we collect
			this.collectVal(data, input, val);

		}, this);

		failed = !this.agreed || failed;

		this.enableSubmission(!failed);

		return failed ? undefined : data;
	},


	onCheckboxLinkClicked: function () {
		//TODO hardcoded link needs to go away preferably for a link like what we use for the welcome guide
		window.open('https://docs.google.com/document/pub?id=1rM40we-bbPNvq8xivEKhkoLE7wmIETmO4kerCYmtISM&embedded=true', '_blank');
	},


	setAgreementState: function (state) {
		this.agreed = state;
		this.validateForm();
	},


	onConfirm: function () {
		var data = this.generateTokenData();
		if (data) {
			this.fireEvent('create-payment-token', this, this.gatherPricingInfo(), data);
		}
	},


	handleError: function (errorModel) {
		console.log('Form needs to handle error', errorModel);
		var el = this.getEl(),
			msg = (errorModel.get && errorModel.get('Message')) || 'An unknown error occurred.',
			p = (errorModel.get && errorModel.get('Param')) || '',
			field = el.down('input[name="' + p + '"]') || el.down('input[name^=' + (p.split('_')[0]) + ']');

		if (field) {
			field.addCls('invalid');
		}

		this.up('window').showError(msg);
	}
}, function () {
	//Alias a poorly named function to make it a bit more readible.  Refactor this..
	this.prototype.validateForm = this.prototype.generateTokenData;
});
