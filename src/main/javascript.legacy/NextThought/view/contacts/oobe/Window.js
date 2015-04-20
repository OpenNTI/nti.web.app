Ext.define('NextThought.view.contacts.oobe.Window', {
	extend: 'NextThought.view.window.Window',
	alias: 'widget.oobe-contact-window',

	requires: [
		'NextThought.layout.component.Natural'
	],

	cls: 'contacts-oobe-window',
	width: 750,
	height: 550,
	autoShow: true,
	resizable: false,
	draggable: false,
	modal: true,
	dialog: true,

	componentLayout: 'natural',
	layout: 'auto',
	items: [],

	childEls: ['body'],
	getTargetEl: function() {
		return this.body;
	},

	renderTpl: Ext.DomHelper.markup([
		{
			id: '{id}-body', cls: 'container-body', html: '{%this.renderContainer(out,values)%}'
		},
		{
			cls: 'error', cn: [
			{cls: 'label'},
			{cls: 'message'}
		]
		},
		{
			cls: 'footer', cn: [
				{tag: 'a', cls: 'button cancel', role: 'button', html: '{{{NextThought.view.contacts.oobe.Window.cancel}}}'},
				{tag: 'a', cls: 'button confirm disabled', role: 'button', html: '{{{NextThought.view.contacts.oobe.Window.add}}}'}
			]
		}
	]),

	renderSelectors: {
		footerEl: '.footer',
		cancelEl: '.footer a.cancel',
		confirmEl: '.footer a.confirm',

		errorEl: '.error',
		errorLabelEl: '.error .label',
		errorMessageEl: '.error .message'
	},


	getDockedItems: function() { return []; },


	listeners: {
		afterRender: 'center'
	},


	initComponent: function() {
		this.callParent();
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
			]
		});

		var me = this;

		this.add({
			xtype: 'simpletext',
			placeholder: getString('NextThought.view.contacts.oobe.Window.placeholder'),
			listeners: {
				scope: this,
				buffer: 400,
				changed: 'onSearch',
				clear: 'reset'
			}
		},{
			xtype: 'dataview',
			store: this.store,
			preserveScrollOnRefresh: true,
			flex: 1,

			overflowX: 'hidden',
			overflowY: 'auto',

			selModel: {
				allowDeselect: true,
				mode: 'SIMPLE',
				pruneRemoved: false
			},

			cls: 'oobe-contact-results',
			overItemCls: 'over',
			itemSelector: '.item',

			tpl: Ext.DomHelper.markup({
				tag: 'tpl', 'for': '.', cn: [
					{ cls: 'item', cn: [
						{tag: 'img', src: Ext.BLANK_IMAGE_URL, style: {backgroundImage: 'url({avatarURL})'}},
						{cls: 'name', html: '{displayName}'}
					]}
				]
			}),

			noContactsEmptyText: Ext.DomHelper.markup({
				cls: 'empty',
				cn: [
					{ tag: 'h3', html: getString('NextThought.view.contacts.oobe.Window.no-suggestions') },
					{ html: getString('NextThought.view.contacts.oobe.Window.lookup') }
				]
			}),

			normalEmptyText: Ext.DomHelper.markup({
				cls: 'empty',
				cn: [
					{ tag: 'h3', html: getString('NextThought.view.contacts.oobe.Window.noresult') },
					{ html: getString('NextThought.view.contacts.oobe.Window.tryagain') }
				]
			}),

			friendsListStore: Ext.getStore('FriendsList'),

			xhooks: {
				getViewRange: function() {
					var range = this.callParent(),
						a = me.down('simpletext').getValue() || !Ext.isEmpty(this.friendsListStore.getContacts());//This should probably be optimized.

					this.emptyText = a ? this.normalEmptyText : this.noContactsEmptyText;

					return range;
				}
			},

			listeners: {
				scope: this,
				selectionchange: 'onSelectionChange'
			}
		});

		Ext.defer(this.reset, 1, this);
	},


	reset: function() {
		this.store.search('.');
	},


	afterRender: function() {
		var me = this;
		me.callParent(arguments);
		me.mon(me.cancelEl, 'click', 'close');
		me.mon(me.confirmEl, 'click', 'onConfirm');

		this.errorEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.errorEl.hide();
	},


	onSearch: function(query) {
		this.store.search(query || '.');
	},


	hideError: function() {
		this.updateContentHeight();
		this.errorEl.hide();
	},


	showError: function(message, label) {
		var el = this.getTargetEl(),
			errorEl = this.errorEl;

		function syncHeight() {
			if (!errorEl || !errorEl.getY || !el || !el.getY) {
				return;
			}
			var h = errorEl.getY() - el.getY();
			el.setHeight(h);
		}

		this.errorLabelEl.update(label || getString('NextThought.view.contacts.oobe.Window.error'));
		this.errorMessageEl.update(message || '');

		errorEl.show();
		Ext.defer(syncHeight, 1);
	},


	onSelectionChange: function(sel, recs) {
		var e = this.confirmEl,
			plural = (recs || []).length !== 1;
		if (e) {
			e[Ext.isEmpty(recs) ? 'addCls' : 'removeCls']('disabled');
			e.update(getString('NextThought.view.contacts.oobe.Window.addcontacts'));
		}
	},


	onConfirm: function(e) {
		e.stopEvent();
		var me = this,
			v = me.down('dataview'),
			selMod = v && v.getSelectionModel(),
			t = e.getTarget('.confirm:not(.disabled)');

		function finish(success) {
			if (me.el && me.el.dom) {
				me.el.unmask();
			}

			if (success !== false) {
				me.close();
			} else {
				me.showError(getString('NextThought.view.contacts.oobe.Window.couldntsave'));
			}
		}
		if (t && selMod) {
			me.el.mask(getString('NextThought.view.contacts.oobe.Window.saving'));
			me.fireEvent('add-contacts', selMod.getSelection(), finish);
		}
	}
});

