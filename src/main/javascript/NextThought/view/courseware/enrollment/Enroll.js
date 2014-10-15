Ext.define('NextThought.view.courseware.enrollment.Enroll', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-enroll',

	cls: 'enroll-for-credit-confirmation',

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
		{cls: 'info', cn: [
			{cls: 'line', cn: [
				{cls: 'course-number', html: '{number}'},
				{cls: 'title', html: '{title}'},
				{cls: 'instructor', html: 'instructed by {instructor}'},
				{cls: 'enroll-now', html: '{price}'}
			]},
			{cls: 'line course-info', cn: [
				{cls: 'field long', cn: [
					{cls: 'name', html: 'prerequisites'},
					{tag: 'tpl', 'for': 'prereqs', cn: [
						{cls: 'value', html: '{title}'}
					]}
				]},
				{cls: 'field medium green', cn: [
					{cls: 'name', html: 'credit hours'},
					{cls: 'value green', html: '{credit}'}
				]}
			]},
			{cls: 'line course-info', cn: [
				{cls: 'field long', cn: [
					{cls: 'name', html: '{number}'},
					{cls: 'value', html: '{title}'}
				]},
				{cls: 'field medium', cn: [
					{cls: 'name', html: 'school'},
					{cls: 'value', html: '{school}'}
				]}
			]},
			{cls: 'line course-info', cn: [
				{cls: 'field fourth', cn: [
					{cls: 'name', html: 'start date'},
					{cls: 'value', html: '{start}'}
				]},
				{cls: 'field fourth', cn: [
					{cls: 'name', html: 'end date'},
					{cls: 'value', html: '{end}'}
				]},
				{cls: 'field fourth', cn: [
					{cls: 'name', html: 'duration'},
					{cls: 'value', html: '{duration}'}
				]},
				{cls: 'field fourth', cn: [
					{cls: 'name', html: 'course type'},
					{cls: 'value', html: '{type}'}
				]}
			]}
		]}
	]),


	renderSelectors: {
		enrollEl: '.enroll-now',
		titleEl: '.main',
		descriptionEl: '.description',
		confirmEl: '.confirm',
		availableEl: '.available'
	},


	beforeRender: function() {
		this.callParent(arguments);

		var c = this.course,
			duration = c.get('Duration'),
			credit = c.get('Credit')[0],
			instructor = c.get('Instructors')[0];

		this.enableBubble('show-msg');

		duration = new Duration(duration);

		this.renderData = Ext.apply(this.renderData || {}, {
			headerCls: this.paymentfail ? 'error' : '',
			header: this.paymentfail ?
				'There were some troubles with your payment.' :
				'Your application has been accepted!',
			text: this.paymentfail ?
				'Please try again, you will gain access to the content once the payment is successful.' :
				'Thank you for applying to earn credit online from the University of Oklahoma.',
			available: 'Your admission credit is available for ' + c.getSemester() + '.',
			confirm: 'Please take a moment to confirm your course selection before checking out.',
			price: '$' + c.get('OU_Price'),
			number: c.get('ProviderUniqueID'),
			title: c.get('Title'),
			instructor: instructor.get('Name'),
			prereqs: c.get('Prerequisites'),
			credit: credit.get('Hours') + ' credit hours available',
			start: Ext.Date.format(c.get('StartDate'), 'F j, Y'),
			end: Ext.Date.format(c.get('EndDate'), 'F j, Y'),
			school: c.get('ProviderDepartmentTitle'),
			duration: duration.inWeeks() + ' Weeks',
			type: 'Fully Online'
		});
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
			maskCmp = this.getMaskCmp(),
			minTime = wait(5000);

		maskCmp.el.mask('Finalizing your enrollment. You will be redirected to a secure external payment site to complete this transaction.', 'navigation');

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
						maskCmp.el.unmask();
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
					maskCmp.el.unmask();
				});
			});
	}
});
