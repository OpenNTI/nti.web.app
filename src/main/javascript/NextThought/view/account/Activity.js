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
			{tag:'tpl', 'if':'!activity', cn:[{
				cls: 'divider', html: '{label}'
			}]}
		]}

	])),


	initComponent: function(){
		this.callParent(arguments);
		this.store = Ext.getStore('Stream');
		this.mon(this.store,{
			scope: this,
			add: this.newActivity,
			datachanged: this.reloadActivity,
			load: this.reloadActivity,
			clear: function(){console.log('stream clear',arguments);},
			remove: function(){console.log('stream remove',arguments);},
			update: function(){console.log('stream update',arguments);}
		});
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.el,'click',this.itemClick,this);
	},


	reloadActivity: function(store){
		var container = this.down('box[activitiesHolder]'),
			items = [];

		if(store && !store.isStore){
			store = null;
		}

		this.store = store = store||this.store;

		if(!this.rendered){
			this.on('afterrender',this.reloadActivity,this,{single:true});
			return;
		}

		this.stream = {};

		function p(i){
			if(items.length>30){
				if(!items.last().activity){ items.pop(); }
				return;
			}
			items.push(i);
		}

		function doGroup(group){
			var label = (group.name||'').replace(/^[A-Z]\d{0,}\s/,'') || false;
			if(label){
				p({ label: label });
			}

			Ext.each(group.children,function(c){
				var item = this.changeToActivity(c);
				p(item);
			},this);
		}

		Ext.each(store.getGroups(),doGroup,this);


		this.feedTpl.overwrite(container.getEl(),items);
		container.updateLayout();

	},

	newActivity: function(){
		console.log('!');
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
					? ' added you to a contacts list' : '?';
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
			return;
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
