Ext.define('NextThought.view.account.contacts.View', {
	extend: 'Ext.view.View',
	alias: 'widget.contacts-view',
	requires: [
		'NextThought.view.account.contacts.GroupChat'
	],

	title: 'Chat',
	tabConfig: {
		tooltip: getString('NextThought.view.account.contacts.View.tooltip')
	},

	store: 'online-contacts-store',

	iconCls: 'contacts',
	ui: 'contacts',
	cls: 'contacts-view scrollable',
	preserveScrollOnRefresh: true,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'contact-list'},
		{ cls: 'button-row', cn: [
			{cls: 'search', html: '{{{NextThought.view.account.contacts.View.search}}}', cn: [
				{tag: 'input', type: 'text'/*, placeholder:'Search'*/},
				{cls: 'clear', style: {display: 'none'}}
			] },
			{cls: 'group-chat', html: '{{{NextThought.view.account.contacts.View.group-chat}}}' }
		]}
	]),

	renderSelectors: {
		buttonRow: '.button-row',
		searchButton: '.button-row .search',
		groupChatButton: '.button-row .group-chat',
		clearNib: '.button-row .search .clear',
		searchField: '.button-row .search input',
		frameBodyEl: '.contact-list'
	},

	listeners: {
		click: {
			element: 'el',
			fn: 'onClickRaw'
		},
		itemclick: 'rowClicked',
		itemmouseenter: 'rowHover',
		select: function(s, record) {
			s.deselect(record);
		},
		'chat-dock-update-count': 'updateBadge'
	},

	getTargetEl: function() {
		return this.frameBodyEl;
	},

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
				return (values.Class !== 'User' || o.contains(values.Username) || a.contains(values.Username)) ?
					'contact' : 'not-contact';
			}
		}),


	constructor: function() {
		this.normalEmptyText = Ext.DomHelper.markup({
			cls: 'empty-list rhp-empty-list',
			html: 'None of your contacts are online.'
		});

		this.noContactsEmptyText = Ext.DomHelper.markup({
			cls: 'rhp-no-contacts',
			cn: [
				{ html: getString('NextThought.view.account.contacts.View.no-contacts') },
				{ tag: 'a', cls: 'button', role: 'button', href: '#', html: getString('NextThought.view.account.contacts.View.add-contacts') }
			]
		});

		this.offlineEmptyText = Ext.DomHelper.markup({
			cls: 'empty-list rhp-empty-list',
			html: '{{{NextThought.view.account.contacts.View.offline}}}'
		});

		this.friendsListStore = Ext.getStore('FriendsList');

		this.doSearch = Ext.Function.createBuffered(this.doSearch, 250, this, null);
		this.callParent(arguments);
	},


	onClickRaw: function(e) {
		if (e.getTarget('a.button')) {
			this.mon(Ext.widget('oobe-contact-window'), 'destroy', 'refresh');
		}
	},


	getViewRange: function() {
		var range = this.callParent(),
				a = !Ext.isEmpty(this.friendsListStore.getContacts()),
				online = $AppConfig.userObject.getPresence().isOnline();//This should probably be optimized.

		if (a) {
			this.emptyText = online ? this.normalEmptyText : this.offlineEmptyText;
		}else {
			this.emptyText = this.noContactsEmptyText;
		}

		return range;
	},


	addBadge: function() {
		var tab = this.tab;

		if (!tab.rendered) {
			if (!tab.isListening('afterrender', this.addBadge, this)) {
				tab.on('afterrender', this.addBadge, this);
			}
			return;
		}
		this.badge = Ext.DomHelper.append(tab.getEl(), {cls: 'badge', html: tab.badge}, true);
		delete tab.badge;
	},


	getBadge: function() {
		if (!this.badge) {
			this.addBadge();
		}
		return this.badge;
	},


	updateBadge: function(count) {
		var b = this.getBadge(),
				v = count || '';

		if (!b) {
			this.tab.badge = v;
		}
		else {
			b.update(v);
		}
	},


	rowClicked: function(view, record, item, index, e) {
		var i = Ext.fly(item),
			el = i.down('.avatar');
		//NextThought.view.account.contacts.management.Popout.popup(record,el,item,[-1, 0]);
		//if they aren't a contact just show the card
		if (i.hasCls('not-contact') && e.getTarget('.nib')) {
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
				el = Ext.fly(item).down('.avatar'), me = this;

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


	onSearchClick: function() {
		this.buttonRow.addCls('search');
		this.searchField.focus();
	},


	onSearchBlur: function() {
		var v = this.searchField.getValue();
		if (Ext.isEmpty(v)) {
			this.removeCls('searching');
			this.buttonRow.removeCls('search');
			this.clearNib.hide();
		}
		if (Ext.is.iPad) {
			window.scrollTo(0, 0);
		}
	},


	clearClicked: function(e) {
		if (e) {
			e.stopEvent();
		}

		this.searchField.dom.value = '';
		this.onSearchBlur();

		return false;
	},


	onSearchKeyPressed: function(e) {
		if (e.ESC === e.getKey()) {
			this.clearClicked();
		}

		var v = this.searchField.getValue();
		this.clearNib[Ext.isEmpty(v) ? 'hide' : 'show']();

		if (this.lastSearchValue !== v) {
			this.lastSearchValue = v;
			this.doSearch(v);
		}
	},


	doSearch: function(v) {
		var fn = 'removeAll',
				action = 'removeCls',
				param = false;

		if (!Ext.isEmpty(v)) {
			action = 'addCls';
			fn = 'search';
			param = v;
		}

		this[action]('searching');
		this.searchStore[fn](param);
	},


	afterRender: function() {
		var store = this.store,
				flStore = Ext.getStore('FriendsList');

		this.callParent(arguments);
		this.searchStore = new NextThought.store.UserSearch({
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
						var c = store.contains(a.get('Username')),
								d = store.contains(b.get('Username'));
						return c === d ?
							0 :
							c ? -1 : 1;
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

		this.clearNib.setVisibilityMode(Ext.Element.DISPLAY);
		this.mon(this.clearNib, 'click', 'clearClicked', this);

		this.contactSearch = Ext.widget('dataview', {
			preserveScrollOnRefresh: true,
			store: this.searchStore,
			overItemCls: this.overItemCls,
			itemSelector: this.itemSelector,
			tpl: this.tpl,
			emptyText: Ext.DomHelper.markup({cls: 'empty-list', html: '{{{NextThought.view.account.contacts.View.empty-list}}}'}),
			renderTo: this.el,
			cls: 'contact-search',
			listeners: {
				scope: this,
				itemclick: 'rowClicked',
				itemmouseenter: 'rowHover',
				select: function(s, record) {
					s.deselect(record);
				}
			}
		});

		if (Ext.is.iOS) {
			var me = this;
			this.searchButton.down('input').on('keypress', function() {
				Ext.defer(function() {
					me.contactSearch.setHeight(160);
					me.contactSearch.setY(424);
					me.contactSearch.el.setRight(0);
				},500);
			});
			this.searchButton.down('input').on('focus', function() {
				me.contactSearch.setHeight(160);
				me.contactSearch.setY(424);
				me.contactSearch.el.setRight(0);
			});
			this.searchButton.down('input').on('blur', function() {
				me.contactSearch.setHeight(526);
				me.contactSearch.setY(58);
				me.contactSearch.el.setRight(0);
			});
		}

		this.mon(Ext.getStore('PresenceInfo'), 'presence-changed', function(username, presence) {
			if (isMe(username)) {
				if (presence.isOnline()) {
					this.bindStore('online-contacts-store');
				}else {
					this.bindStore('ext-empty-store');
				}
			}
		}, this);

		this.mon(this.store, {
			scope: this.contactSearch,
			datachanged: 'refresh'
		});

		this.mon(flStore, {
			scope: this.contactSearch,
			'update': 'refresh'
		});

		this.mon(this.searchButton, {
			scope: this,
			click: 'onSearchClick'
		});

		this.mon(this.searchField, {
			scope: this,
			blur: 'onSearchBlur',
			keyup: 'onSearchKeyPressed',
			contextmenu: function(e) {
				e.stopPropagation();
			} //allow context on simple texts
		});

		this.activateGroupChatFeature();
	},


	activateGroupChatFeature: function() {
		this.groupChat = Ext.widget('contacts-group-chat-initiator', {
			renderTo: this.el,
			searchTpl: this.tpl,
			searchOverItemCls: this.overItemCls,
			searchItemSelector: this.itemSelector
		});

		this.groupChat.hide();
		this.mon(this.groupChatButton, 'click', 'show', this.groupChat);
		this.mon(this.groupChat, {
			scope: this.groupChat,
			cancel: 'hide',
			'adhock-chat': 'hide'
		});
	}
});
