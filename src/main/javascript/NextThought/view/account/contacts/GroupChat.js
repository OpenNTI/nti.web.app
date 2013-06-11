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

	renderSelectors: {
		listEl: 'div[id$=list]',
		tokensEl: 'div[id$=tokens]',
		buttonsEl: 'div[id$=buttons]',
		tokenInsertPoint: 'div[id$=tokens] .tokens .inputArea'
	},


	getInsertionPoint: function(){ return this.tokenInsertPoint; },


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
			preserveScrollOnRefresh: true,
			store: this.searchStore,
			overItemCls: this.searchOverItemCls,
			itemSelector: this.searchItemSelector,
			tpl: this.searchTpl,
			emptyText: Ext.DomHelper.markup({cls: 'empty-list', html: 'No users found.'}),
			renderTo: this.listEl,
			cls: 'contact-search-group-chat'
		});

		this.syncListHeight();
		Ext.defer(this.searchStore.search, 1000, this.searchStore,['com']);
	}
});
