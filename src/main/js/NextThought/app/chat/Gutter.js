Ext.define('NextThought.app.chat.Gutter', {
	extend: 'Ext.container.Container',
	alias: 'widget.chat-gutter-window',

	requires: [
		'NextThought.app.groups.StateStore',
		'NextThought.app.chat.StateStore',
		'NextThought.app.chat.components.GutterEntry'
	],

	cls: 'chat-gutter-window',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'show-contacts', 'data-qtip': 'Show Contacts'},
		{id: '{id}-body', cn: ['{%this.renderContainer(out, values)%}']}
	]),

	getTargetEl: function() { return this.body; },
	childEls: ['body'],

	renderSelectors: {
		contactsButtonEl: '.show-contacts'
	},

	initComponent: function() {
		this.callParent(arguments);

		this.GroupStore = NextThought.app.groups.StateStore.getInstance();
		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.store = this.GroupStore.getOnlineContactStore();

		this.mon(this.store, {
			'load': this.updateList.bind(this),
			'add': this.addContacts.bind(this),
			'remove': this.removeContacts.bind(this)
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.contactsButtonEl, 'click', this.goToContacts.bind(this));
	},


	goToContacts: function(e) {
		console.warn('Should Navigate to contacts');
	},


	updateList: function(store, users) {
		var list = [];

		this.removeAll(true);
		this.addContacts(store, users);
	},


	removeContacts: function(store, users) {
		console.error('Removing contact in Gutter is not yet implemented: ', arguments);
	},


	addContacts: function(store, users) {
		var me = this, list = [];
		users.forEach(function(user) {
			list.push({
				xtype: 'chat-gutter-entry',
				user: user
			});
		});

		me.add(list);
	}
});
