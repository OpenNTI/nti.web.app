Ext.define('NextThought.view.courseware.enrollment.credit.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.enrollment-credit',

	requires: [
		'NextThought.view.courseware.enrollment.credit.Admission',
		'NextThought.view.courseware.enrollment.credit.Enroll',
		'NextThought.view.courseware.enrollment.credit.PurchaseComplete'
	],

	layout: 'card',
	cls: 'enrollment-credit',

	getTargetEl: function() {
		return this.body;
	},

	childEls: ['body'],

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', cn: [
			{cls: 'enabled', html: 'Course Details'},
			{cls: 'number enabled active admission', 'data-number': '1', html: 'Admissions'},
			{cls: 'number enrollment', 'data-number': '2', html: 'Enrollment'},
			{cls: 'number purchase', 'data-number': '3', html: 'Purchase'},
			{cls: 'number confirmation', 'data-number': '4', html: 'Confirmation'}
		]},
		{ id: '{id}-body', cls: 'body-container credit-container', cn: ['{%this.renderContainer(out,values)%}'] }
	]),

	renderSelectors: {
		admissionEl: '.header .admission',
		enrollEl: '.header .enrollment',
		purchaseEl: '.header .purchase',
		confirmationEl: '.header .confirmation'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.enableBubble('show-detail', 'set-window-btns');

		this.admissionState = $AppConfig.userObject.get('admission_status');

		if (this.admissionState === 'Admitted') {
			if (this.paymentcomplete) {
				this.maybeShowPurchaseComplete();
			} else {
				this.showEnroll();
			}

			return;
		}

		this.showAdmission();
	},


	showAdmission: function() {
		var me = this;

		me.admissions = me.add({
			xtype: 'enrollment-credit-admission',
			course: this.course,
			status: this.admissionState
		});

		function updateHeader() {
			var active = me.el.down('.header .active');

			if (active) {
				active.removeCls('active');
			}

			me.admissionEl.addCls('active');
			me.enrollEl.removeCls('enabled');
			me.purchaseEl.removeCls('enabled');
		}

		if (!me.rendered) {
			me.on('afterrender', updateHeader);
		} else {
			updateHeader();
		}

		me.mon(me.admissions, 'admission-complete', function(success) {
			if (success) {
				me.showEnroll();
			} else {
				me.fireEvent('show-detail', me.course);
			}
		});

		me.fireEvent('set-window-btns', 'admission');
		me.getLayout().setActiveItem(me.admissions);
	},


	showEnroll: function(paymentfail) {
		var me = this;

		me.enrollment = me.add({
			xtype: 'enrollment-credit-enroll',
			course: me.course,
			paymentfail: paymentfail
		});


		function updateHeader() {
			var active = me.el.down('.header .active');

			if (active) {
				active.removeCls('active');
			}

			me.admissionEl.addCls('enabled');
			me.enrollEl.addCls('active');
			me.purchaseEl.removeCls('enabled');
		}

		if (!me.rendered) {
			me.on('afterrender', updateHeader);
		} else {
			updateHeader();
		}

		me.fireEvent('set-window-btns', 'enroll');
		me.getLayout().setActiveItem(me.enrollment);
	},


	showPurchaseComplete: function() {
		var me = this;

		me.purchase = me.add({
			xtype: 'enrollment-credit-purchase-complete',
			course: me.course
		});

		function updateHeader() {
			var active = me.el.down('.header .active');

			if (active) {
				active.removeCls('active');
			}

			me.admissionEl.addCls('enabled');
			me.enrollEl.addCls('enabled');
			me.purchaseEl.addCls('enabled');
			me.confirmationEl.addCls('active');
		}

		if (!me.rendered) {
			me.on('afterrender', updateHeader);
		} else {
			updateHeader();
		}

		me.fireEvent('set-window-btns', 'payconfirm');
		me.getLayout().setActiveItem(me.purchase);
	},


	maybeShowPurchaseComplete: function() {
		var me = this,
			link = me.course.getLink('fmaep.is.pay.done'),
			crn = me.course.get('OU_CRN'),
			term = me.course.get('OU_Term');

		if (!link) {
			console.error('No is pay done link');
			this.showEnroll();
		}

		Service.post(link, {
			crn: crn,
			term_code: term
		}).then(function(response) {
			var json = Ext.JSON.decode(response, true);

			if (json.Status !== 200) {
				console.error('Error resolving is pay done', json);
			} else {
				if (json.State) {
					me.showPurchaseComplete();
				} else {
					me.showEnroll(true);
				}

			}
		}).fail(function(reason) {
			console.error('Error with is pay done', reason);
		});

	},



	maybeSubmitApplication: function() {
		this.admissions.maybeSubmit();
	},


	maybeSubmitEnrollment: function() {
		this.enrollment.maybeSubmit();
	}
});
