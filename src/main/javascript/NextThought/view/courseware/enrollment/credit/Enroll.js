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

		duration = new Duration(duration);

		this.renderData = Ext.apply(this.renderData || {}, {
			header: 'Your application has been accepted!',
			text: 'Thank you for applying to earn credit online from the University of Oklahoma.',
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


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.enableBubble('show-msg');

		function showError(json) {
			if (json.Message) {
				me.fireEvent('show-msg', json.Message, true);
			} else {
				me.fireEvent('show-msg', 'An unkown error occured. Please try again later.', true);
			}
		}

		me.mon(me.enrollEl, 'click', function() {
			var enrollLink = me.course.getLink('fmaep.enroll'),
				payLink = me.course.getLink('fmaep.pay'),
				crn = me.course.get('OU_CRN'),
				term = me.course.get('OU_Term');

			if (!enrollLink) {
				console.error('No Enrollment link');
				return;
			}

			Service.post(enrollLink, {
				crn: crn,
				term_code: term
			})
				.then(function(response) {
					var json = Ext.JSON.decode(response, true);

					if (json.Status === 201 || true) {
						Service.post(payLink, {
							crn: crn,
							term_code: term,
							return_url: me.course.buildPaymentReturnURL()
						});
					}

					console.log(me);
				})
				.fail(function(response) {
					console.log(me);
				});
		});
	}
});
