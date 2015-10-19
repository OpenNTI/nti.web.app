Ext.define('NextThought.app.course.enrollment.components.Confirmation', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-confirmation',

	requires: [
		'NextThought.app.account.Actions'
	],

	mixins: {
		ProfileLinks: 'NextThought.mixins.ProfileLinks'
	},

	cls: 'enrollment-credit-purchase',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: '{heading}'},
		{cls: 'things-to-do', cn: [
			{cls: 'prompt', html: '{prompt}'},
			{tag: 'tpl', 'for': 'todo', cn: [
				{tag: 'a', href: '{href}', html: '{text}'}
			]}
		]},
		{cls: 'transaction', cn: [
			{tag: 'span', cls: 'label', html: '{{{NextThought.view.courseware.enrollment.Confirmation.TransID}}}'},
			{cls: 'transaction-id'}
		]},
		{cls: 'support', cn: [
				{cls: 'support-text', html: '{{{NextThought.view.courseware.enrollment.Confirmation.ContactTechSupport}}}'},
			{cls: 'help-link phone', html: '{phone}'},
			{tag: 'tpl', 'for': 'helplinks', cn: [
				{tag: 'a', href: '{href}', html: '{text}', target: '_blank'}
			]}
		]}
	]),


	renderSelectors: {
		transactionContainerEl: '.transaction',
		transactionEl: '.transaction .transaction-id'
	},


	beforeRender: function() {
		this.callParent(arguments);

		var c = this.course,
			start = c.get('StartDate'),
			helplinks = [], i, labelprefix,
			prompt = getFormattedString('NextThought.view.courseware.enrollment.Confirmation.ClassStartInfo', {
                date: Ext.Date.format(start, 'F j, Y'),
                course: c.get('Title')
            });

		for (i = 1; i <= 3; i++) {
			labelprefix = 'course-info.course-supoprt.link' + i;

			if (getString(labelprefix + '.Label') !== labelprefix + '.label') {
				helplinks.push(
					{href: getString(labelprefix + '.URL'), text: getString(labelprefix + '.Label', '', true)}
				);
			}
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			heading: this.heading,
			prompt: prompt,
			todo: [
				{href: 'welcome', text: getString('enrollment.previewplatform', '', true)},
				{href: 'profile', text: getString('NextThought.view.courseware.enrollment.Confirmation.CompleteProfile')}
			],
			phone: getString('course-info.course-supoprt.phone'),
			helplinks: helplinks
		});


		this.AccountActions = NextThought.app.account.Actions.create();
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.mon(me.el, 'click', function(e) {
			var a = e.getTarget('a'),
				href = a && a.getAttribute('href');

			if (!href) { return; }

			if (href === 'profile') {
				e.stopEvent();
				me.up('library-available-courses-window').close();
				me.navigateToProfile($AppConfig.userObject);
				return false;
			}

			if (href === 'welcome') {
				e.stopEvent();
				me.AccountActions.showWelcomePage($AppConfig.getLink('content.permanent_welcome_page'));
				return false;
			}
		});

		me.transactionContainerEl.setVisibilityMode(Ext.dom.Element.DISPLAY);

		me.transactionInput = Ext.widget('simpletext', {
			inputType: 'text',
			readOnly: true,
			placeholder: getString('NextThought.view.courseware.enrollment.Confirmation.TransID'),
			renderTo: me.transactionEl
		});

		me.on('destroy', 'destroy', me.transactionInput);
	},

	stopClose: function() {
		return Promise.resolve();
	},


	beforeShow: function() {
		var purchaseAttempt = this.enrollmentOption.purchaseAttempt,
			transactionId = purchaseAttempt && purchaseAttempt.get('TransactionID');

		if (transactionId) {
			this.transactionInput.update(transactionId);
		} else {
			this.transactionContainerEl.hide();
		}
	}
});
