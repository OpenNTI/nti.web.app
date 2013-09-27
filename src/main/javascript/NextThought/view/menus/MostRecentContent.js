Ext.define('NextThought.view.menus.MostRecentContent',{
	extend: 'Ext.menu.Menu',
	alias: 'widget.most-recent-content-switcher',

	border: false, frame: false,

	ui: 'content-switcher',
	showSeparator: false,
	layout: 'auto',

	plain: true,

	autoRender: true,
	renderTo: Ext.getBody(),

	persistenceKey:'recents',
	persistenceProperty:'navigation/content/switcher',

	config: {
		ownerNode:null
	},

	initComponent: function(){
		this.callParent(arguments);
		this.view = this.add({
			xtype: 'dataview',
			store: this.getStore(),
			plain: true,
			ui: 'content-switcher',

			trackOver: true,
			overItemCls: 'over',
			selectedItemCls: 'selected',
			itemSelector: '.item',
			tpl: Ext.DomHelper.markup([
				{ tag: 'tpl', 'for':'.', cn:{
					cls: 'item',
					cn:[
						{ cls: 'image', style:{backgroundImage:'url({icon})'} },
						{
							cls: 'wrap',
							cn:[
								{tag:'tpl', 'if':'courseName', cn:{ cls: 'courseName', html:'{courseName}'}},
								{tag:'tpl', 'if':'!courseName', cn:{ cls: 'provider', html:'{author}'}},
								{ cls: 'title', html: '{title}'}
							]
						}
					]
				}},
				{ cls: 'more', cn: [{},{},{}]}
			]),
			listeners:{
				scope: this,
				select: 'onSelected',
				containerclick: 'onFramedClicked'
			}
		});


		this.on({
			scope: this,
			afterRender: 'setInitialPosition',
			mouseleave: 'startHide',
			mouseover: 'stopHide'
		});

		Library.on('loaded','fillStore',this,{buffer:1});
	},


	setInitialPosition: function(){
		this.el.setLocalY(0);
		this.el.setLocalX(0);
	},


	fillStore: function(){
		this.allowTracking = true;
		var s = PersistentStorage.getProperty(this.persistenceKey,this.persistenceProperty,[]);
		try{
			s = Ext.Array.map(s, function(o){
				var t = Library.getTitle(o.index);
				if(t){t.lastTracked = Ext.Date.parse(o.lastTracked,'timestamp');}
				return t;
			});

			this.getStore().loadRecords(Ext.Array.clean(s));
		}
		catch(e){
			console.warn(e.message);
		}
	},


	startHide: function(){
		this.stopHide();
		this.menuHideTimer = Ext.defer(this.hide,750,this);
	},

	stopHide: function(){
		clearTimeout(this.menuHideTimer);
	},


	getStore: function(){
		if(!this.store){
			this.store = new Ext.data.Store({
				model: NextThought.model.Title,
				proxy: 'memory',
				sorters:[
					function(a,b){
						a = a.lastTracked.getTime();
						b = b.lastTracked.getTime();
						return b-a;
					}
				]
			});
		}

		return this.store;
	},


	show: function(){
		if(this.getStore().getCount()===0){return;}

		var n = this.getOwnerNode();
		this.setWidth(n.getWidth());

		try {
			this.callParent(arguments);
		}
		finally{
			this.fireEvent('mouseover');//trigger the partent from hiding this if the mouse doesn't move.
			this.alignTo(n,'tl-tl');
		}
	},


	track: function(rec){
		var s = this.getStore();
		s.remove(rec);
		rec.lastTracked = new Date();
		s.add(rec);

		if(s.getCount() > 5){
			s.remove(s.getRange(5));
		}


		if(this.allowTracking){
			s = s.getRange();
			Ext.each(s,function(t,i){

				s[i] = {index: t.get('index'),lastTracked: t.lastTracked};
			});
			//Cant save records to local storage...so must save just the id's or the index of the content
			PersistentStorage.updateProperty(this.persistenceKey,this.persistenceProperty,s);
		}
	},


	onSelected: function(selModel,record){
		selModel.deselect(record);
		this.fireEvent('set-last-location-or-root',record.get('NTIID'));
		this.hide();
	},


	onFramedClicked: function(){
		this.fireEvent('go-to-library');
		this.hide();
	}

});
