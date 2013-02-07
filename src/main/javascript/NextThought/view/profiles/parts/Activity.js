Ext.define('NextThought.view.profiles.parts.Activity',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-activity',

	requires: [
		'NextThought.view.profiles.parts.ActivityItem'
	],

	defaultType: 'profile-activity-item',
	layout: 'auto',

	initComponent: function(){
		this.callParent(arguments);

		this.store = this.getStore();
		this.mon(this.store,{
			scope: this,
			load: this.storeLoaded
		});

		this.store.load();
	},

	getStore: function(){
		var id = 'profile-activity-'+this.username,
			s = Ext.getStore(id) || NextThought.store.PageItem.create({id:id});

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams||{},{
			sortOn: 'createdTime',
			sortOrder: 'descending',
			filter: 'TopLevel,MeOnly',
			accept: 'application/vnd.nextthought.note,application/vnd.nextthought.highlight'
		});

		return s;
	},


	storeLoaded: function(){
		if(!this.rendered){
			this.on('afterrender',this.storeLoaded,this,{single:true});
			return;
		}

		var add = [];

		Ext.each(this.store.getItems(),function(i){add.push({record: i,root:true});});

		this.add(add);
	}

});
