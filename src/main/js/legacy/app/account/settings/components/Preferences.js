const Ext = require('@nti/extjs');

module.exports = exports = Ext.define(
	'NextThought.app.account.settings.components.Preferences',
	{
		extend: 'Ext.Component',
		alias: 'widget.account-preferences',

		cls: 'account-preferences',

		renderTpl: Ext.DomHelper.markup([
			{
				tag: 'fieldset',
				cn: [
					{ tag: 'legend', html: 'Accessibility' },
					{
						tag: 'span',
						cls: 'not-ready nti-checkbox high-contrast',
						html: 'Enable High Contrast Mode.',
						tabIndex: 0,
						role: 'button',
						'data-preference-path': 'WebApp',
						'data-preference-key': 'useHighContrast',
					},
				],
			},
			{
				tag: 'tpl',
				cn: {
					tag: 'fieldset',
					cn: [
						{ tag: 'legend', html: 'Communications' },
						{
							tag: 'span',
							cls: 'not-ready nti-checkbox email',
							html: 'Send me email notifications about activity I may have missed.',
							tabIndex: 0,
							role: 'button',
							'data-preference-path': 'PushNotifications/Email',
							'data-preference-key':
								'email_a_summary_of_interesting_changes',
						},
						{
							tag: 'span',
							cls: 'not-ready nti-checkbox email',
							html: 'Send me email notifications when someone @mentions me.',
							tabIndex: 0,
							role: 'button',
							'data-preference-path': 'PushNotifications/Email',
							'data-preference-key': 'notify_on_mention',
						},
						{
							tag: 'span',
							cls: 'not-ready nti-checkbox email',
							html: 'Send me email notifications when I am replied to.',
							tabIndex: 0,
							role: 'button',
							'data-preference-path': 'PushNotifications/Email',
							'data-preference-key': 'immediate_threadable_reply',
						},
					],
				},
			},
		]),

		afterRender: function () {
			this.callParent(arguments);
			this.mon(this.el, {
				scope: this,
				click: this.checkboxClicked,
			});
			this.updateCheckboxs();
		},

		updateCheckboxs: function () {
			var me = this,
				prefs = {},
				boxes = me.el.query('.nti-checkbox[data-preference-path]');

			this.preferences = prefs;

			boxes = boxes.map(function (el) {
				var path = el.dataset.preferencePath,
					key = el.dataset.preferenceKey,
					promise = prefs[path];

				if (!promise) {
					promise = prefs[path] =
						$AppConfig.Preferences.getPreference(path);
				}

				promise = promise.then(function (pref) {
					Ext.fly(el).removeCls('not-ready');
					Ext.fly(el)[pref && pref.get(key) ? 'addCls' : 'removeCls'](
						'checked'
					);
					return el;
				});

				return promise;
			});

			return Promise.all(boxes);
		},

		checkboxClicked: function (e) {
			e.stopEvent();
			var dom = e.getTarget('.nti-checkbox[data-preference-path]'),
				path = dom && dom.dataset.preferencePath,
				key = dom && dom.dataset.preferenceKey,
				prefs = dom && this.preferences[path],
				state = dom && !Ext.fly(dom).hasCls('checked'); // the dom hasn't updated with the new class yet;

			if (!dom || !prefs || Ext.fly(dom).hasCls('not-ready')) {
				return;
			}

			prefs.then(function (pref) {
				pref.set(key, state);
				pref.save({
					onlyChanges: true,
					callback: function () {
						if (key === 'useHighContrast') {
							Ext.util.Cookies.clear('use-accessibility-mode');
							window.location.reload();
						}
					},
				});
				Ext.fly(dom)[state ? 'addCls' : 'removeCls']('checked');
			});
		},
	}
);
