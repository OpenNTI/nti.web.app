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
		var edit = isFeature('custom-status');

		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {},{
			states: [
				{state: 'available', label: 'Available', editable: edit},
				{state: 'away', label: 'Away', editable: edit},
				{state: 'dnd', label: 'Do not disturb', editable: edit},
				//{state: 'invisible', label: 'Invisible'},
				{state: 'offline', label: 'Offline'}
			]
		});
	},

    afterRender: function(){
		this.callParent(arguments);

		var presence = Ext.getStore('PresenceInfo').getPresenceOf($AppConfig.username);
			
		this.setPresence($AppConfig.username, presence);

		this.setUpEditor();
		this.mon(this.el,'click','clicked',this);

		this.mon(Ext.getStore('PresenceInfo'),'presence-changed','setPresence', this);	
	},


	onDestroy: function() {
	    this.cancelDeferHide();
		clearTimeout(this.deferHideParentMenusTimer);
		this.callParent(arguments);
	},


	deferHideParentMenus: function() {
		Ext.menu.Manager.hideAll();
	},


	setPresence: function(username, presence){
		if(!isMe(username) || !presence){ return; }

		var label, current = this.el.down('.selected'),
			show = presence.get('show'),
			name = presence.getName();

		if(current && name){
			current.removeCls('selected');
		}

		if(presence.isOnline() && name){
			name = this.el.down('.'+name);
			label = name.down('.label');
			if(!name){
				console.log('Element didnt exist');
			}else{
				name.addCls('selected');
				console.log(presence.getDisplayText());
				if(Ext.isEmpty(label.dom.innerHTML)){
					label.update(presence.getDisplayText());
				}
			}
		}else{
			this.offlineEl.addCls('selected');
		}

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
				allowEmpty: true,
				selectOnFocus: true
			},
			listeners:{
				canceledit: 'cancelEdit',
				complete: 'saveEditor',
				scope: this
			}
		});
	},

	getTarget: function(row){
		if(row.is('.available')){
			return 'available';
		}
		if(row.is('.away')){
			return 'away';
		}
		if(row.is('.dnd')){
			return 'dnd';
		}
		if(row.is('.offline')){
			return 'unavailable';
		}

		return null;
	},

	clicked: function(e){
		var show, status, type, presence;

		if(e.getTarget('.edit')){
			e.stopEvent();
			this.startEditor(e);
			return;
		}

		if(e.getTarget('.available')){
			status = e.getTarget('.available',10,true).down('.label').dom.innerHTML;
			show = 'chat';
			type= 'available';
		}else if(e.getTarget('.away')){
			status = e.getTarget('.away',10,true).down('.label').dom.innerHTML;
			show = 'away';
			type= 'available';
		}else if(e.getTarget('.dnd')){
			status = e.getTarget('.dnd',10,true).down('.label').dom.innerHTML;
			show = 'dnd';
			type= 'available';
		}else if(e.getTarget('.offline')){
			show = 'chat';
			type= 'unavailable';
		}else{
			console.log("unhandled click");
			return;
		}

		presence = NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username, type, show, status);

		if(this.isNewPresence(presence)){
			this.fireEvent('set-chat-presence', presence);
		}

		this.deferHideParentMenusTimer = Ext.defer(this.deferHideParentMenus, 250, this);
	},

	isNewPresence: function(newPresence){
		var currentPresence = Ext.getStore('PresenceInfo').getPresenceOf($AppConfig.username);

		return newPresence.get('type') !== currentPresence.get('type') || newPresence.get('show') !== currentPresence.get('show') || newPresence.get('status') !== currentPresence.get('status');
	},

	isStatus: function(value){
		var v = value && value.toLowerCase();

		return v && v !== 'available' && v !== 'away' && v !== 'do not disturb';
	},

	saveEditor: function(cmp, value, oldValue){
		var row = cmp.boundEl.up('.status'),
			target = this.getTarget(row),
			newPresence,
			type = (target === 'unavailable')? 'unavailable' : 'available',
			show = (target === 'available')? 'chat' : target,
			status = (this.isStatus(value))? value : '' ;

		status = (isFeature('custom-status'))? status :  '';


		newPresence = NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username, type, show, status);

		row.removeCls('active');

		if(value===oldValue){
			return;
		}

		if(this.isNewPresence(newPresence)){
			//somethings different update the presence
			console.log(newPresence);
			this.fireEvent('set-chat-presence', newPresence);
		}else{
			this.setPresence($AppConfig.username, newPresence);
			console.log("No presence change");
		}
	},

	startEditor: function(e){
		var row = e.getTarget('.status',null,true),
			edit = row && row.down('.edit');

		if(edit && isFeature('custom-status')){			
			row.addCls('active');
			this.editor.field.emptyText = edit.getAttribute('data-placeholder');
			this.editor.startEdit(row.down('.label'));
		}
	},


	cancelEdit:function(cmp, value, startValue){
		var activeRow = cmp.boundEl.up('.status.active');
		if( activeRow ){
			activeRow.removeCls('active');
		}
	}
});
