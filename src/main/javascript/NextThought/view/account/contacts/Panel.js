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
		if(!this.associatedGroup){
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

		return itemsShown===0 ? this.hide() : this.show();
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
		var existing = this.getUser(user);
		if (existing){
			this.remove(existing, true);
			this.updateTitle();
		}
	},

	addUser: function(user, changes, hideIfNoActivity) {
		var widget,
			group = this.associatedGroup;

		if (!this.getUser(user)) {
			widget = { group: group, user: user, username: user.get('Username'), items:[]};

			if (!changes) {changes = [];}
			Ext.each(changes, function(c){
				var item, ct, elapsed, cid;
				ct = c.get('ChangeType');
				item = c.get('Item');
				cid = item.get('ContainerId');
				elapsed = item ? Ext.Date.getElapsed(item.get('Last Modified')) : null;
				if (ct !== 'Circled' && ct !== 'Deleted' && elapsed && elapsed <=  1800000) { //newer than 30 min
					widget.items.push({
						item: item,
						type: item.getModelName(),
						message: this.getMessage(c),
						ContainerId: cid,
						ContainerIdHash: IdCache.getIdentifier(cid)
					});
				}
			}, this);

			//So now we have the widgets created and in the card, we need to sort them so newest first:
			Ext.Array.sort(widget.items, function(a, b){
				var k = 'Last Modified';
				return Number(b.item.get(k) - a.item.get(k));
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
			return item.getBodyText();
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
			cid = item ? item.get('ContainerId') : null,
			id = IdCache.getIdentifier(cid),
			ct = change.get('ChangeType'), cmp;

		if (!widget) {
			UserRepository.getUser(username, function(u){
				me.addUser(u[0], [change], true);
			});
			return;
		}

		if (ct === 'Deleted') {
			cmp = widget.down('[ContainerIdHash='+id+']');
			if (cmp) {
				widget.remove(cmp);
			}
		}
		else if (ct!=='Circled'){
			widget.insert(0, {
				item: item,
				type: item.getModelName(),
				message: this.getMessage(change),
				ContainerId: cid,
				ContainerIdHash: id
			});
			this.insert(0, widget);//move?
			widget.setVisible(true);

		}
	}


});
