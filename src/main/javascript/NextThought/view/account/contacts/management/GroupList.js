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

		this.allowSelect = this.allowSelect || false;

		this.mon(this.getSelectionModel(), {
			beforeselect: this.onBeforeSelect,
			beforedeselect: this.onBeforeDeselect,
			scope: this
		});
	},


	getSelected: function(){
		return this.getSelectionModel().getSelection();
	},


	refresh: function(){
		var el = this.getEl(), ul, link;

		if(this.allowSelect && this.getSelectionModel().getCount() > 0){
			this.getSelectionModel().select(0,true,true);
		}
		this.callParent(arguments);

		if(this.rendered){
			ul = el.down('ul');
			if(!this.allowSelect){
				ul.addCls('disallowSelection');
			}

			Ext.each(ul.query('li'), function(li){
				if (!this.getRecord(li).isModifiable()){
					//Ext.fly(li).down('img.delete-group').remove();
					Ext.fly(li).setStyle({display:'none'});
				}
			}, this);

			Ext.each( el.query('img.delete-group'),
				function(dom){Ext.fly(dom).on('click',this.deleteGroup, this);},
				this);

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
					blur: this.newGroupBlurred,
					keypress: this.newGroupKeyPressed,
					keydown: this.newGroupKeyDown
				});
			}
		}
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
				'<img src="',Ext.BLANK_IMAGE_URL,'" class="delete-group" alt="Delete Group"/>',
				'<tpl if="realname == \'\'">{Username}' +
					'<tpl else>',
						'{realname}',
				'</tpl>',
				'</div>'
		].join('');
	},


	onBeforeSelect: function(list,model){
		if(!this.allowSelect || !model.isModifiable()){
			return false;
		}
	},

	onBeforeDeselect: function(list,model){
		if(this.allowSelect && !model.isModifiable()){
			return false;
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
			record = this.store.find(this.displayField,groupName);
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


	newGroupBlurred: function(e){
		if(this.suppressBlur){
			delete this.suppressBlur;
			return;
		}
		this.submitNewGroup(e.getTarget().value);
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
			return this.reset();
		}
		else if (k === event.ENTER) {
			this.suppressBlur = true;
			this.submitNewGroup(event.getTarget().value);
		}

		event.stopPropagation();
	},


	submitNewGroup: function(groupName){
		var input = this.getEl().down('li > input'),
			me = this;

		this.fireEvent('add-group', groupName, function(success){
			if(!success){ input.addCls('error'); }
			else {
				me.store.on('datachanged',function(){
					me.selectNewGroup(groupName);
				},me,{single:true});

			}
		});
	},


	deleteGroup: function(evt, dom){
		evt.preventDefault();
		evt.stopPropagation();

		var r = this.getRecord(Ext.fly(dom).up(this.itemSelector, this.getEl()));


		this.fireEvent('delete-group', r);
	}

});
