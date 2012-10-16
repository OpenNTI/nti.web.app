//CSS in _contact-search.scss
Ext.define('NextThought.view.account.contacts.Search',{
	extend: 'Ext.container.Container',
	alias: 'widget.contact-search',
	requires: [
		'NextThought.view.form.fields.SimpleTextField',
		'NextThought.view.account.contacts.management.Popout'
	],
	floating: true,

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
			flex:1,

			overflowX: 'hidden',
			overflowY: 'auto',

			allowDeselect: false,
			singleSelect: true,

			cls: 'search-results',
			overItemCls: 'over',
			itemSelector: 'div.item-wrap',

			tpl: new Ext.XTemplate(Ext.DomHelper.markup({
				tag:'tpl', 'for':'.',
				cn: [{
					cls:'item-wrap',
					cn:[{
						cls:'item {[this.isContact(values.Username)]}',
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
					}]
				}]
			}),{
				isContact: function(username){
					if( !this.contactsList || (new Date() - (this.lastUsed||0)) > 0 ){
						this.contactsList = Ext.getStore('FriendsList').getContacts();
						this.lastUsed = new Date();
					}
					return Ext.Array.contains(this.contactsList,username) ? 'my-contact':'not-in-contacts';
				}
			})
		}
	],


	initComponent: function(){
		this.callParent(arguments);
		this.store = new NextThought.store.UserSearch();
		this.store.filter([
			{ fn: function(rec){ return !rec.isGroup; } },
			{ fn: function(rec){ return !rec.isCommunity; }}
		]);
		this.view = this.down('dataview');
		this.view.bindStore( this.store );

		this.mon(this.view,{
			scope: this,
			itemclick: this.itemClicked,
			containerclick: this.escape
		});

		this.mon(Ext.getStore('FriendsList'),{
			scope: this.view,
			load: this.view.refresh,
			datachanged: this.view.refresh
		});

		this.mon(this.down('simpletext'),{
			scope: this,
			changed: this.search,
			clear: this.clearResults
		});
	},








	destroy: function(){
		Ext.getBody().un('click',this.detectBlur,this);
		this.callParent(arguments);
	},


	afterRender: function(){
		var me = this;
		me.callParent(arguments);
		Ext.defer(function(){Ext.getBody().on('click',me.detectBlur,me);},1);
	},


	detectBlur: function(e){
		if(e.getTarget('.search') || e.getTarget('.contact-search')){
			return;
		}

		if(!this.down('simpletext').getValue()){
			this.hide();
		}
	},


	escape: function(){
		this.hide();
	},












	itemClicked: function(view,record,item){
		var add = Ext.fly(item).down('img:not(.add)');


//		function show(){
			NextThought.view.account.contacts.management.Popout.popup(record,add,item,[-10,-18]);
//		}
//
//		Ext.fly(item).scrollIntoView(
//				item.parentNode,false,{diration: 500});
//
//		Ext.defer(show,500,this);
	},


	search: function(value){
		if(!value || value.replace(SearchUtils.trimRe,'').length < 2 ){
			this.clearResults();
		}
		else {
			this.setHeight(Ext.Element.getViewportHeight()-this.getPosition()[1]);
			this.store.search(value);
		}
	},

	clearResults: function(){
		this.setHeight(52);
		this.store.removeAll();
	}
});
