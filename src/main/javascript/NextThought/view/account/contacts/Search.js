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
			items: {xtype: 'simpletext', placeholder: 'Search...' }
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
		this.store.filter({ fn: function(rec){ return !rec.isGroup; } });
		this.store.filter({ fn: function(rec){ return !rec.isCommunity; }});
		this.view = this.down('dataview');
		this.view.bindStore( this.store );

		this.mon(this.view,{
			scope: this,
			itemclick: this.itemClicked
		});

		this.mon(Ext.getStore('FriendsList'),{
			scope: this.view,
			load: this.view.refresh,
			datachanged: this.view.refresh
		});

		this.mon(this.down('simpletext'),{
			scope: this,
			changed: this.search,
			clear: this.clear
		});



	},


	itemClicked: function(view,record,item,index, e){
//		var clickedAdd = Boolean(e.getTarget('.add'));
		var pop = Ext.widget('add-contact-popout',{record: record});

		pop.show();
		pop.alignTo(Ext.fly(item).down('.add'),'tr-tl',[-10,-25]);
		pop.mon(this,'hide',pop.destroy,pop,{signle: true});//if we hide, make the popover listen and destroy
	},


	search: function(value){
		if(!value || value.replace(SearchUtils.trimRe,'').length < 2 ){
			this.clear();
		}
		else {
			this.store.search(value);
		}
	},

	clear: function(){
		this.store.removeAll();
	}
});
