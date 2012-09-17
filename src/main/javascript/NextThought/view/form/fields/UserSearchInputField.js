Ext.define( 'NextThought.view.form.fields.UserSearchInputField', {
	extend: 'Ext.form.field.ComboBox',
	alias : 'widget.usersearchinput',
	requires: [
		'NextThought.view.menus.Group'
	],

	width: 100,
	allowBlank: true,
	displayField: 'realname',
	typeAhead: false,
	hideLabel: true,
	multiSelect: false,
	enableKeyEvents: true,
	minChars: 1,
	valueField: 'Username',
	emptyText: 'Search...',
	cls: 'user-search-field',
	trigger1Cls: 'hidden',
	trigger2Cls: 'x-menu',
	pickerOffset: [0, 5],

	listConfig: {
		loadingHeight: 140,
		loadingText: 'Searching...',
		loadingCls: 'search',
		ui: 'nt',
		plain: true,
		shadow: false,
		frame: false,
		border: false,
		cls: 'x-menu',
		maxHeight: 2000,
		baseCls: 'x-menu',
		itemCls: 'x-menu-item contact-card',
		emptyText: '<div class="x-menu-item">No results</div>',
		itemTpl: new Ext.XTemplate(
				'<img class="nib" src="',Ext.BLANK_IMAGE_URL,'">',
				'<img src="{[this.getIcon(values)]}" class="{[this.getType(values)]}">',
				'<div class="card-body {[this.getType(values)]}">',
					'<div class="name">{displayName}</div>',
					'<div class="status">{affiliation-dontshowthis}{[values.Class.replace("FriendsList","Group")]}</div>',
			'</div>',
		{
			getIcon: function(model){
				var t = this.getType(model);
				return t==='person'? model.avatarURL : Ext.BLANK_IMAGE_URL;
			},

			getType: function(model){
				if (!model){return 'person';}
				if(model.type){ return model.type; }
				var	m = ((model && model.Class) || '').toLowerCase(),
					u = model.Username.toLowerCase(),
					v;


				//Tweak logic slightly if our type is community or
				//our user is public or everyone make it look public
				v = ((/public|everyone/i).test(u) || (/community/i).test(m))
						? 'public'
						//else is it a group or person
						: (/friendslist|group/i).test(m)||!/@/.test(u) ? 'group' : 'person';
				model.type = v;
				return v;
			}
		}),
		xhooks: {
			initComponent: function(){
				this.callParent(arguments);
				this.itemSelector = '.contact-card';
			}
		}
	},


	initComponent: function(){
		var me = this;
		me.store = Ext.getStore('UserSearch');
		me.callParent(arguments);
		me.menu = Ext.widget('group-menu');

		me.menu.on('selected',function(record, item){
			me.fireEvent('select',me,[record]);
		});

		//handle some basic behavior accross the board
		me.on('select',function(){
			me.setValue('',false);
			me.collapse();
			me.focus();
		});
	},


	afterRender: function(){
		this.callParent();
		this.mon( this.inputEl, {
			'mousedown':function(e){ e.dragTracked = true; },
			'keydown':function(e){if(e.getKey() !== e.ESC){e.stopPropagation();}}
		});
		this.inputEl.setStyle({width: null});

		this.triggerEl.first().parent().addCls('hidden');
	},


	reset: function(){
		this.menu.hide();
		this.collapse();
		this.setValue('',false);
	},


	destroy: function(){
		this.menu.destroy();
		delete this.menu;
		this.callParent();
	},


	getRefEl: function(){
		return this.ref || this.getEl();
	},


	onTrigger2Click: function(){
		var e = this.getRefEl();
		if(!this.menu.isVisible()){
			this.menu.setWidth(e.getWidth());
			this.menu.showBy(e,'tl-bl?',[0,5]);
		}
		else {
			this.menu.hide();
		}
	}
});
