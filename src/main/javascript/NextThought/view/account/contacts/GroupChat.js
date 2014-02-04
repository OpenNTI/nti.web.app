Ext.define('NextThought.view.account.contacts.GroupChat', {
	extend: 'NextThought.view.form.fields.TagField',
	alias: 'widget.contacts-group-chat-initiator',

	cls: 'group-chat-initiator',
	ui: 'group-chat',
	placeholder: 'Add people or groups to chat',

	renderTpl: Ext.DomHelper.markup([
		{ id: '{id}-list' },
		{ id: '{id}-tokens', cls: 'x-component-tokens user-token-field', cn: {
			cls: 'tokens',
			cn: { tag: 'span', cls: 'inputArea', cn: [
					{tag: 'span', cls: 'plus'},
					{tag: 'span', cls: 'token-input-wrap', cn: [
						{tag: 'input', type: 'text', tabIndex: '{tabIndex}', placeholder: '{placeholder}'},
						{tag: 'span', cls: 'token-input-sizer', html: '{placeholder}##'}
					]}
				]
			}
		}},
		{ id: '{id}-buttons', cn: [
			{ cls: 'cancel', html: 'Cancel' },
			{ cls: 'start disabled', html: 'Start Chat' }
		]}
	]),


	tokenTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'token {type}', 'data-username': '{username}', cn: [
		{tag: 'span', cls: 'value', html: '{text}', 'data-value': '{value}'},
		{tag: 'span', cls: 'x'}
	]}),


	renderSelectors: {
		listEl: 'div[id$=list]',
		tokensEl: 'div[id$=tokens]',
		buttonsEl: 'div[id$=buttons]',
		tokenInsertPoint: 'div[id$=tokens] .tokens .inputArea',
		startEl: 'div[id$=buttons] .start'
	},


	initComponent: function() {
		this.callParent(arguments);
		this.on({
			scope: this,
			'token-added': 'updateState',
			'token-removed': 'updateState'
		});

	},


	show: function() {
		this.callParent(arguments);
		var el = this.getFocusEl();
		Ext.defer(el.focus, 200, el);
		return this;
	},


	hasTokens: function() {
		return this.el.query('.token').length > 0;
	},


	handleBlur: function() {

	},


	getType: function(modelData) { return NextThought.model.UserSearch.getType(modelData); },


	getInsertionPoint: function() { return this.tokenInsertPoint; },


	addToken: function(record) {
		var value = record && record.get('displayName'),
			type = this.getType(record.getData());

		if (this.isToken(value)) {
			if (this.addTag(value, type, {username: record.get('Username')})) {
				this.fireEvent('token-added', record.get('Username'));
			}
		}
	},

	//Make sure all the tokens are also selected in the contacts view
	addTokensBack: function() {
		//the only time they would be out of sync is if an item had just been selected
		if (!this.fromItemSelect) { return; }

		var me = this,
			tokens = this.tokensEl.query('.token');

		delete this.fromItemSelect;

		Ext.each(tokens, function(t) {
			var username = t.getAttribute('data-username');

			me.selectId(username);
		});
	},

	removeToken: function(record) {
		var el = this.el.down('span[data-username="' + record.get('Username') + '"]');
		if (el) {
			el.remove();
			this.fireEvent('token-removed', record.get('Username'));
		}

		return Boolean(el);
	},


	onBeforeRemoveToken: function(token) {
		var id = token && token.getAttribute('data-username');
		if (!Ext.isEmpty(id)) {
			this.deselectId(id);
		}
	},


	selectId: function(id) {
		var recs = this.contactSearch.getStore().getRange(),
			rec;

		Ext.each(recs, function(r) {
			if (r.get('Username') === id) {
				rec = r;
			}
		});

		if (rec) {
			this.contactSearch.getSelectionModel().select(rec, true, true);
		}
	},


	deselectId: function(id) {
		var recs = this.contactSearch.getSelectionModel().getSelection(),
			rec;

		Ext.each(recs, function(r) {
			if (r.get('Username') === id) {
				rec = r;
			}
		});

		if (rec) {
			this.contactSearch.getSelectionModel().deselect(rec);
		}
	},


	getSnippet: function(value) {
		//Truncate long names.
		return Ext.String.ellipsis(value, 15);
	},


	isToken: function(text) { return !Ext.isEmpty(text); },


	syncListHeight: function() {
		var h = this.tokensEl.getHeight() + this.buttonsEl.getHeight();
		this.listEl.setStyle({bottom: h});
	},


	afterRender: function() {
		this.callParent(arguments);

		var data, query = '',
			online = Ext.getStore('online-contacts-store'),
			listsAndGroups = Ext.getStore('FriendsList');

		this.searchStore = new Ext.data.Store({
			model: 'NextThought.model.FriendsList',
			proxy: 'memory',
			filters: [
				function(rec) { return rec.get('Username') !== $AppConfig.contactsGroupName; },
				function(rec) { return !isMe(rec); },
				function(rec) {
					if (Ext.isEmpty(query)) {
						return !rec.isGroup;
					}

					if (rec.isDFL && !isMe(rec.get('Creator'))) {
						return false;
					}

					return !rec.hasOnline || rec.hasOnline(); },
					//This will have to do for now.
				function(rec) {
					//HACK:
					var data = [rec.get('Username'), rec.get('alias'), rec.get('realname'), rec.get('email'), (rec.get('friends') || [].join())].join();
					//TODO: resolve group memberships and search them for hits
					return Ext.isEmpty(query) || new RegExp(query, 'i').test(data);
				}
			],
			sorters: [{
				//Put users first
				sorterFn: function(a, b) {
					var c = a.isGroup,
						d = b.isGroup;
					return c === d ?
						   0 :
						   c ? 1 : -1;
				},
				direction: 'ASC'
			},{
				//Sort, next, by displayName
				property: 'displayName',
				direction: 'ASC'
			}]
		});

		this.searchStore.search = function(s) { query = s; this.filter(); };

		data = online.getRange();
		data.push.apply(data, listsAndGroups.getRange());

		function nulls(o) {return !!o;}

		this.searchStore.loadData(data);
		this.searchStore.mon(online, {
			scope: this.searchStore,
			add: function(s, r) { if (!r) {return;} this.add(r);this.filter(); },
			remove: function(s, r) {this.remove(r); }
		});

		this.searchStore.mon(listsAndGroups, {
			scope: this.searchStore,
			load: function(s, r) {
				this.add((r || []).filter(nulls));
				this.filter();
			},
			add: function(s, r) {this.add(r);this.filter();},
			remove: function(s, r) {this.remove(r);}
		});

		//Keep the store's selection model up to date with the tokens
		this.mon(this.searchStore, {
			filterchange: 'addTokensBack',
			buffer: 100
		});


		this.contactSearch = Ext.widget('dataview', {
			simpleSelect: true,
			store: this.searchStore,
			overItemCls: this.searchOverItemCls,
			itemSelector: this.searchItemSelector,
			selectedItemCls: 'checked',
			tpl: this.searchTpl,
			emptyText: Ext.DomHelper.markup({cls: 'empty-list', html: 'No users found.'}),
			renderTo: this.listEl,
			cls: 'contact-search-group-chat',
			listeners: {
				scope: this,
				deselect: 'itemDeselect',
				select: 'itemSelect'
			}
		});

		this.syncListHeight();

		if (Ext.is.iOS) {
			var me = this;
			this.el.down('.inputArea').down('input').on('keypress', function() {
				Ext.defer(function() {
					console.log('KEYPRESS');
					me.contactSearch.el.setHeight(114);
					me.contactSearch.el.setY(385);
					me.contactSearch.el.setRight(0);
				},500);
			});

			this.el.down('.inputArea').down('input').on('focus', function() {
				Ext.defer(function() {
					if (window.innerHeight < 600) {
						me.contactSearch.el.setHeight(114);
						me.contactSearch.el.setY(385);
						me.contactSearch.el.setRight(0);
					}
					else {
						me.el.down('inputArea').down('input').blur();
					}
				},250);
			});
			this.el.down('.inputArea').down('input').on('blur', function() {
				me.contactSearch.el.setHeight(401);
				me.contactSearch.el.setY(58);
				me.contactSearch.el.setRight(0);
			});

			this.mon(this.el, 'mouseover', this.mousedOver, this);
		}

	},

	mousedOver: function(e) {
		if (window.innerHeight < 600) {
			if (!this.ipadOver && e.target.className.indexOf('nib') != -1) {
				this.ipadOver = true;
				e.preventDefault();
				var touch = e.target;
				var clickEvent = document.createEvent('MouseEvents');
				clickEvent.initMouseEvent('click', true, true, window,
					1, touch.screenX, touch.screenY, touch.clientX, touch.clientY,
					false, false, false, false, 0, null);
				touch.dispatchEvent(clickEvent);
			}
			else {
				this.ipadOver = false;
			}
		}
		else {
			this.ipadOver = false;
		}
	},

	itemDeselect: function(v, rec) {
		this.removeToken(rec);
	},


	itemSelect: function(v, rec) {
		if (Ext.is.iOS) {
			var me = this;
			if (this.cantselect) {
				return;
			}
			this.cantselect = true;
			Ext.defer(function() {
				me.cantselect = false;
			},500);
		}
		this.addToken(rec);
		this.fromItemSelect = true;
		this.searchStore.search('');//clear out the search results once we select an item
	},


	onKeyDown: function(e) {
		var key = e.getKey(),
			val = this.inputEl.getValue(),
			t, id;

		e.stopPropagation();
		clearTimeout(this.searchTimeout);

		if (key === e.BACKSPACE && !val) {
			t = this.el.query('.token').last();
			if (t) {
				id = t.getAttribute('data-username');
				Ext.fly(t).remove();
				this.deselectId(id);
			}
			e.stopEvent();
			return false;
		}

		if (key === e.ESC) {
			this.reset();
		}

		this.searchTimeout = Ext.defer(this.search, 250, this);
		return true;
	},


	onClick: function(e) {
		var inButtons = Boolean(e.getTarget('div[id$=buttons]'));

		if (!inButtons) {
			return this.callParent(arguments);
		}

		if (e.getTarget('.cancel')) {
			this.reset(true);
			this.fireEvent('cancel');
		}
		else if (e.getTarget('.start') && !this.startEl.hasCls('disabled')) {
			this.fireEvent('adhock-chat', this.getOccupantsList());
			this.reset(true);
		}

		e.stopEvent();
		return false;
	},


	getOccupantsList: function() {
		var list = [];
		this.el.select('.token').each(function(e) {
			list.push(e.getAttribute('data-username'));
		});
		console.log(list.join(', '));
		return list;
	},


	reset: function(destructive) {
		this.inputEl.dom.value = '';
		if (destructive) {
			this.el.select('.token').remove();
			this.listEl.setScrollTop(0);
			this.searchStore.search();
			this.contactSearch.getSelectionModel().deselectAll(true);
		}

		this.updateState();
	},


	search: function() {
		if (!this.inputEl) {
			return;
		}

		var value = (this.inputEl.getValue() || '').replace(SearchUtils.trimRe, '');
		if (value !== this.lastSearchValue) {
			this.lastSearchValue = value;
			this.searchStore.search(value);
		}
	},


	updateState: function() {
		var has = this.hasTokens();

		this.setPlaceholderText(has ? 'Add' : this.self.prototype.placeholder);
		this.startEl[has ? 'removeCls' : 'addCls']('disabled');
	}
});
