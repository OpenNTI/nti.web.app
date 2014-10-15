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
			{cls: 'header', html: 'Payment Details'}
		]}
	]),


	renderSelectors: {
		detailsEl: '.details'
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

	},


	afterRender: function() {
		this.callParent(arguments);

		this.detailsTable = Ext.widget('enrollment-details-table', {
			course: this.course,
			enrollmentOption: this.enrollmentOption,
			renderTo: this.detailsEl
		});

		this.on('destroy', 'destroy', this.detailsTable);
	},


	maybeSubmit: function() {
		var data = {
			purchaseDescription: this.enrollmentOption.purchaseDescription,
			tokenObject: this.enrollmentOption.tokenObject,
			pricingInfo: this.enrollmentOption.pricing
		};

		this.complete(this, data)
			.then(function() {
				console.log('Payment successful', arguments);
			})
			.fail(function() {
				console.error('Payment failed', arguments);
			});
	}
});
