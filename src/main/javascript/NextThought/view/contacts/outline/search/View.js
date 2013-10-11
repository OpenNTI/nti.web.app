Ext.define('NextThought.view.contacts.outline.search.View', {
	extend: 'Ext.view.View',
	alias: 'widget.contact-search-overlay',

	preserveScrollOnRefresh: true,
	overItemCls: 'over',
	itemSelector: '.contact-row',
	tpl: new Ext.XTemplate(Ext.DomHelper.markup({ tag: 'tpl', 'for': '.', cn: [
		{ cls: 'contact-row {[this.isContact(values)]}', cn: [
			{ tag: 'tpl', 'if': 'values.Presence', cn: { cls: 'presence {Presence.name}' }},
			{ tag: 'tpl', 'if': '!values.Presence', cn: { cls: 'presence' }},
			{ cls: 'nib' },
			{ cls: 'avatar', style: {backgroundImage: 'url({avatarURL})'} },
			{ cls: 'wrap', cn: [
				{ cls: 'name', html: '{displayName}' },
				{ cls: 'status', html: '{status}' }
			]}
		]}
	]}), {
		isContact: function(values) {
			var a = Ext.getStore('all-contacts-store'),
				o = Ext.getStore('online-contacts-store');
			return (values.Class !== 'User' || o.contains(values.Username) || a.contains(values.Username))
				? 'contact' : 'not-contact';
		}
	}),

	emptyText: Ext.DomHelper.markup({cls: 'empty-list', html: 'No users found.'}),
	cls: 'contact-search',
	listeners: {
		itemclick: 'rowClicked',
		itemmouseenter: 'rowHover',
		select: function(s, record) {
			s.deselect(record);
		}
	},


	constructor: function(config) {
		this.buildStore();
		this.callParent(arguments);
	},

	rowClicked: function(view, record, item, index, e) {
		var i = Ext.fly(item),
			el = i.down('.avatar');
		//NextThought.view.account.contacts.management.Popout.popup(record,el,item,[-1, 0]);
		//if they aren't a contact show the card
		if( i.hasCls('not-contact') && e.getTarget('.nib')){
			e.stopPropagation();
			this.startPopupTimeout(view, record, item, 0);
			return;
		}

		this.cancelPopupTimeout();
		this.fireEvent('chat', record);
		if (!Ext.is.iPad) {
			this.startPopupTimeout(view, record, item, 2000);
		}
	},


	rowHover: function(view, record, item, wait) {
		this.startPopupTimeout(view, record, item, 500);
	},

	startPopupTimeout: function(view, record, item, wait) {
		function fin(pop) {
			// If the popout is destroyed, clear the activeTargetDom,
			// that way we will be able to show the popout again.
			if (!pop) {
				return;
			}
			pop.on('destroy', function() {
				delete me.activeTargetDom;
			});
		}

		var popout = NextThought.view.account.contacts.management.Popout,
			el = Ext.get(item), me = this;

		if (!record || me.activeTargetDom === Ext.getDom(Ext.fly(item))) {
			return;
		}

		me.cancelPopupTimeout();
		me.hoverTimeout = Ext.defer(function() {
			Ext.fly(item).un('mouseout', me.cancelPopupTimeout, me, {single: true});
			popout.popup(record, el, item, [-1, 0], fin);
			me.activeTargetDom = Ext.getDom(Ext.fly(item));
		}, wait);

		Ext.fly(item).on('mouseout', me.cancelPopupTimeout, me, {single: true});
	},


	cancelPopupTimeout: function() {
		clearTimeout(this.hoverTimeout);
	},


	buildStore: function() {
		var flStore = Ext.getStore('FriendsList');
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
						return c === d
							? 0
							: c ? -1 : 1;
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
