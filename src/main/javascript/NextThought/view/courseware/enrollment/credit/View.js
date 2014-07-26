Ext.define('NextThought.view.courseware.enrollment.credit.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.enrollment-credit',

	requires: [
		'NextThought.view.courseware.enrollment.credit.Admission',
		'NextThought.view.courseware.enrollment.credit.Enroll',
		'NextThought.view.courseware.enrollment.credit.Purchase'
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
			{cls: 'number purchase', 'data-number': '3', html: 'Purchase'}
		]},
		{ id: '{id}-body', cls: 'body-container credit-container', cn: ['{%this.renderContainer(out,values)%}'] }
	]),

	renderSelectors: {
		admissionEl: '.header .admission',
		enrollEl: '.header .enrollment',
		purchaseEl: '.header .purchase'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.admissionState = $AppConfig.userObject.get('admission_status');

		if (this.admissionState === 'admitted') {
			if (this.course.getLink('enrolllink')) {
				this.showEnroll();
			} else {
				this.showPurchase();
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

		me.getLayout().setActiveItem(me.admissions);
	},


	showEnroll: function() {
		var me = this;

		me.enrollment = me.add({
			xtype: 'enrollment-credit-enroll',
			course: me.course
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

		me.getLayout().setActiveItem(me.enrollment);
	},


	showPurchase: function() {
		var me = this;

		me.purchase = me.add({
			xtype: 'enrollment-credit-purchase',
			course: me.course
		});

		function updateHeader() {
			var active = me.el.down('.header .active');

			if (active) {
				active.removeCls('active');
			}

			me.admissionEl.addCls('enabled');
			me.enrollEl.addCls('enabled');
			me.purchaseEl.addCls('active');
		}

		if (!me.rendered) {
			me.on('afterrender', updateHeader);
		} else {
			updateHeader();
		}

		me.getLayout().setActiveItem(me.purchase);
	}
});
