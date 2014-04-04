Ext.define('NextThought.view.account.notifications.types.Contact', {
	extend: 'NextThought.view.account.notifications.types.Base',
	alias: 'widget.notification-item-contact',
	keyVal: 'application/vnd.nextthought.user',

	requires: [
		'NextThought.view.account.contacts.management.Popout'
	],

	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{
			cls: 'history notification contact',
			cn: [
				{tag: 'span', cls: 'creator link', html: '{displayName}'},
				{tag: 'span', cls: 'verb', html: 'added you as a contact'}
			]
		}
	])),

	fillInData: function() {},

	clicked: function(view, rec) {
		view.fireEvent('show-profile', rec);
	}
});
