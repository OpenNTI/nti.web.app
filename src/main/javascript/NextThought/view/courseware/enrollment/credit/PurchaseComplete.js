Ext.define('NextThought.view.courseware.enrollment.credit.PurchaseComplete', {
	extend: 'Ext.Component',
	alias: 'widget.enrollment-credit-purchase-complete',

	cls: 'enrollment-credit-purchase',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'title', html: 'You\'re Enrolled to Earn College Credit.'},
		{cls: 'things-to-do', cn: [
			{cls: 'prompt', html: '{prompt}'},
			{tag: 'tpl', 'for': 'todo', cn: [
				{tag: 'a', href: '{href}', html: '{text}'}
			]}
		]},
		{cls: 'support', cn: [
			{cls: 'support-text', html: 'Please contact tech support if you have any issues.'},
			{cls: 'help-link phone', html: '{phone}'},
			{tag: 'tpl', 'for': 'helplinks', cn: [
				{tag: 'a', href: '{href}', html: '{text}', target: '_blank'}
			]}
		]}
	]),


	beforeRender: function() {
		this.callParent(arguments);

		var c = this.course,
			start = c.get('StartDate'),
			helplinks = [], i, labelprefix,
			prompt = '{course} starts on {date} and will be conducted fully online. Here are some things to do before class starts:';

		prompt = prompt.replace('{course}', c.get('Title'));
		prompt = prompt.replace('{date}', Ext.Date.format(start, 'F j, Y'));

		for (i = 1; i <= 3; i++) {
			labelprefix = 'course-info.course-supoprt.link' + i;

			if (getString(labelprefix + '.Label') !== labelprefix + '.label') {
				helplinks.push(
					{href: getString(labelprefix + '.URL'), text: getString(labelprefix + '.Label')}
				);
			}
		}

		this.renderData = Ext.apply(this.renderData || {}, {
			prompt: prompt,
			todo: [
				{href: 'welcome', text: 'Get Acquainted with Janux'},
				{href: 'profile', text: 'Complete your Profile'}
			],
			phone: getString('course-info.course-supoprt.phone'),
			helplinks: helplinks
		});
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
				me.fireEvent('show-profile', $AppConfig.userObject, ['about']);
				me.up('library-available-courses-window').close();
				return false;
			}

			if (href === 'welcome') {
				e.stopEvent();
				me.fireEvent('show-permanent-welcome-guide', {
					link: $AppConfig.userObject.getLink('content.permanent_welcome_page')
				});
				return false;
			}
		});
	}
});
