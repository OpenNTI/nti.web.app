const Ext = require('@nti/extjs');
const {CreditCard} = require('@nti/web-payments');

require('legacy/overrides/ReactHarness');
require('./BaseInput');

module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.parts.CreditCard', {
	extend: 'NextThought.app.course.enrollment.components.parts.BaseInput',
	alias: 'widget.enrollment-credit-card',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'credit-card-container nti-web-credit-card-override {size}'}
	]),


	renderSelectors: {
		containerEl: '.credit-card-container'
	},


	afterRender () {
		this.callParent(arguments);

		const parent = this.up('[getEnrollmentOption]');
		const enrollmentOption = parent.getEnrollmentOption();
		const purchasable = enrollmentOption.Purchasable;

		purchasable.getInterfaceInstance()
			.then((model) => {
				this.creditCardForm = Ext.widget({
					xtype: 'react',
					renderTo: this.containerEl,
					component: CreditCard,
					purchasable: model,
					onChange: (info) => this.onCreditCardChange(info)
				});
			});
	},


	isEmpty () {
		return !this.cardInfo || this.cardInfo.empty;
	},


	isValid () {
		if (this.required && this.isEmpty()) {
			this.addEmptyErrors();
			return false;
		}

		return this.cardInfo && this.cardInfo.isValid;
	},


	setValue () {},


	getValue (force) {
		const value = {};

		if (this.isEmpty() && !force) {
			return value;
		}

		value[this.name] = this.cardInfo;
		return value;
	},


	onCreditCardChange (cardInfo) {
		this.cardInfo = cardInfo;

		this.removeEmptyErrors();
		this.changed();
	},


	addEmptyErrors () {
		if (!this.cardInfo) {
			this.addCls('missing-all');
			return;
		}

		const {empty} = this.cardInfo;

		if (empty.name) { this.addCls('missing-name'); }
		if (empty.number) { this.addCls('missing-number'); }
		if (empty.expiry) { this.addCls('missing-expiry'); }
		if (empty.cvc) { this.addCls('missing-cvc'); }
	},


	removeEmptyErrors () {
		this.removeCls('missing-all');
		this.removeCls('missing-name');
		this.removeCls('missing-number');
		this.removeCls('missing-expiry');
		this.removeCls('missing-cvc');
	}
});
