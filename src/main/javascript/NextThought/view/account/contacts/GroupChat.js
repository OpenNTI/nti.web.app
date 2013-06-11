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


	getSnippet: function(value){
		//Truncate long names.
		return Ext.String.ellipsis(value, 15);
	},


	isToken: function(text) { return !Ext.isEmpty(text); },


	syncListHeight: function(callCount){
		var h = this.el.getHeight() - (this.tokensEl.getHeight() + this.buttonsEl.getHeight());
		this.listEl.setHeight(h);
		if(h < 0){
			if(callCount > 2){
				console.warn('Running away?');
				return;
			}
			Ext.defer(this.syncListHeight,100,this,[(callCount||1)+1]);
		}
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
			t;

		e.stopPropagation();
		clearTimeout(this.searchTimeout);

		if(key === e.BACKSPACE && !val) {
			t = this.el.query('.token').last();
			if(t){ Ext.fly(t).remove(); }
			e.stopEvent();
			return false;
		}

		if(key === e.ESC){
			this.reset();
		}

		this.searchTimeout = Ext.defer(this.search,250,this);
		return true;
	},


	reset: function(){
		this.inputEl.dom.value = '';
		this.updatePlaceholderLabel();
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

		this.setPlaceholderText(has ? 'Add' : this.initialConfig.placeholder);
		this.startEl[has?'removeCls':'addCls']('disabled');
	}
});
