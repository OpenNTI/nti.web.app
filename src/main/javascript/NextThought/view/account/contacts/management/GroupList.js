Ext.define('NextThought.view.account.contacts.management.GroupList',{
	extend: 'Ext.view.BoundList',
	alias: 'widget.management-group-list',
	mixins: {
		addgroup:'NextThought.mixins.AddGroup'
	},
	ui: 'nt',
	plain: true,
	shadow: false,
	frame: false,
	border: false,
	preserveScrollOnRefresh: true,

	cls: 'group-selection-list',
	baseCls: 'selection',
	itemCls: 'selection-list-item multiselect',
	displayField: 'realname',
	selModel: { mode: 'SIMPLE' },

	initComponent: function(){
		this.store = Ext.getStore('FriendsList');
		this.callParent(arguments);
		this.itemSelector = '.selection-list-item';

		this.block('mycontacts-'+$AppConfig.username);

		this.allowSelect = this.allowSelect || false;

		this.mon(this.getSelectionModel(), {
			beforeselect: this.onBeforeSelect,
			beforedeselect: this.onBeforeDeselect,
			deselect: this.onDeselect,
			select: this.onSelect,
			scope: this
		});

	},


	getSelected: function(){
		return this.getSelectionModel().getSelection();
	},


    onUpdate: function(ds, record){
        if(Ext.Array.contains(this.blocked, record.get('Username'))){
            console.log('username blocked', record);
            return;
        }

		//See comment about adding to dfls in fn: refresh
		if(record.get('IsDynamicSharing')){
			return;
		}

        this.callParent(arguments);
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
			if(Ext.Array.contains(blocked||[], r.get('Username'))){
				Ext.fly(li).setStyle({display: 'none'});
			}
			//We don't allow dfls in this list.  Right now
			//You can only be added to a dfl by inputting a code and joining
			//yourself. period!  Obviously we also don't let you modify things you
			//can't modify
			if (!r.isModifiable() || r.get('IsDynamicSharing')){
				//Ext.fly(li).down('img.delete-group').remove();
				Ext.fly(li).setStyle({display:'none'});
			}

			if(this.username && r.hasFriend(this.username)){
				selection.select([r],true,true);
			}
		}, this);

		if(this.allowSelect){
			this.attachAddGroupControl( ul, 'li' );
		}

		Ext.each(this.pendingGroupsRequests || [], function(i){
			selection.select(i, true, true);
		});
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
		if (displayField !== 'realname'){
			console.warn('displayField is not realname');
		}
		return ['<div class="name">',
				'<tpl if="realname == \'\'">{Username}' +
					'<tpl else>',
						'{realname}',
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
		if(this.username && !this.ignoreSelection && group && group.hasFriend(this.username)){
			this.fireEvent('remove-contact',group,this.username);
		}
		else{
			if(!group){ return;}

			if(this.pendingGroupsRequests){
				Ext.Array.remove(this.pendingGroupsRequests, group);
			}
		}
	},

	onSelect:function (view, group) {
		if (this.username && !this.ignoreSelection && group && !group.hasFriend(this.username)) {
			this.fireEvent('add-contact', this.username, [group]);
		} 
		else{
			if(!group){ return;}

			// FIXME: if this user isn't in our contacts, add this group to the pending groups,
			// that way if I add the user to my contacts, he gets added to the other selected groups.
			if(!this.pendingGroupsRequests){ this.pendingGroupsRequests = []; }
			this.pendingGroupsRequests.push(group);
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


	selectNewGroup: function(groupName, pendingSelections){
		var record,s = this.getSelectionModel();
		if(!this.allowSelect){
			return;
		}
		try {
			record = this.store.find(this.displayField,groupName, 0, false, true, true);
			if(typeof record === 'number' && record !== -1){
				s.select(record,true,true);
				this.fireEvent('selectionchange',this, s.getSelection());

				if(!this.username){
					this.pendingGroupsRequests = pendingSelections || [];
					this.pendingGroupsRequests.push(s.getSelection()[0]);
					console.log('Groups selected after add: ', this.pendingGroupsRequests);
				}
			}
		}
		catch(er){
			console.error(Globals.getError(er));
		}
	},

	afterGroupAdd: function(groupName){
		var me = this, pendingSelections;
		//Only adds to pendingList if the user is not in my contacts.
		if(!this.username){
			pendingSelections = me.getSelectionModel().getSelection().slice();
			console.log('Groups selected: ', pendingSelections);
		}

		me.store.on('datachanged',function(){
			me.selectNewGroup(groupName, pendingSelections);
		},me,{single:true});
	}

});
