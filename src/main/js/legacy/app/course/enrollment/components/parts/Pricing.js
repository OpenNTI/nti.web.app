const Ext = require('@nti/extjs');

const {getString} = require('legacy/util/Localization');
const StoreActions = require('legacy/app/store/Actions');

require('legacy/common/form/fields/SimpleTextField');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.parts.Pricing', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-pricing',
	baseTop: 50,
	cls: 'enrollment-pricing',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'info', style: {backgroundImage: 'url({icon})'}, cn: [
			{cls: 'meta', cn: [
				{cls: 'number', html: '{number}'},
				{cls: 'title', html: '{title}'},
				{cls: 'author', html: 'By {author}'}
			]}
		]},
		{cls: 'details', cn: [
			{cls: 'detail type', cn: [
				{tag: 'span', cls: 'label', html: 'Enrollment Type'},
				{tag: 'span', html: '{enrollmentType}'}
			]},
			{cls: 'detail', cn: [
				{tag: 'span', cls: 'label', html: 'Credit Hours:'},
				{tag: 'span', html: '{credit}'}
			]},
			{cls: 'detail', cn: [
				{tag: 'span', cls: 'label', html: 'Begins:'},
				{tag: 'span', html: '{begins}'}
			]},
			{cls: 'detail', cn: [
				{tag: 'span', cls: 'label', html: 'Ends:'},
				{tag: 'span', html: '{ends}'}
			]},
			{tag: 'tpl', 'if': 'refunds', cn: [
				{cls: 'detail', cn: [
					{tag: 'span', cls: 'label', html: 'Refunds:'},
					{tag: 'span', cls: 'refund', html: '{refunds}'}
				]}
			]},
			{tag: 'tpl', 'if': 'coupons', cn: [
				{cls: 'detail coupon', cn: [
					{tag: 'span', cls: 'label', html: 'I have a coupon'},
					{cls: 'coupon-value'},
					{cls: 'coupon-container'}
				]}
			]},
			{cls: 'detail price', cn: [
				{tag: 'span', cls: 'label', html: 'Total'},
				{tag: 'span', cls: 'old-amount', html: ''},
				{tag: 'span', cls: 'amount', html: '{price}'}
			]}
		]}
	]),

	renderSelectors: {
		// priceEl: '.amount',
		priceEl: '.price',
		couponLabelEl: '.coupon .label',
		couponContainerEl: '.coupon-container',
		couponValueEl: '.coupon-value',
		oldAmountEl: '.price .old-amount',
		amountEl: '.price .amount'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.enableBubble(['show-msg']);

		this.StoreActions = StoreActions.create();

		this.update = Ext.Function.createBuffered(this.update.bind(this), 2000);
	},

	beforeRender: function () {
		this.callParent(arguments);

		var course = this.course, hours,
			credit = this.course.get('Credit'),
			begins = this.course.get('StartDate'),
			ends = this.course.get('EndDate'),
			format = 'F j, Y',
			refunds;

		credit = credit && credit[0];

		hours = credit && credit.get('Hours');

		if (this.enrollmentOption.noRefunds) {
			refunds = 'Not Refundable';
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			icon: this.courseIcon || course.get('icon'),
			number: course.get('ProviderUniqueID'),
			title: course.get('title'),
			author: course.getAuthorLine(),
			enrollmentType: this.enrollmentOption.display || getString(this.enrollmentOption.displayKey),
			credit: hours && this.enrollmentOption.hasCredit ? Ext.util.Format.plural(hours, 'Credit Hour') : 'No College Credit',
			begins: Ext.Date.format(begins, format),
			ends: Ext.Date.format(ends, format),
			coupons: !!this.enrollmentOption.Purchasable && !this.hidePrice,
			price: '$' + this.getPrice(),
			refunds: refunds
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		this.el.setTop(this.baseTop);

		if (this.hidePrice) {
			this.priceEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
			this.priceEl.hide();
		}

		if (!this.scrollTarget) {
			console.error('No scroll target for pricing info');
		} else {
			this.mon(this.scrollTarget, 'scroll', 'onContainerScroll');
		}

		if (this.couponContainerEl) {
			this.couponContainerEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
			this.couponInput = Ext.widget('simpletext', {
				inputType: 'text',
				placeholder: 'Coupon Code',
				renderTo: this.couponContainerEl
			});

			this.on('destroy', 'destroy', this.couponInput);

			this.mon(this.couponInput, {
				'changed': this.couponChanged.bind(this),
				'clear': this.couponChanged.bind(this, '')
			});
		}

		Ext.EventManager.onWindowResize(this.onContainerScroll.bind(this));
	},

	removePricingInfo: function () {
		delete this.enrollmentOption.pricing;
	},

	onContainerScroll: function () {
		if (!this.scrollTarget || !this.scrollTarget.dom) {
			return;
		}

		var containerTop = this.scrollTarget.getScrollTop(),
			containerHeight = this.scrollTarget.getHeight(),
			myHeight = this.getHeight(),
			difference = containerHeight - (myHeight + 15);

		if (difference > 0) {
			this.removeCls('stick_bottom');
			this.el.setTop(this.baseTop);
			return;
		}

		if (containerTop > Math.abs(difference) + 15) {
			this.addCls('stick_bottom');
		} else {
			this.removeCls('stick_bottom');
			this.el.setTop(this.baseTop - containerTop);
		}

	},

	getPrice: function (pricing) {
		pricing = pricing || this.enrollmentOption.pricing;

		var price;

		if (!pricing) {
			price = this.enrollmentOption.Price;
		} else {
			price = pricing.get('PurchasePrice') || pricing.get('Amount');
		}

		return (price || 0).toFixed(2);
	},

	couponChanged: function (coupon) {
		this.lockProcess();

		this.couponLabelEl.update('Checking Coupon');
		this.couponLabelEl.removeCls(['invalid', 'success']);
		this.couponLabelEl.addCls('loading');

		this.update(coupon);
	},

	updatePricing: function (pricing) {
		pricing = pricing || this.enrollmentOption.pricing;

		var oldPrice = this.enrollmentOption.Price || 0,
			newPrice = this.getPrice(pricing);

		oldPrice = oldPrice.toFixed(2);

		if (pricing) {
			this.oldAmountEl.update('$' + oldPrice);
		} else {
			this.oldAmountEl.update('');
		}

		this.amountEl.update('$' + newPrice);
	},

	update: function (coupon) {
		var me = this,
			desc = { Purchasable: me.enrollmentOption.Purchasable };

		if (coupon) {
			desc.Coupon = coupon.trim();
		}

		this.lockProcess();

		function onSuccess (result) {
			me.enrollmentOption.pricing = result;

			const couponDetails = result && result.get('Coupon');
			let discount = '';

			if (couponDetails.PercentOff) {
				discount = couponDetails.PercentOff + '% off';
			} else if (couponDetails.AmountOff) {
				discount = '$' + (couponDetails.AmountOff / 100).toFixed(2) + ' off';
			}

			me.couponLabelEl.update('Coupon Accepted: ' + discount);
			me.couponLabelEl.removeCls(['loading', 'invalid']);
			me.couponLabelEl.addCls('success');
			me.unlockProcess();

			me.updatePricing(result);
		}

		function onFailure (reason) {
			//unset any other pricing
			me.enrollmentOption.pricing = null;

			me.couponLabelEl.removeCls('loading');

			if (!coupon) {
				me.couponLabelEl.update('I have a coupon');
				me.couponLabelEl.removeCls(['invalid', 'success']);
			} else {
				me.couponLabelEl.update('Invalid Coupon');
				me.couponLabelEl.removeCls('success');
				me.couponLabelEl.addCls('invalid');
			}

			me.unlockProcess();
			me.updatePricing();
		}

		if (!coupon) {
			onFailure();
		} else {
			this.StoreActions.priceEnrollmentPurchase(this, desc, onSuccess, onFailure);
		}
	},

	getCoupon: function () {
		var pricing = this.enrollmentOption.pricing,
			coupon = pricing && pricing.get('Coupon'),
			id = coupon && coupon.ID;

		return id || '';
	},

	lockCoupon: function () {
		//if we don't have a coupon container we aren't allowing copupons
		if (!this.couponContainerEl) { return; }

		var pricing = this.enrollmentOption.pricing,
			coupon = pricing && pricing.get('Coupon'),
			id = coupon && coupon.ID;

		this.couponLabelEl.update('coupon');

		this.couponContainerEl.hide();
		this.couponLabelEl.show();

		if (id) {
			this.couponValueEl.update(id);
		} else {
			this.couponValueEl.update('No Coupon');
		}

	},

	unlockCoupon: function () {
		//if we don't have a coupon container we aren't allowing coupons
		if (!this.couponContainerEl) { return; }

		var pricing = this.enrollmentOption.pricing,
			coupon = pricing && pricing.get('Coupon'),
			id = coupon && coupon.ID;

		this.couponValueEl.hide();
		this.couponContainerEl.show();

		if (id) {
			this.couponInput.setValue(id);
		}
	}
});
