Ext.define('NextThought.view.account.contacts.Panel',{
	extend: 'Ext.panel.Panel',
	requires: [
		'NextThought.layout.component.TemplatedContainer',
		'NextThought.view.account.contacts.Card'
	],

	alias: 'widget.contacts-panel',
	ui: 'contacts-panel',
	cls: 'contacts-panel',

	collapsible: true,
	hideCollapseTool: true,
	collapsedCls: 'collapsed',

	frame: false,
	border: false,
	unstyled: true,
	showCount: true,
	defaultType: 'contact-card',
	tools:[{
	    type:'chat',
		width: 22,
	    tooltip: 'Chat with this group',
	    handler: function(event, toolEl, panel){
			var p = panel.up('contacts-panel');
			p.fireEvent('group-chat', p.associatedGroup);
	    }
	}],

	initComponent: function(){
		if(!this.associatedGroup || !$AppConfig.service.canChat()){
			//note, not able to chat will remove ALL tools, which right now is just chat...
			this.tools = null;
		}
		this.callParent(arguments);
		this.setTitle(this.title);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.getHeader().on('click',
			function(){
				//panel collapse causes permanent failure if there are no items, avoid that.
				if (this.items.length > 0) {
					this.toggleCollapse();
				}
			}
			,this);
	},

	setTitle: function(title){
		var itemsShown = 0;

		this.title = title;

		Ext.each(this.items.items, function(x){
			if (!x.hidden){itemsShown++;}
		}, this);

		if(this.showCount){
			this.title = Ext.String.format('{0} ({1})',title,itemsShown);
		}

		if (this.rendered) {
			this.getHeader().setTitle(this.title);
		}
		return this;
//		return itemsShown===0 ? this.hide() : this.show();
	},

	updateTitle: function(){
		this.setTitle(this.initialConfig.title);
	},

	setUsers: function(users){
		var p = [],
			g = this.associatedGroup;

		if(Ext.isArray(users)){
			Ext.each(users,function(u){ p.push({user: u, group: g}); });
		}
		else {
			Ext.Object.each(users,function(n,u){ p.push({user: u, group: g}); });
		}
		this.removeAll(true);
		this.add(p);
		this.updateTitle();
	},

	removeUser: function(user) {
		var existing = this.down('[username='+user.get('Username')+']');
		if (existing){
			this.remove(existing, true);
			this.updateTitle();
		}
	}

});
