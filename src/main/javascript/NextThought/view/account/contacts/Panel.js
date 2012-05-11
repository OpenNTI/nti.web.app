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
		var itemsShown = 0;
		if(this.showCount){
			Ext.each(this.items.items, function(x){
				if (!x.hidden){itemsShown++;}
			}, this);

			title = Ext.String.format('{0} ({1})',title,itemsShown);
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
		var existing = this.getUser(user);
		if (existing){
			this.remove(existing, true);
			this.updateTitle();
		}
	},

	addUser: function(user, changes, hideIfNoActivity) {
		var widget, item, ct, elapsed;

		if (!this.getUser(user)) {
			widget = {xtype:'contact-card', user: user, username: user.get('Username'), items:[]};

			if (!changes) {changes = [];}
			Ext.each(changes, function(c){
				ct = c.get('ChangeType');
				item = c.get('Item');
				elapsed = item ? Ext.Date.getElapsed(item.get('Last Modified')) : null;
				if (ct !== 'Circled' && elapsed && elapsed <=  1800000) { //newer than 30 min
					widget.items.push({
						item: item,
						type: item.getModelName(),
						message: this.getMessage(c),
						ContainerId: item.get('ContainerId')
					});
				}
			}, this);

			//So now we have the widgets created and in the card, we need to sort them so newest first:
			Ext.Array.sort(widget.items, function(a, b){
				var d1 = Ext.Date.format(a.item.get('Last Modified'), 'U');
				var d2 = Ext.Date.format(b.item.get('Last Modified'), 'U');
				return d2-d1;
			});

			//if this widget has no activity, hide it but still add it so we can find it later
			if (hideIfNoActivity && widget.items.length === 0) {
				widget.hidden = true;
			}

			//Add and update title
			this.add(widget);
			this.updateTitle();
		}
	},

	getUser: function(user) {
		return this.down('[username='+user.get('Username')+']');
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
		var me = this,
			widget = me.down('[username='+username+']'),
			item = change.get('Item'),
			ct = change.get('ChangeType');

		if (!widget) {
			UserRepository.prefetchUser(username, function(u){
				me.addUser(u[0], [change], true);
			});
			return;
		}

		if (ct!=='Circled'){
			widget.insert(0, {
				type: item.getModelName(),
				message: this.getMessage(change),
				ContainerId: item.get('ContainerId')
			});
			this.insert(0, widget);//move?
			widget.setVisible(true);

		}
	}


});
