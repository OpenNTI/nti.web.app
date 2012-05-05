Ext.define('NextThought.view.account.contacts.Panel',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.contacts-panel',
	ui: 'contacts-panel',
	cls: 'contacts-panel',

	collapsible: true,
	hideCollapseTool: true,
	collapsedCls: 'collapsed',

//	componentLayout: 'body',

	frame: false,
	border: false,
	unstyled: true,
	showCount: true,
	defaultType: 'contact-card',

	initComponent: function(){
		this.callParent(arguments);
		this.setTitle(this.title);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.getHeader().on('click',this.toggleCollapse,this);
	},

	setTitle: function(title){
		if(this.showCount){
			title = Ext.String.format('{0} ({1})',title,this.items.getCount());
		}

		return this.callParent([title]);
	},

	updateTitle: function(){
		this.setTitle(this.initialConfig.title);
	},

	setUsers: function(users){
		var p = [];
		if(Ext.isArray(users)){
			Ext.each(users,function(u){ p.push({user: u}); });
		}
		else {
			Ext.Object.each(users,function(n,u){ p.push({user: u}); });
		}
		this.removeAll(true);
		this.add(p);
		this.updateTitle();
	},

	removeUser: function(user) {
		var exists = this.hasUser(user);
		if (exists){
			this.remove(exists, true);
			this.updateTitle();
		}
	},

	addUser: function(user) {
		if (!this.hasUser(user)) {
		 	this.add({user: user});
			this.updateTitle();
		}
	},

	hasUser: function(user) {
		return (this.down('[username='+user.get('Username')+']'));
	}


});
