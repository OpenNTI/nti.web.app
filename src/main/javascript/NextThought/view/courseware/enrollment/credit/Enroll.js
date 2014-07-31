Ext.define('NextThought.view.courseware.enrollment.credit.Enroll', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-credit-enroll',

	cls: 'enroll-for-credit',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'message', cn: [
			{cls: 'main', html: '{header}'},
			{cls: 'text', html: '{text}'},
			{cls: 'text', html: '{available}'},
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
		enrollEl: '.enroll-now'
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
			header: this.paymentfail ?
				'There were some troubles with your payment.' :
				'Your application has been accepted!',
			text: this.paymentfail ?
				'Please try again, you will gain access to the content once the payment is successful' :
				'Thank you for applying to earn credit online from the University of Oklahoma.',
			available: 'Your admission credit is available for ' + c.getSemester() + '.',
			confirm: 'Please take a moment to confirm your course selection before checking out.',
			price: '$599',
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


	showError: function(json) {
		if (json && json.Message) {
			this.fireEvent('show-msg', json.Message, true, 5000);
		} else {
			this.fireEvent('show-msg', 'An unkown error occured. Please try again later.', true, 5000);
		}
	},

	maybeSubmit: function() {
		var me = this,
			enrollLink = me.course.getEnrollForCreditLink(),
			payLink = me.course.getPaymentLink(),
			crn = me.course.get('OU_CRN'),
			term = me.course.get('OU_Term'),
			returnURL = me.course.buildPaymentReturnURL(),
			maskCmp = me.up('enrollment-credit');

		function pay() {
			Service.post(payLink, {
				crn: crn,
				term_code: term,
				return_url: returnURL
			}).then(function(response) {
				var json = Ext.JSON.decode(response, true);

				if (json.href) {
					window.location.href = json.href;
				} else {
					console.error('No href to redirect to', response);
				}
			}).fail(function(response) {
				console.error('payment post failed', response);
				me.showError({
					Message: 'An error occurred with your payment. You are enrolled in the course, but will need to pay before you have access to the content.'
				});

				maskCmp.el.unmask();
			});
		}

		if (!payLink) {
			console.error('No pay link');
			me.showError();
			return;
		}

		maskCmp.el.mask('Loading...');

		if (!enrollLink) {
			pay();
		}

		Service.post(enrollLink, {
			crn: crn,
			term_code: term
		}).then(function(response) {
			var json = Ext.JSON.decode(response, true);

			if (json.Status === 201) {
				pay();
			} else {
				maskCmp.el.unmask();
				me.showError(json);
			}
		}).fail(function(response) {
			var json = Ext.JSON.decode((response && response.responseText) || response, true);

			console.error('Enroll request failed: ' + response);
			maskCmp.el.unmask();
			me.showError(json);
		});
	}
});
