Ext.define('NextThought.view.account.contacts.management.GroupList',{
	extend: 'Ext.view.BoundList',
	alias: 'widget.management-group-list',

	ui: 'nt',
	plain: true,
	shadow: false,
	frame: false,
	border: false,

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


	refresh: function(){
		var el = this.getEl(),
			ul, link,
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
			if (!r.isModifiable()){
				//Ext.fly(li).down('img.delete-group').remove();
				Ext.fly(li).setStyle({display:'none'});
			}

			if(this.username && r.hasFriend(this.username)){
				selection.select([r],true,true);
			}
		}, this);

		if(this.allowSelect){
			link = Ext.DomHelper.append( ul,
				{
					tag: 'li',
					cls: 'add-group-action selection-list-item',
					role: 'button',
					children: [
						{ tag: 'a', href: '#', html: 'Add Group' },
						{ tag: 'input', type: 'text', cls: 'new-group-input', style: 'display: none;'  }
					]
				}, true);

			link.down('a').on('click', this.addGroupClicked, this);
			link.down('input').on({
				scope: this,
				keypress: this.newGroupKeyPressed,
				keydown: this.newGroupKeyDown
			});
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
		this.getSelectionModel().deselectAll();
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
		if(this.username && !this.ignoreSelection){
			this.fireEvent('remove-contact',group,this.username);
		}
	},

	onSelect: function(view,group){
		if(this.username && !this.ignoreSelection){
			this.fireEvent('add-contact',this.username,[group]);
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
		if(this.username && !this.ignoreSelection){
			return;
		}

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


	addGroupClicked: function(e){
		var a = Ext.get(e.getTarget('a',undefined,true));

		a.next('input').setStyle('display','').focus();
		a.remove();

		e.preventDefault();
		e.stopPropagation();
		return false;
	},


	newGroupKeyDown: function(event) {
		var specialKeys = {
			27: true,	//Ext.EventObject.prototype.ESC
			8: true,	//Ext.EventObject.prototype.BACKSPACE
			46: true	//Ext.EventObject.prototype.DELETE
		};

		Ext.fly(event.getTarget()).removeCls('error');
		event.stopPropagation();

		if(specialKeys[event.getKey()]){
			this.newGroupKeyPressed(event);
		}
	},


	newGroupKeyPressed: function(event){
		var k = event.getKey();
		if(k === event.ESC){
			this.reset();
			return;
		}
		else if (k === event.ENTER) {
			this.submitNewGroup(event.getTarget().value);
		}

		event.stopPropagation();
	},


	submitNewGroup: function(groupName){
		var input = this.getEl().down('li > input'),
			me = this;

		if((groupName||'').length === 0){
			return;
		}

		this.fireEvent('add-group', groupName, function(success){
			if(!success){ input.addCls('error'); }
			me.store.on('datachanged',function(){
				me.selectNewGroup(groupName);
			},me,{single:true});

		});
	}
});
