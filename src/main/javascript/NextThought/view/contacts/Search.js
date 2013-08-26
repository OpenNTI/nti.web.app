//CSS in _contact-search.scss
Ext.define('NextThought.view.contacts.Search', {
	extend: 'Ext.container.Container',
	alias: 'widget.contact-search',
	requires: [
		'NextThought.view.form.fields.SimpleTextField',
		'NextThought.view.account.contacts.management.Popout'
	],

	floating: true,
	shadow: false,
	preventBringToFront: true,

	cls: 'contact-search',

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	items: [
		{
			xtype: 'container',
			cls: 'search-field',
			items: {xtype: 'simpletext', placeholder: 'Search for contacts...' }
		},
		{
			xtype: 'dataview',
			preserveScrollOnRefresh: true,
			flex: 1,

			overflowX: 'hidden',
			overflowY: 'auto',

			allowDeselect: false,
			singleSelect: true,

			cls: 'search-results',
			overItemCls: 'over',
			itemSelector: 'div.item-wrap',

			tpl: new Ext.XTemplate(Ext.DomHelper.markup({
				tag: 'tpl', 'for': '.',
				cn: [
					{
						cls: 'item-wrap',
						cn: [
							{
								cls: 'item {[this.isContact(values.Username)]}',
								cn: [
									{tag: 'img', src: '{avatarURL}'},
									{tag: 'img', src: Ext.BLANK_IMAGE_URL, cls: 'add'},
									{
										cls: 'text-wrap',
										cn: [
											{cls: 'name', html: '{displayName}'},
											{cls: 'affiliation', html: '{affiliation-dontshowthis}'}
										]
									}
								]
							}
						]
					}
				]
			}), {
				isContact: function (username) {
					if (!this.contactsList || (new Date() - (this.lastUsed || 0)) > 0) {
						this.contactsList = Ext.getStore('FriendsList').getContacts();
						this.lastUsed = new Date();
					}
					return Ext.Array.contains(this.contactsList, username) ? 'my-contact' : 'not-in-contacts';
				}
			})
		}
	],


	initComponent: function () {
		this.callParent(arguments);
		this.store = new NextThought.store.UserSearch({
			filters: [
				//filter out communities, lists, groups and yourself. Just return users.
				function (rec) {
					return rec.get('Username') !== $AppConfig.contactsGroupName;
				},
				function (rec) {
					return !rec.isCommunity;
				},
				function (rec) {
					return !isMe(rec);
				},
				function (rec) {
					return rec.get('ContainerId') === 'Users';
				}
			]});
		this.view = this.down('dataview');
		this.view.bindStore(this.store);

		this.mon(this.view, {
			scope: this,
			itemclick: this.itemClicked,
			containerclick: this.escape
		});

		this.mon(Ext.getStore('FriendsList'), {
			scope: this.view,
			'contacts-updated': this.view.refresh
		});

		this.mon(this.down('simpletext'), {
			scope: this,
			changed: this.search,
			clear: this.clearResults
		});
	},


	destroy: function () {
		Ext.getBody().un('click', this.detectBlur, this);
		this.callParent(arguments);
	},


	afterRender: function () {
		var me = this;
		me.callParent(arguments);
		Ext.defer(function () {
			Ext.getBody().on('click', me.detectBlur, me);
		}, 1);

		if (Ext.is.iPad) {
			// Absorb event for scrolling
			this.getEl().dom.addEventListener('touchmove', function (e) {
				e.stopPropagation();
			});

			// Window should scroll back to top after keyboard is dismissed
			me.mon(me.el.down('input'), {
				blur: function () {
					window.scrollTo(0, 0);
					me.setHeight(Ext.Element.getViewportHeight() - me.getPosition()[1]);
				}
			});
		}
	},


	detectBlur: function (e) {
		if (e.getTarget('.search') || e.getTarget('.contact-search')) {
			return;
		}

		if (!this.down('simpletext').getValue()) {
			this.hide();
		}
	},


	escape: function () {
		this.hide();
	},


	itemClicked: function (view, record, item) {
		var add = Ext.fly(item).down('.add');
		NextThought.view.account.contacts.management.Popout.popup(record, add, item, [-10, -18]);
	},


	//We buffer this slightly to avoid unecessary searches
	search: Ext.Function.createBuffered(function (value) {
		if (!value || value.replace(SearchUtils.trimRe, '').length < 2) {
			this.clearResults();
		}
		else {
			this.setHeight(Ext.Element.getViewportHeight() - this.getPosition()[1]);
			this.store.search(value);
		}
	}, 250),


	clearResults: function () {
		this.setHeight(52);
		this.store.removeAll();
	}
});
