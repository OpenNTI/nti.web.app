var Ext = require('extjs');
var PartsDetailsTable = require('./parts/DetailsTable');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.components.Enroll', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-enroll',
	cls: 'enroll-for-credit-confirmation',

	buttonCfg: [
		{name: getString('NextThought.view.courseware.enrollment.Enroll.ConttoPay'), action: 'goto-payment'}
	],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'message', cn: [
			{cls: 'main {headerCls}', html: '{header}'},
			{cls: 'text description', html: '{text}'},
			{cls: 'text available', html: '{available}'},
			{cls: 'confirm', html: '{confirm}'}
		]},
		{cls: 'details'},
		{cls: 'subscribe-container', cn: [
			{cls: 'subscribe', cn: [
				{tag: 'input', id: '{id}-subscribe-check', type: 'checkbox', name: 'subscribe'},
				{tag: 'label', cls: '{cls}', 'for': '{id}-subscribe-check', html: ''}
			]},
			{cls: 'legal'}
		]}
	]),

	renderSelectors: {
		enrollEl: '.enroll-now',
		titleEl: '.main',
		descriptionEl: '.description',
		confirmEl: '.confirm',
		availableEl: '.available',
		detailsEl: '.details',
		subscribeContainerEl: '.subscribe-container',
		subscribeEl: '.subscribe input[name=subscribe]',
		subscribeLabelEl: '.subscribe label',
		subscribeLegalEl: '.subscribe-container .legal'
	},

	initComponent: function () {
		this.callParent(arguments);

		this.enableBubble('show-msg');
	},

	beforeRender: function () {
		this.callParent(arguments);

		var c = this.course;

		this.renderData = Ext.apply(this.renderData || {}, {
			headerCls: this.paymentfail ? 'error' : '',
			header: this.paymentfail ?
				getString('NextThought.view.courseware.enrollment.Enroll.PaymentProblems') :
				getString('NextThought.view.courseware.enrollment.Enroll.AppAccepted'),
			text: this.paymentfail ?
				getString('NextThought.view.courseware.enrollment.Enroll.TryPayAgain') :
				getString('NextThought.view.courseware.enrollment.Enroll.ThanksCreditOU'),
			available: getFormattedString('NextThought.view.courseware.enrollment.Enroll.CreditAvailable', {title: c.getSemester()}),
			confirm: getString('NextThought.view.courseware.enrollment.Enroll.ConfirmCourse')
		});
	},

	afterRender: function () {
		this.callParent(arguments);

		this.detailsTable = Ext.widget('enrollment-details-table', {
			course: this.course,
			enrollmentOption: this.enrollmentOption,
			renderTo: this.detailsEl
		});

		this.on('destroy', 'destroy', this.detailsTable);

		this.beforeShow();
	},

	beforeShow: function () {
		if (!this.rendered) { return; }

		if (this.enrollmentOption.AllowVendorUpdates) {
			this.subscribeLabelEl.update(getString('SubscribeToVendor') || 'Subscribe to updates.');
			this.subscribeLegalEl.update(getString('SubscribeToVendorLegal'));
			this.subscribeContainerEl.show();
		} else {
			this.subscribeContainerEl.hide();
		}
	},

	getButtonCfg: function () {
		return this.buttonCfg;
	},

	buttonClick: function (action) {
		if (action === 'goto-payment') {
			this.maybeSubmit();
		}
	},

	stopClose: function () {
		var me = this;

		return new Promise(function (fulfill, reject) {
			Ext.Msg.show({
				msg: getString('NextThought.view.courseware.enrollment.Enroll.NotFinished'),
				buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
				scope: this,
				icon: 'warning-red',
				buttonText: {
					'ok': 'caution: ' + getString('NextThought.view.courseware.enrollment.Enroll.Leave'),
					'cancel': getString('NextThought.view.courseware.enrollment.Enroll.Stay')
				},
				title: getString('NextThought.view.courseware.enrollment.Enroll.AreYouSure'),
				fn: function (str) {
					if (str === 'ok') {
						fulfill();
					} else {
						reject();
					}
				}
			});
		});
	},

	showErrorMsg: function (json) {
		if (json && json.Message) {
			this.fireEvent('show-msg', json.Message, true, 5000);
		} else {
			this.fireEvent('show-msg', getString('NextThought.view.courseware.enrollment.Enroll.AlreadyEnrolled'), true, 5000);
		}
	},

	showError: function (json) {
		json = json || {};
		json.title = getString('NextThought.view.courseware.enrollment.Enroll.PaymentProblems');
		json.Message = json.Message || getString('NextThought.view.courseware.enrollment.Enroll.TryPayAgain');
		json.ContactInformation = json.ContactInformation || getString('NextThought.view.courseware.enrollment.Enroll.HelpDesk');

		this.titleEl.update(json.title);
		this.titleEl.addCls('error');
		this.availableEl.update('');
		this.descriptionEl.update(json.Message);
		this.confirmEl.update(json.ContactInformation);
	},

	maybeSubmit: function () {
		var me = this,
			minTime = wait(5000),
			subscribe;

		//if its there, visible, and checked
		subscribe = this.subscribeEl && this.subscribeEl.isVisible() && this.subscribeEl.dom.checked;

		me.addMask(getString('NextThought.view.courseware.enrollment.Enroll.ExternalPay'), 'navigation');

		this.complete(this, {
			subscribe: subscribe
		})
			.then(function (response) {
				var json = Ext.JSON.decode(response, true);

				if (json.href) {
					minTime.then(function () {
						window.location.href = json.href;
					});
				} else {
					console.error('No href to redirect to...', response);
					me.showErrorMsg();

					minTime.then(function () {
						me.error(me);
						me.removeMask();
					});
				}
			})
			.catch(function (response) {
				var json = Ext.JSON.decode(response, true);

				console.error('Enroll and pay failed', response);

				me.showErrorMsg(json);

				me.showError(json);

				minTime.then(function () {
					me.error(me);
					me.removeMask();
				});
			});
	}
});
