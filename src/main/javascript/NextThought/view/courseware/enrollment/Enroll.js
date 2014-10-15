Ext.define('NextThought.view.courseware.enrollment.Enroll', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-enroll',

	cls: 'enroll-for-credit-confirmation',

	requires: [
		'NextThought.view.courseware.enrollment.parts.DetailsTable'
	],

	buttonCfg: [
		{name: 'Continue to Payment', action: 'goto-payment'}
	],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'message', cn: [
			{cls: 'main {headerCls}', html: '{header}'},
			{cls: 'text description', html: '{text}'},
			{cls: 'text available', html: '{available}'},
			{cls: 'confirm', html: '{confirm}'}
		]},
		{cls: 'details'}
	]),


	renderSelectors: {
		enrollEl: '.enroll-now',
		titleEl: '.main',
		descriptionEl: '.description',
		confirmEl: '.confirm',
		availableEl: '.available',
		detailsEl: '.details'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.enableBubble('show-msg');
	},


	beforeRender: function() {
		this.callParent(arguments);

		var c = this.course;

		this.renderData = Ext.apply(this.renderData || {}, {
			headerCls: this.paymentfail ? 'error' : '',
			header: this.paymentfail ?
				'There were some troubles with your payment.' :
				'Your application has been accepted!',
			text: this.paymentfail ?
				'Please try again, you will gain access to the content once the payment is successful.' :
				'Thank you for applying to earn credit online from the University of Oklahoma.',
			available: 'Your admission credit is available for ' + c.getSemester() + '.',
			confirm: 'Please take a moment to confirm your course selection before checking out.'
		});
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


	getButtonCfg: function() {
		return this.buttonCfg;
	},


	buttonClick: function(action) {
		if (action === 'goto-payment') {
			this.maybeSubmit();
		}
	},


	stopClose: function() {
		var me = this;

		return new Promise(function(fulfill, reject) {
			Ext.Msg.show({
				msg: 'You have not finished enrolling in this course yet.',
				buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
				scope: this,
				icon: 'warning-red',
				buttonText: {
					'ok': 'caution:Leave',
					'cancel': 'Stay'
				},
				title: 'Are you sure?',
				fn: function(str) {
					if (str === 'ok') {
						fulfill();
					} else {
						reject();
					}
				}
			});
		});
	},


	showErrorMsg: function(json) {
		if (json && json.Message) {
			this.fireEvent('show-msg', json.Message, true, 5000);
		} else {
			this.fireEvent('show-msg', 'An unknown error occurred. Please try again later.', true, 5000);
		}
	},


	showError: function(json) {
		json = json || {};
		json.title = 'There were some troubles with your payment.';
		json.Message = json.Message || 'Please try again, you will gain access to the content once the payment is successful.';
		json.ContactInformation = json.ContactInformation || 'Please contact the <a href=\'mailto:support@nextthought.com\'>help desk</a> for further information.';

		this.titleEl.update(json.title);
		this.titleEl.addCls('error');
		this.availableEl.update('');
		this.descriptionEl.update(json.Message);
		this.confirmEl.update(json.ContactInformation);
	},


	maybeSubmit: function() {
		var me = this,
			minTime = wait(5000);

		me.addMask('Finalizing your enrollment. You will be redirected to a secure external payment site to complete this transaction', 'navigation');

		this.complete()
			.then(function(response) {
				var json = Ext.JSON.decode(response, true);

				if (json.href) {
					minTime.then(function() {
						window.location.href = json.href;
					});
				} else {
					console.error('No href to redirect to...', response);
					me.showErrorMsg();

					minTime.then(function() {
						me.error(me);
						me.removeMask();
					});
				}
			})
			.fail(function(response) {
				var json = Ext.JSON.decode(response, true);

				console.error('Enroll and pay failed', response);

				me.showErrorMsg(json);

				me.showError(json);

				minTime.then(function() {
					me.error(me);
					me.removeMask();
				});
			});
	}
});
