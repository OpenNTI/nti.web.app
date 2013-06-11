Ext.define('NextThought.view.account.contacts.GroupChat',{
	extend: 'NextThought.view.form.fields.TagField',
	alias: 'widget.contacts-group-chat-initiator',

	cls: 'group-chat-initiator',
	ui: 'group-chat',
	placeholder: 'Add people or groups to chat',

	renderTpl: Ext.DomHelper.markup([
		{ id: '{id}-list' },
		{ id: '{id}-tokens', cls: 'x-component-tokens user-token-field', cn: {
			cls: 'tokens',
			cn: { tag:'span', cls:'inputArea', cn:[
					{tag:'span', cls:'plus'},
					{tag:'span', cls:'token-input-wrap', cn:[
						{tag:'input', type:'text', tabIndex: '{tabIndex}', placeholder: '{placeholder}'},
						{tag:'span', cls:'token-input-sizer', html:'{placeholder}##'}
					]}
				]
			}
		}},
		{ id:'{id}-buttons', cn: [
			{ cls: 'cancel', html: 'Cancel' },
			{ cls: 'start disabled', html: 'Start Chat' }
		]}
	]),


	tokenTpl: Ext.DomHelper.createTemplate({tag: 'span', cls:'token {type}', 'data-username':'{username}', cn:[
		{tag:'span', cls:'value', html:'{text}', 'data-value':'{value}'},
		{tag:'span', cls:'x'}
	]}),


	renderSelectors: {
		listEl: 'div[id$=list]',
		tokensEl: 'div[id$=tokens]',
		buttonsEl: 'div[id$=buttons]',
		tokenInsertPoint: 'div[id$=tokens] .tokens .inputArea',
		startEl: 'div[id$=buttons] .start'
	},


	initComponent: function(){
		this.callParent(arguments);
		this.on({
			scope: this,
			'token-added': 'updateState',
			'token-removed': 'updateState'
		});
	},


	hasTokens: function(){
		return this.el.query('.token').length > 0;
	},


	handleBlur: function(){

	},


	getType: function(modelData){ return NextThought.model.UserSearch.getType(modelData); },


	getInsertionPoint: function(){ return this.tokenInsertPoint; },


	addToken: function(record){
		var value = record && record.get('displayName'),
			type = this.getType(record.getData());

		if(this.isToken(value)){
			if(this.addTag(value, type,{username:record.getId()})){
				this.fireEvent('token-added',record.getId());
			}
		}
	},


	removeToken: function(record){
		var el = this.el.down('span[data-username="'+record.getId()+'"]');
		if(el){
			el.remove();
			this.fireEvent('token-removed',record.getId());
		}

		return Boolean(el);
	},


	onBeforeRemoveToken: function(token){
		var id = token && token.getAttribute('data-username');
		if(!Ext.isEmpty(id)){
			this.deselectId(id);
		}
	},


	deselectId: function(id){
		var recs = this.contactSearch.getSelectionModel().getSelection(),
			rec;

		Ext.each(recs,function(r){
			if(r.getId() === id){
				rec = r;
			}
		});

		if(rec){
			this.contactSearch.getSelectionModel().deselect(rec);
		}
	},


	getSnippet: function(value){
		//Truncate long names.
		return Ext.String.ellipsis(value, 15);
	},


	isToken: function(text) { return !Ext.isEmpty(text); },


	syncListHeight: function(){
		var h = this.tokensEl.getHeight() + this.buttonsEl.getHeight();
		this.listEl.setStyle({bottom:h});
	},


	afterRender: function(){
		this.callParent(arguments);

		var contacts = Ext.getStore('all-contacts-store');

		this.searchStore = new NextThought.store.UserSearch({
			filters:[
				function(rec){ return rec.getId() !== $AppConfig.contactsGroupName; },
				function(rec){ return !rec.isCommunity; },
				function(rec){ return !isMe(rec); }
			],
			sorters:[{
				//Put contacts first
				sorterFn: function(a,b){
					var c = contacts.contains(a.get('Username')),
						d = contacts.contains(b.get('Username'));
					return c === d
							? 0
							: c ? -1 : 1;
				},
				direction: 'ASC'
			},{
				//Sort, next, by displayName
				property: 'displayName',
				direction: 'ASC'
			}]
		});

		this.contactSearch = Ext.widget('dataview',{
			simpleSelect: true,
			store: this.searchStore,
			overItemCls: this.searchOverItemCls,
			itemSelector: this.searchItemSelector,
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
	},


	itemDeselect: function(v,rec){
		this.removeToken(rec);
	},


	itemSelect: function(v,rec){
		this.addToken(rec);
	},


	onKeyDown: function(e){
		var key = e.getKey(),
			val = this.inputEl.getValue(),
			t, id;

		e.stopPropagation();
		clearTimeout(this.searchTimeout);

		if(key === e.BACKSPACE && !val) {
			t = this.el.query('.token').last();
			if(t){
				id = t.getAttribute('data-username');
				Ext.fly(t).remove();
				this.deselectId(id);
			}
			e.stopEvent();
			return false;
		}

		if(key === e.ESC){
			this.reset();
		}

		this.searchTimeout = Ext.defer(this.search,250,this);
		return true;
	},


	onClick: function(e){
		var inButtons = Boolean(e.getTarget('div[id$=buttons]'));

		if(!inButtons){
			return this.callParent(arguments);
		}

		if(e.getTarget('.cancel')){
			this.reset(true);
			this.fireEvent('cancel');
		}
		else if(e.getTarget('.start') && !this.startEl.hasCls('disabled')){
			this.fireEvent('group-chat', this.getOccupantsList());
			this.reset(true);
		}

		e.stopEvent();
		return false;
	},


	getOccupantsList: function(){
		var list = [];
		this.el.select('.token').each(function(e){
			list.push(e.getAttribute('data-username'));
		});
		console.log(list.join(', '));
		return list;
	},


	reset: function(destructive){
		this.inputEl.dom.value = '';
		if(destructive){
			this.el.select('.token').remove();
			this.listEl.setScrollTop(0);
			this.contactSearch.getSelectionModel().deselectAll(true);
		}

		this.updateState();
	},


	search: function(){
		if(!this.inputEl){
			return;
		}

		var value = (this.inputEl.getValue() || '').replace(SearchUtils.trimRe,'');
		if(value !== this.lastSearchValue){
			this.lastSearchValue = value;
			this.searchStore.search(value);
		}
	},


	updateState: function(){
		var has = this.hasTokens();

		this.setPlaceholderText(has ? 'Add' : this.self.prototype.placeholder);
		this.startEl[has?'removeCls':'addCls']('disabled');
	}
});
