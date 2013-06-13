//styles in _identity.scss
Ext.define('NextThought.view.menus.Presence',{
	extend: 'Ext.Component',
	alias: 'widget.presence-menu',

	requires: [
		'NextThought.view.menus.PresenceEditor'
	],

	cls: 'presence-menu',
	ui: 'presence-menu',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', html: 'MY STATUS'},
		{cls: 'list', cn:[
			{tag:'tpl', 'for':'states', cn:[
				{cls: 'status {state}', cn:[
					{tag:'tpl', 'if':'editable', cn: {cls: 'edit', 'data-placeholder': '{label}'}},
					{cls: 'label', html: '{label}'},
					{cls: 'presence {state}'}				
				]}
			]}
		]}
	]),

	renderSelectors: {
		'availableEl': '.list .available',
		'awayEl': '.list .away',
		'dndEl': '.list .dnd',
		'offlineEl': '.list .offline'
	},

	beforeRender: function(){
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {},{
			states: [
				{state: 'available', label: 'Available', editable: true},
				{state: 'away', label: 'Away', editable: true},
				{state: 'dnd', label: 'Do not disturb', editable: true},
				{state: 'invisible', label: 'Invisible'},
				{state: 'offline', label: 'Offline'},
			]
		})
	},

    afterRender: function(){
		this.callParent(arguments);

		var presence = Ext.getStore('PresenceInfo').getPresenceOf($AppConfig.username),
			show = presence && presence.get('show'),
			name = presence && presence.getName();

		if( presence && presence.isOnline() && name){
			name = this.el.down('.'+name);
			if(!name){
				console.log('Something went horribly wrong');
			}else{
				name.addCls('selected');
				name.down('.label').update(presence.getDisplayText());
			}
		}else{
			this.offlineEl.addCls('selected');
		}

		this.setUpEditor();
		this.mon(this.el,'click','clicked',this);	
	},

	setUpEditor: function(){
		this.editor = Ext.widget('presence-editor',{
			updateEl: true,
			renderTo: this.el.down('.list'),
			offsets: [26,3],
			field: {
				xtype: 'textfield',
				emptyText: '',
				enforceMaxLength: true,
				maxLength: 140,
				allowEmpty: true
			},
			xhooks:{
				cancelEdit:function(){
					this.callParent(arguments);
					if(this.activeRow){
						this.activeRow.removeCls('active');
					}
				}
			}
		});
	},

	getTarget: function(e){
		if(e.getTarget('.available')){
			return 'available';
		}else if(e.getTarget('.away')){
			return 'away';
		}else if(e.getTarget('.dnd')){
			return 'dnd';
		}else if(e.getTarget('.offline')){
			return 'unavailable'
		}else{
			return null;
		}
	},

	clicked: function(e){
		if(e.getTarget('.edit')){
			this.startEditor(e);
			return;
		}

		if(e.getTarget('.save')){
			this.saveEditor(e);
			return;
		}

		if(e.getTarget('.available')){
			this.fireEvent('set-chat-show', 'chat');
		}else if(e.getTarget('.away')){
			this.fireEvent('set-chat-show', 'away');
		}else if(e.getTarget('.dnd')){
			this.fireEvent('set-chat-show', 'dnd');
		}else if(e.getTarget('.offline')){
			this.fireEvent('set-chat-type', 'unavailable');
		}else{
			console.log("unhandled click");
		}
	},

	isStatus: function(value){
		var v = value && value.toLowerCase();

		return v && v != 'available' && v != 'away' && v != 'do not disturb';
	},

	saveEditor: function(e){
		var target = this.getTarget(e),
			value = this.editor.field.value,
			newPresence,
			currentPresence = Ext.getStore('PresenceInfo').getPresenceOf($AppConfig.username),
			type = (target === 'unavailable')? 'unavailable' : 'available',
			show = (target === 'Avaliable')? 'chat' : target,
			status = (this.isStatus(value))? value : '' ;

		newPresence = NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username, type, show, status);

		if(newPresence.get('type') !== currentPresence.get('type') || newPresence.get('show') !== currentPresence.get('show') || newPresence.get('status') !== currentPresence.get('status')){
			//somethings different update the presence
			console.log(newPresence);
			this.fireEvent('set-chat-presence', newPresence);
		}else{
			console.log("No presence change");
		}
	},

	startEditor: function(e){
		var row = e.getTarget('.status',null,true),
			edit = row && row.down('.edit');
		if(edit){
			this.editor.activeRow = row;
			this.editor.activeTarget = this.getTarget(e);
			row.addCls('active');
			this.editor.field.emptyText = edit.getAttribute('data-placeholder');
			this.editor.startEdit(row.down('.label'));
		}
		else{
			console.log("unhandled click");
		}
	},

	cancelEdit: function(){
		if(this.activeRow){
			this.activeRow.removeCls('active');
		}
	}
});