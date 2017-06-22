const Ext = require('extjs');

const {getString} = require('legacy/util/Localization');
const GroupsActions = require('legacy/app/groups/Actions');
const GroupsStateStore = require('legacy/app/groups/StateStore');

const ChatActions = require('../../../chat/Actions');

require('legacy/mixins/ProfileLinks');
require('../../activity/Popout');
require('./GroupList');
require('./Options');


module.exports = exports = Ext.define('NextThought.app.account.contacts.management.Popout', {
	extend: 'NextThought.app.account.activity.Popout',
	alias: ['widget.contact-popout', 'widget.activity-popout-user'],

	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks'
	},

	width: 350,
	cls: 'contact-popout',

	renderTpl: Ext.DomHelper.markup([{
		cls: 'header',
		cn: [{
			cls: 'card-wrap',
			cn: [{
				cls: 'contact-card',
				cn: [
					'{user:avatar}',
					{
						cls: 'text-wrap',
						cn: [
							{cls: 'name', html: '{name}'},
							{tag: 'tpl', 'if': '!disableProfiles', cn: [
								{cls: 'meta-role', cn: [
									{tag: 'tpl', 'if': 'role', cn: [
										{tag: 'span', cls: 'role', html: '{role}'}
									]},
									{tag: 'tpl', 'if': 'role && affiliation', cn: [
										{ tag: 'span', html: ' at '}
									]},
									{tag: 'tpl', 'if': 'affiliation', cn: [
										{tag: 'span', cls: 'affiliation', html: '{affiliation}'}
									]}
								]},
								{tag: 'tpl', 'if': 'location', cn: [
									{cls: 'location', html: '{location}'}
								]}
							]}
						]
					}
				]
			}]
		}
		]},
	{
		id: '{id}-body', cls: 'container-body', html: '{%this.renderContainer(out,values)%}'
	},
	{
		cls: 'footer',
		cn: [
			{cls: 'controls', cn: [
				{tag: 'tpl', 'if': 'isContact', cn: [
					{cls: 'right chat', cn: [
						{tag: 'a', cls: 'button', html: '{{{NextThought.view.account.contacts.management.Popout.chat}}}'}
					]}
				]},
				{tag: 'tpl', 'if': '!isContact', cn: [
					{cls: 'right add-contact', cn: [
						{tag: 'a', cls: 'button', html: '{{{NextThought.view.account.contacts.management.Popout.add-contact}}}'}
					]}
				]},
				{cls: 'left', cn: [
					{cls: 'control lists', 'data-qtip': '{{{NextThought.view.account.contacts.management.Popout.distribution-list}}}'},
					{cls: 'control options', 'data-qtip': '{{{NextThought.view.account.contacts.management.Popout.options}}}'}
				]}

			]}
		]
	}]),

	renderSelectors: {
		name: '.name',
		avatar: '.contact-card .avatar',
		actionEl: '.right',
		actionButtonEl: '.right a',
		listEl: '.lists',
		optionsEl: '.options'
	},

	setupItems: Ext.emptyFn,

	initComponent: function () {
		this.callParent(arguments);
		var me = this;
		this.groupsListMenu = Ext.widget({
			xtype: 'menu',
			width: 350,
			items: [{xtype: 'management-group-list', allowSelect: true}]
		});

		this.GroupStore = GroupsStateStore.getInstance();
		this.GroupActions = GroupsActions.create();
		this.ChatActions = ChatActions.create();
		this.isContact = this.GroupStore.getFriendsList().isContact(this.record);

		this.groupsList = this.groupsListMenu.down('management-group-list');
		this.groupsList.setUser(this.record);
		this.groupsList.isContact = this.isContact;
		this.optionsMenu = Ext.widget({ xtype: 'person-options-menu', ownerCmp: me, user: me.user, isContact: this.isContact });

		this.on('adjust-height', this.align);
		this.on('destroy', 'destroy', this.optionsMenu);
		this.on('destroy', 'destroy', this.groupsListMenu);

		// NOTE: We don't want a pointer for the person card. So disabled it.
		this.pointer.disable();
	},

	beforeRender: function () {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, this.record.getData());
		this.renderData = Ext.apply(this.renderData, {
			disableProfiles: !!$AppConfig.disableProfiles,
			isContact: this.isContact,
			groupCount: this.getListCount(),
			user: this.record,
			name: this.record.getName(),
			affiliation: this.record.get('affiliation'),
			role: this.record.get('role'),
			location: this.record.get('location')
		});
	},

	afterRender: function () {
		this.callParent(arguments);
		this.enableProfileClicks(this.avatar, this.name);
		this.user = this.record;	//EnableProfileClicks mixin expects us to have a this.user object.

		this.mon(this.listEl, 'click', this.showUserList, this);
		this.mon(this.actionButtonEl, 'click', this.actOnContactOrChat, this);
		this.mon(this.optionsEl, 'click', this.showOptionMenu, this);

		this.mon(this.groupsList, {
			scope: this,
			'add-contact': this.incrementCount,
			'remove-contact': this.decreaseCount,
			'added-contact': this.makeItContact,
			'hide-menu': this.showUserList,
			'sync-menu-height': this.syncMenuHeight
		});

		this.mon(this.optionsMenu, {
			scope: this,
			'remove-contact-selected': this.onDeleteContact,
			'hide-menu': this.showOptionMenu
		});

		this.setPresenceButton();

		this.on('beforedeactivate', function () {
			return this.groupsList.fireEvent('beforedeactivate') && this.optionsMenu.fireEvent('beforedeactivate');
		}, this);

		if (!Service.canChat()) {
			this.actionEl.destroy();
		}

		if (!Service.canFriend()) {
			this.listEl.destroy();
			this.optionsEl.destroy();
		}

	},

	getListCount: function () {
		var u = this.record.get('Username'),
			s = this.groupsList.store,
			k = s.queryBy(function (a) { return a && a.hasFriend && a.hasFriend(u) && !a.isDFL; }),
			c = k.getCount();

		// NOTE: remove my contact list because it's a hidden group that will always be there.
		if (c > 0) { c--; }
		return c;
	},

	getPointerStyle: function (x, y) {
		var el = this.getTargetEl(),
			t = el.getY(),
			b = t + el.getHeight();

		return (t <= y && y <= b) ? '' : 'contact';
	},

	actOnContactOrChat: function (e) {
		e.stopEvent();

		if (e.getTarget('.disabled')) {
			return;
		}

		if (e.getTarget('.add-contact')) {
			this.onAddContact();
		}else {
			this.ChatActions.startChat(this.record);
		}
	},

	onAddContact: function () {
		var me = this, data = this.getSelected();

		this.GroupActions.addContact(this.user, data.groups)
			.then(function () {
				me.destroy();
			});
	},

	onDeleteContact: function () {
		var me = this, data = this.getSelected(),
			fin = function () { me.destroy(); };

		Ext.Msg.show({
			msg: getString('NextThought.view.account.contacts.management.Popout.remove-msg'),
			title: getString('NextThought.view.account.contacts.management.Popout.remove-title'),
			icon: 'warning-red',
			buttons: {
				primary: {
					text: 'Remove',
					handler: function () {
						me.GroupActions.deleteContact(me.user, data.groups)
							.then(fin);
					}
				},
				secondary: 'Cancel'
			}
		});
	},

	showUserList: function () {
		if (this.showingListMenu) {
			this.groupsListMenu.hide();
			this.fireEvent('adjust-height');
			delete this.showingListMenu;
			return;
		}
		this.showingListMenu = true;
		this.groupsListMenu.showBy(this.avatar, 'tl-bl', [-1, 0]);
		this.syncMenuHeight(this.groupsListMenu);
	},

	showOptionMenu: function () {
		if (this.showingOptionsMenu) {
			this.optionsMenu.hide();
			this.fireEvent('adjust-height');
			delete this.showingOptionsMenu;
			return;
		}
		this.showingOptionsMenu = true;
		this.optionsMenu.showBy(this.avatar, 'tl-bl', [-1, 0]);
		this.syncMenuHeight(this.optionsMenu);
	},

	syncMenuHeight: function (menu) {
		var topMenu = menu.getY(),
			avatarTop = this.avatar.getY(),
			avatarHeight = this.avatar.getHeight();

		if (topMenu < (avatarTop + avatarHeight)) {
			this.setY(topMenu - avatarHeight, true);
		}
	},

	align: function () {
		try {
			this.maxHeight = Ext.dom.Element.getViewportHeight();
			this.alignTo(this.refEl, this.anchor || 'tr-tl?', this.offsets || [-10, 0]);
			if (this.pointer) {
				this.pointer.point();
			}
			this.updateLayout();
		}
		catch (e) {
			if (!this.isDestroyed) {
				console.warn('Align attempt failed', e.stack || e.message || e);
			}
		}
	},

	getSelected: function () {
		var l = this.groupsList;
		return {
			user: this.user.getId(),
			groups: l ? l.getSelected() : []
		};
	},

	setPresenceButton: function () {
		var pi = this.user.get('Presence'),
			current = $AppConfig.userObject.get('Presence'),
			isOnline = (pi && pi.isOnline && pi.isOnline()) || this.isUserOnline();
		if ((this.isContact && !isOnline) || (current && !current.isOnline())) {
			if (!this.actionEl.hasCls('add-contact')) {
				this.actionEl.addCls('disabled');
			}
		}
	},

	isUserOnline: function () {
		var o = this.GroupStore.getOnlineContactStore();
		return Boolean(o.findRecord('Username', this.user.get('Username')));
	},

	makeItContact: function () {
		this.actionEl.removeCls('add-contact').addCls('chat');
		this.actionButtonEl.update(getString('NextThought.view.account.contacts.management.Popout.chat'));
		this.isContact = true;
		this.setPresenceButton();
	},

	updateCount: function (count) {
		this.listEl.set({'data-value': count});
	},

	incrementCount: function () {
		var count = this.getListCount();
		count++;
		this.updateCount(count);
	},

	decreaseCount: function () {
		var count = this.getListCount();
		count--;
		this.updateCount(count);
	},

	onDestroy: function () {
		//debugger;
		if (this.groupsListMenu.el) {
			this.groupsListMenu.el.remove();
		}

		if (this.optionsMenu.el) {
			this.optionsMenu.el.remove();
		}
		this.callParent(arguments);
	}
});
