Ext.define('NextThought.app.contacts.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.contacts-index',

	requires: [
		'NextThought.app.contacts.components.TabView',
		'NextThought.app.contacts.Actions',
		'NextThought.app.contacts.StateStore',
		'NextThought.app.contacts.components.ContactTabView'
	],

	mixins: {
		Route: 'NextThought.mixins.Router'
	},

	title: 'Contacts',
	defaultTab: 'my-contacts',

	id: 'contacts',

	items: [
		{ xtype: 'contacts-tab-view', id: 'my-contacts' } //,
		// { xtype: 'contact-tab-view', id: 'my-groups',
		// 	subType: 'group',
		// 	filterFn: function(group) { return group.hidden !== true && group.isDFL; }
		// },
		// { xtype: 'contact-tab-view', id: 'my-lists',
		// 	subType: 'list',
		// 	filterFn: function(group) { return group.hidden !== true && !group.isDFL; }
		// }
	],

	layout: {
		type: 'card',
		deferredRender: true
	},

	defaultType: 'box',
	activeItem: 0,


	tabSpecs: [
		{label: getString('NextThought.view.contacts.View.contact-tab'), viewId: 'my-contacts'},
		{label: getString('NextThought.view.contacts.View.groups-tab'), viewId: 'my-groups'},
		{label: getString('NextThought.view.contacts.View.list-tab'), viewId: 'my-lists'}
	],

	initComponent: function() {
		var me = this;

		me.callParent(arguments);
		this.removeCls('make-white');

		this.ContactsActions = NextThought.app.contacts.Actions.create();
		this.ContactsStore = NextThought.app.contacts.StateStore.getInstance();

		this.initRouter();

		this.addRoute('/', this.showContacts.bind(this));
		this.addDefaultRoute('/');
	},


	afterRender: function() {
		this.callParent(arguments);
		if (Ext.is.iOS) {
			this.__adjustmentForiOS();
		}
	},


	showContacts: function () {
		console.log(arguments);
	},


	pushState: function(s) {
		history.pushState({contacts: s}, this.title, location.pathname);
	},


	onTabClicked: function(tabSpec) {
		if (this.callParent(arguments) === true) {
			this.pushState({
				activeTab: this.parseTabSpec(tabSpec).viewId
			});
		}
	},


	restore: function(state) {
		return new Promise(function(fulfill) {
			this.setActiveTab(((state || {}).contacts || {}).activeTab);
			fulfill();
		}.bind(this));
	},


	__adjustmentForiOS: function () {
		var outline = this.el.down('.contact:nth-child(1)'),
			list = this.el.down('.contact:nth-child(2)'),
			input = this.el.down('input'),
			me = this;

		wait(100).then(function() {
			me.outlineY = outline.getY();
			me.outlineHeight = outline.getHeight();
		});

		//For keyboard, reduce height and adjust position of elements to fit within smaller screen
		input.on('focus', function() {
			wait(250).then(function() {
				if (window.innerHeight < 600) {
					outline.setHeight(window.innerHeight - 15);
					outline.setY(window.outerHeight - window.innerHeight);
					list.setY(window.outerHeight - window.innerHeight);
					list.setHeight(window.innerHeight - 15);
					me.keyboardUpScrollY = window.scrollY;
				}
			});
		});

		//Undo resizing and repositioning when keyboard dismissed
		input.on('blur', function() {
			if (this.outlineY) {
				outline.setY(me.outlineY);
				outline.setHeight(me.outlineHeight);
				list.setY(me.outlineY);
				list.setHeight(me.outlineHeight);
				me.keyboardUpScrollY = false;
			}
		}, this);

		//Keep from permanently scrolling content off viewable area
		window.onscroll = function() {
			if (!me.keyboardUpScrollY) {
				return;
			}
			if (window.scrollY !== me.keyboardUpScrollY) {
				window.scrollTo(0, me.keyboardUpScrollY);
			}
		};
	},
});
