var Ext = require('extjs');
var NTIFormat = require('../../../../util/Format');
var GroupsStateStore = require('../../../groups/StateStore');
var StoreUserSearch = require('../../../../store/UserSearch');
var ChatStateStore = require('../../../chat/StateStore');
var ManagementPopout = require('../../../account/contacts/management/Popout');
var GroupsActions = require('../../../groups/Actions');
var {isMe} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.contacts.components.outline.Search', {
    extend: 'Ext.view.View',
    alias: 'widget.contact-search-overlay',
    preserveScrollOnRefresh: true,
    overItemCls: 'over',
    loadMask: false,
    itemSelector: '.contact-row',

    tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
		{ cls: 'contact-row {[this.isContact(values)]}', cn: [
			{ tag: 'tpl', 'if': 'values.Presence', cn: { cls: 'presence {Presence.name}' }},
			{ tag: 'tpl', 'if': '!values.Presence', cn: { cls: 'presence' }},
			{ cls: 'nib' },
			'{[this.getAvatar(values)]}',
			{ cls: 'wrap', cn: [
				{ cls: 'name', html: '{displayName}' },
				{ cls: 'status', html: '{status}' }
			]}
		]}
	]}), {
		getAvatar: function(model){
			var a = NTIFormat.avatar(model);
			return a;
		},
		isContact: function(values) {
			var a = NextThought.app.groups.StateStore.getInstance();
			return (values.Class !== 'User' || a.isContact(values.Username)) ? 'contact' : 'not-contact';
		}
	}),

    emptyText: Ext.DomHelper.markup({cls: 'empty-list', html: getString('NextThought.view.contacts.outline.search.View.empty')}),
    cls: 'contact-search',

    listeners: {
		itemclick: 'rowClicked',
		// itemmouseenter: 'rowHover',
		select: function(s, record) {
			s.deselect(record);
		}
	},

    constructor: function(config) {
		var me = this;

		this.GroupStore = NextThought.app.groups.StateStore.getInstance();
		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.ChatActions = NextThought.app.chat.Actions.create();
		this.GroupActions = NextThought.app.groups.Actions.create();

		me.buildStore();

		me.callParent(arguments);

		me.mon(this.GroupStore.getFriendsList(), {
			scope: me,
			'update': 'refresh'
		});

		me.mon(this.ChatStore, 'presence-changed', function(username, presence) {
			var user = me.store.getById(username);

			if (user) {
				user.set('Presence', presence);
				me.refresh();
			}
		});
	},

    rowClicked: function(view, record, item, index, e) {
		if(e && e.getTarget().classList.contains('nib')){
			this.GroupActions.addContact(record.get('Username') );
		}
	},

    // Old Logic for the popup
	// rowHover: function(view, record, item, wait) {
	// 	// this.startPopupTimeout(view, record, item, 500);
	// },
	//
	// startPopupTimeout: function(view, record, item, wait) {
	// 	function fin(pop) {
	// 		// If the popout is destroyed, clear the activeTargetDom,
	// 		// that way we will be able to show the popout again.
	// 		if (!pop) {
	// 			return;
	// 		}
	// 		pop.on('destroy', function() {
	// 			delete me.activeTargetDom;
	// 		});
	// 	}
	//
	// 	var popout = NextThought.app.account.contacts.management.Popout,
	// 		el = Ext.get(item), me = this;
	//
	// 	if (!record || me.activeTargetDom === Ext.getDom(Ext.fly(item))) {
	// 		return;
	// 	}
	//
	// 	me.cancelPopupTimeout();
	// 	me.hoverTimeout = Ext.defer(function() {
	// 		Ext.fly(item).un('mouseout', me.cancelPopupTimeout, me, {single: true});
	// 		popout.popup(record, el, item, [-1, 0], fin);
	// 		me.activeTargetDom = Ext.getDom(Ext.fly(item));
	// 	}, wait);
	//
	// 	Ext.fly(item).on('mouseout', me.cancelPopupTimeout, me, {single: true});
	// },
	//
	//
	// cancelPopupTimeout: function() {
	// 	clearTimeout(this.hoverTimeout);
	// },

	buildStore: function() {
		var flStore = this.GroupStore.getFriendsList();
		this.store = new NextThought.store.UserSearch({
			filters: [
				//filter out communities, lists, groups and yourself. Just return users.
				function(rec) {
					return rec.get('Username') !== $AppConfig.contactsGroupName;
				},
				function(rec) {
					return !rec.isCommunity;
				},
				function(rec) {
					return !isMe(rec);
				},
				function(rec) {
					return rec.get('ContainerId') === 'Users';
				}
			],
			sorters: [
				{
					//Put contacts first
					sorterFn: function(a, b) {
						var c = flStore.find('Username', a.get('Username')),
							d = flStore.find('Username', b.get('Username'));
						return c === d ? 0 : c ? -1 : 1;
					},
					direction: 'ASC'
				},
				{
					//Sort, next, by displayName
					property: 'displayName',
					direction: 'ASC'
				}
			]
		});
	}
});
