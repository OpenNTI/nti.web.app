Ext.define('NextThought.view.courseware.enrollment.GiftConfirmation', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-gift-confirmation',

	cls: 'enrollment-gift-confirmation',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: '{heading}'},
		{cls: 'prompt', html: '{prompt}'},
		{cls: 'token', cn: [
			{tag: 'span', cls: 'label', html: 'Token:'},
			{tag: 'span', cls: 'token-text', html: '{token}'}
		]},
		{cls: 'support', cn: [
			{cls: 'support-text', html: 'Please contact tech support if you have any issues.'},
			{cls: 'help-link phone', html: '{phone}'},
			{tag: 'tpl', 'for': 'helplinks', cn: [
				{tag: 'a', href: '{href}', html: '{text}', target: '_blank'}
			]}
		]}
	]),


	renderSelectors: {
		tokenEl: '.token .token-text'
	},


	beforeRender: function() {
		this.callParent(arguments);

		var c = this.course,
			start = c.get('StartDate'),
			helplinks = [], i, labelprefix,
			prompt = '<span class=\'bold\' >{course} starts on {date}</span> and will be conducted fully online.</span>';

		prompt = prompt.replace('{course}', c.get('Title'));
		prompt = prompt.replace('{date}', Ext.Date.format(start, 'F j, Y'));

		for (i = 1; i <= 3; i++) {
			labelprefix = 'course-info.course-supoprt.link' + i;

			if (getString(labelprefix + '.Label') !== labelprefix + '.label') {
				helplinks.push(
					{href: getString(labelprefix + '.URL'), text: getString(labelprefix + '.Label', '', true)}
				);
			}
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			heading: 'Gift Purchase Successful',
			prompt: prompt,
			todo: [
				{href: 'welcome', text: getString('enrollment.previewplatform', '', true)},
				{href: 'profile', text: 'Complete Your Profile'}
			],
			phone: getString('course-info.course-supoprt.phone'),
			helplinks: helplinks
		});
	},


	beforeShow: function() {
		var purchaseAttempt = this.enrollmentOption.purchaseAttempt,
			token = purchaseAttempt && purchaseAttempt.get('RedemptionCode');

		if (!this.rendered) { return; }

		if (token) {
			this.tokenEl.update(token);
		}
	}
});
