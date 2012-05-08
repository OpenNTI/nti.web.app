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

	addUser: function(user, changes) {
		var widget, item, ct;

		if (!this.hasUser(user)) {
			widget = Ext.widget('contact-card', {user: user, username: user.get('Username')});

			if (!changes) {changes = [];}
			Ext.each(changes, function(c){
				ct = c.get('ChangeType');
				item = c.get('Item');
				if (ct !== 'Circled') {
					widget.add({type: item.getModelName(), message: this.getMessage(c), ContainerId: item.get('ContainerId')});
				}
			}, this);

			this.add(widget);
			this.updateTitle();
		}
	},

	hasUser: function(user) {
		return !!(this.down('[username='+user.get('Username')+']'));
	},


	getMessage: function(change) {
		var item = change.get('Item'), loc, bookTitle;
		if (!item){return 'unknown';}

		if (item.getModelName() === 'Highlight') {
			loc = LocationProvider.getLocation(item.get('ContainerId'));
			return loc ? loc.label : 'Unknown';
		}
		else if (item.getModelName() === 'Note'){
			return AnnotationUtils.getBodyTextOnly(item);
		}
		else {
			console.error('Not sure what activity text to use for ', item, change);
			return 'Unknown';
		}
	},


	addActivity: function(username, change) {
		var widget = this.down('[username='+username+']'),
			item = change.get('Item'),
			ct = change.get('ChangeType');

		if (!widget) {
			console.error('Cannot add activity, no user card exists for', username);
			return;
		}

		if (ct!=='Circled'){
			widget.add({
				type: item.getModelName(),
				message: this.getMessage(change),
				ContainerId: item.get('ContainerId')
			});
		}
	}


});
