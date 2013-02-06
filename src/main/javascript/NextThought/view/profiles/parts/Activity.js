Ext.define('NextThought.view.profiles.parts.Activity',{
	extend: 'Ext.container.Container',
	alias: 'widget.profile-activity',

	defaults: {
		border: false,
		plain: true
	},

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

		console.debug('Store loaded');
		this.store.each(function(i){
			add.push({record: i, html: Ext.encode(i.data)},{html:'<hr/>'});
		});
		this.add(add);
	}

});
