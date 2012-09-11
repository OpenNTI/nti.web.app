Ext.define('NextThought.view.account.Activity',{
	extend: 'Ext.container.Container',
	alias: 'widget.activity-view',

	iconCls: 'activity',
	tooltip: 'Recent Activity',
	ui: 'activity',
	cls: 'activity-view',
	plain: true,

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	items: [
		{xtype: 'box', cls: 'view-title', autoEl: {html: 'Recent Activity'}},
		{
			activitiesHolder: 1,
			xtype: 'box',
			flex: 1,
			autoScroll: true,
			autoEl:{
				cn:[{
					cls:"activity loading",
					cn: [{cls: 'name', tag: 'span', html: 'Loading...'},' please wait.']
				}]
			}
		}
	],


	feedTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{tag:'tpl', 'if':'length==0', cn:[{
			cls:"activity nothing",
			cn: [' No Activity yet']
		}]},
		{tag:'tpl', 'for':'.', cn:[
			{tag:'tpl', 'if':'activity', cn:[{
				cls:'activity {type}',
				id: '{guid}',
				cn: [{cls: 'name', tag: 'span', html: '{name}'},' {message} ',{tag:'tpl', 'if':'with', cn:['with-name']}]
			}]},
			{tag:'tpl', 'if':'label', cn:[{
				cls: 'divider', html: '{label}'
			}]}
		]}

	])),


	initComponent: function(){
		this.callParent(arguments);
		this.store = Ext.getStore('Stream');
		this.mon(this.store,{
			scope: this,
			add: this.updateNotificationCountFromStore,
			datachanged: this.reloadActivity,
			load: this.reloadActivity,
			clear: function(){console.log('stream clear',arguments);},
			remove: function(){console.log('stream remove',arguments);},
			update: function(){console.log('stream update',arguments);}
		});

		this.monitoredInstance = $AppConfig.userObject;
		this.mon($AppConfig.userObject, 'changed', this.updateNotificationCount, this);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.el,'click',this.itemClick,this);
		this.mon(this, {
			scope: this,
			'deactivate': this.resetNotificationCount
		});
	},

	updateNotificationCountFromStore: function(store, records){
		var u = $AppConfig.userObject,
			c = (u.get('NotificationCount') || 0) + ((records||{}).length||0);

		//Update current notification of the userobject.
		u.set('NotificationCount', c);
		u.fireEvent('changed',u);
	},


	resetNotificationCount: function(){
		$AppConfig.userObject.saveField('NotificationCount', 0);
		this.setNotificationCountValue(0);
	},

	updateNotificationCount: function(u) {
		if(u !== this.monitoredInstance && u === $AppConfig.userObject){
			this.mun(this.monitoredInstance,'changed', this.updateNotificationCount,this);
			this.monitoredInstance = u;
			this.mon(this.monitoredInstance,'changed', this.updateNotificationCount,this);
		}
		this.setNotificationCountValue(u.get('NotificationCount'));
	},

	setNotificationCountValue: function(count){
		this.tab.setText(count || '&nbsp;');
	},

	onAdded: function(){
		this.callParent(arguments);
		//sigh
		Ext.defer(function(){
			this.setNotificationCountValue(
					this.monitoredInstance.get('NotificationCount'));
		}, 1, this);
	},

	reloadActivity: function(store){
		var container = this.down('box[activitiesHolder]'),
			totalExpected,
			items = [];

		if(store && !store.isStore){
			store = null;
		}

		this.store = store = store||this.store;

		totalExpected = store.getCount();

		if(!this.rendered){
			this.on('afterrender',this.reloadActivity,this,{single:true});
			return;
		}

		this.stream = {};

		function p(i){
			if(items.length>100){
				if(!items.last().activity){ items.pop(); }
				return;
			}
			items.push(i);
		}

		function doGroup(group){
			var label = (group.name||'').replace(/^[A-Z]\d{0,}\s/,'') || false,
				me = this;

			if(label){
				p({ label: label });
			}

			//We use a similar strategy to the one that Notifications uses
			Ext.each(group.children,function(c){
				var item = this.changeToActivity(c);

				UserRepository.getUser(item.name, function(u){
					item.name = u.getName();
					p(item);
					totalExpected--;
					if(totalExpected === 0){
						me.feedTpl.overwrite(container.getEl(),items);
						container.updateLayout();
					}

				});

			},this);
		}

		if(store.getGroups().length === 0){
			this.feedTpl.overwrite(container.getEl(), []);
			container.updateLayout();
		}

		Ext.each(store.getGroups(),doGroup,this);

	},


	changeToActivity: function(c){
		var item = c.get('Item'),
			cid = item? item.get('ContainerId') : undefined,
			guid = guidGenerator();

		this.stream[guid] = {
			activity: true,
			guid: guid,
			name: c.get('Creator'),
			record: item,
			type: item? item.getModelName().toLowerCase() : '',
			message: this.getMessage(c),
			ContainerId: cid,
			ContainerIdHash: cid? IdCache.getIdentifier(cid): undefined
		};
		return this.stream[guid];
	},


	getMessage: function(change) {
		var item = change.get('Item'),
			type = change.get('ChangeType'),
			loc;

		if (!item){return 'Unknown';}

		if (item.getModelName() === 'User') {
			return item.getName() + (/circled/i).test(type)
					? ' added you as a contact.' : '?';
		}
		else if (item.getModelName() === 'Highlight') {
			loc = LocationProvider.getLocation(item.get('ContainerId'));
			return 'shared a highlight' +(loc ? (' in '+loc.label): '');
		}
		else if (item.getModelName() === 'Redaction') {
			loc = LocationProvider.getLocation(item.get('ContainerId'));
			return 'shared a redaction' +(loc ? (' in '+loc.label): '');
		}
		else if (item.getModelName() === 'Note'){
			return Ext.String.format('&ldquo;{0}&rdquo;',item.getBodyText());
		}
		else {
			console.error('Not sure what activity text to use for ', item, change);
			return 'Unknown';
		}
	},

	itemClick: function(e){

		var target = e.getTarget('div.activity',null,true),
			guid = (target||{}).id,
			item = this.stream[guid],
			rec = (item||{}).record,
			targets;

		if (!rec || rec.get('Class') === 'User'){
			return false;
		}

		targets = (rec.get('references') || []).slice();

		e.stopEvent();
		try{
			targets.push( rec.getId() );
//			console.log('nav to', item.ContainerId, targets);
			this.fireEvent('navigation-selected', item.ContainerId, targets);
		}
		catch(er){
			console.error(Globals.getError(er));
		}
		return false;
	}
});
