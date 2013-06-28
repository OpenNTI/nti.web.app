Ext.define('NextThought.view.account.contacts.management.GroupList',{
	extend: 'Ext.view.BoundList',
	alias: 'widget.management-group-list',
	mixins: {
		addgroup:'NextThought.mixins.AddGroup'
	},

	requires:[
		'NextThought.store.FriendsList'
	],

	ui: 'nt',
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	preserveScrollOnRefresh: true,

	cls: 'group-selection-list',
	baseCls: 'selection',
	itemCls: 'selection-list-item multiselect',
	displayField: 'displayName',
	selModel: { mode: 'SIMPLE' },

	initComponent: function(){
		this.buildGroupListStore();
		this.callParent(arguments);
		this.itemSelector = '.selection-list-item';

		this.allowSelect = this.allowSelect || false;

		this.mon(this.getSelectionModel(), {
			beforeselect: this.onBeforeSelect,
			beforedeselect: this.onBeforeDeselect,
			deselect: this.onDeselect,
			select: this.onSelect,
			scope: this
		});
	},


	buildGroupListStore: function(){
		function filterList(rec){
			if(Ext.Array.contains(blocked||[], rec.get('Username'))){ return false; }
			return rec.isModifiable() && !rec.isDFL;
		}

		var fstore = Ext.getStore('FriendsList'),
			blocked = this.blocked,
			mycontact = 'mycontacts-'+$AppConfig.username, me = this;

		this.store = new NextThought.store.FriendsList({
			id: 'group-list-store',
			proxy: 'memory',
			filters: [
				function(item){ return item.get('Username') !== mycontact; },
				filterList
			]
		});

		this.store.loadData(fstore.getRange());

		this.store.mon(fstore, 'add', function(store, record, i){
			me.store.add(record);
		}, this);

	},


	getSelected: function(){
		return this.getSelectionModel().getSelection();
	},


	afterRender: function(){
		var tpl = { cls:'toolbar', cn:[{cls:'title', html:'Distribution lists'},{cls:'close', html:''}]};
		this.close = Ext.DomHelper.append(this.el, tpl, true);
		this.callParent(arguments);

		this.mon(this.close, 'click', function(){
			this.isClosing = true;
			this.doDismiss = true;
			this.fireEvent('hide-menu');
		}, this);

		this.mon(this.el,'mouseover', function(e){
			this.stopHideTimeout();
			this.doDismiss = false;
		}, this);

		this.mon(this.el,'mouseout', function(e){
			if(!this.isClosing){
				this.startHideTimeout();
			}
			this.isClosing = false;
			this.doDismiss = true;
		}, this);

		this.on('beforedeactivate', function(e){
			return this.doDismiss && !this.newListInputBoxActive;
		}, this);
	},

	startHideTimeout: function(){
		this.hideTimeout = Ext.defer(function(){
			if(!this.newListInputBoxActive){
				this.fireEvent('hide-menu');
			}
		}, 1000, this);
	},

	stopHideTimeout: function(){
		clearTimeout(this.hideTimeout);
	},

	refresh: function(){
		var el = this.getEl(),
			ul,
			selection = this.getSelectionModel(),
			blocked = this.blocked;

		this.callParent(arguments);

		if(!this.rendered){
			return;
		}

		ul = el.down('ul');
		if(!this.allowSelect){
			ul.addCls('disallowSelection');
		}

		Ext.each(ul.query('li'), function(li){
			var r = this.getRecord(li);
			if(this.username && r.hasFriend(this.username)){
				selection.select([r],true,true);
			}
		}, this);

		if(this.allowSelect){
			this.attachAddGroupControl( ul, 'li' );
			Ext.defer(this.updateLayout, 1, this);
		}
	},


	block: function(username){
		this.blocked = Ext.Array.merge(
				this.blocked||[],
				Ext.isArray(username) ? username : [username]);
		this.refresh();
	},


	setUser: function(user){
		if(user && user.isModel){
			user = user.get('Username');
		}
		this.username = user;
		this.refresh();
	},


	reset: function(){
		if(!this.username){
			this.getSelectionModel().deselectAll();
		}
		this.refresh();
	},


	getInnerTpl: function(displayField){
		return ['<div class="name" data-qtip="{'+displayField+'}">',
				'<tpl>',
				'{'+displayField+'}',
				'</tpl>',
				'</div>'
		].join('');
	},


	handleEvent: function(e){
		if(e.getTarget('li[role=option]')){
			this.callParent(arguments);
		}
	},


	onBeforeSelect: function(list,model){
		return (this.allowSelect && model.isModifiable());
	},

	onBeforeDeselect: function(list,model){
		return (!this.allowSelect || model.isModifiable());
	},

	onMaskBeforeShow: function(){
		this.ignoreSelection = true;
		this.callParent(arguments);
		delete this.ignoreSelection;
	},

	onDeselect: function(view,group){
		if(!this.ignoreSelection && group && group.hasFriend(this.username)){
			this.fireEvent('remove-contact',group,this.username);
		}
	},

	onSelect:function (view, group) {
		var me = this;
		if (!this.ignoreSelection && group && !group.hasFriend(this.username)) {
			this.fireEvent('add-contact', this.username, [group], Ext.bind(me.onSelectCallback, me, arguments));
		}
	},


	onSelectCallback: function(){
		//If we were not previously a contact, adding us to a group, implicitly makes us a contact now.
		if(!this.isContact){
			this.fireEvent('added-contact', this, this.user);
			this.isContact = true;
		}
	},


	disallowSelection: function(){
		this.allowSelect = false;
		this.getSelectionModel().deselectAll();
		this.refresh();
	},


	allowSelection: function(){
		this.allowSelect = true;
		this.refresh();
	},


	selectNewGroup: function(groupName){
		var record,s = this.getSelectionModel();
		if(!this.allowSelect){
			return;
		}
		try {
			record = this.store.find(this.displayField,groupName, 0, false, true, true);
			if(typeof record === 'number' && record !== -1){
				s.select(record,true,true);
				this.fireEvent('selectionchange',this, s.getSelection());
			}
		}
		catch(er){
			console.error(Globals.getError(er));
		}
	},

	afterGroupAdd: function(groupName){
		var me = this;

		me.store.on('datachanged',function(){
			me.selectNewGroup(groupName);
			me.reset();
			me.fireEvent('sync-menu-height', me.el.up('.x-menu'));
		},me,{single:true});
	}

});
