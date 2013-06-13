Ext.define('NextThought.view.menus.Presence',{
	extend: 'Ext.Component',
	alias: 'widget.presence-menu',

	requires: [
		//'NextThought.view.profiles.ProfileFieldEditor'
	],

	cls: 'presence-menu',
	ui: 'presence-menu',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'header', html: 'MY STATUS'},
		{cls: 'list', cn:[
			{cls: 'status available', cn: [
				{cls: 'edit'},
				{cls: 'label', html: 'Available'}
			]},
			{cls: 'status away', cn: [
				{cls: 'edit'},
				{cls: 'label', html: 'Away'}
			]},
			{cls: 'status dnd', cn: [
				{cls: 'edit'},
				{cls: 'label', html: 'Do not disturb'}
			]},
			/*{cls: 'status invisible', cn: [
				{cls: 'label', html: 'Invisible'}
			]},*/
			{cls: 'status offline', cn: [
				{cls: 'edit'},
				{cls: 'label', html: 'Offline'}
			]}
		]}
	]),

	renderSelectors: {
		'availableEl': '.list .available',
		'awayEl': '.list .away',
		'dndEl': '.list .dnd',
		'offlineEl': '.list .offline'
	},

    afterRender: function(){
		this.callParent(arguments);

		var presence = Ext.getStore('PresenceInfo').getPresenceOf($AppConfig.username);

		if(presence.isOnline()){
			if(presence.get('show') && presence.get('show') !== 'chat'){
				this[presence.get('show')+"El"].addCls('selected');
				this[presence.get('show')+"El"].down('.label').update(presence.getDisplayText());
			}else{
				this.availableEl.addCls('selected');
				this.availableEl.down('.label').update(presence.getDisplayText());
			}
		}else{
			this.offlineEl.addCls('selected');
			this.offlineEl.down('.label').update(presence.getDisplayText());
		}

		this.mon(this.el,'click','clicked',this);	
	},

	clicked: function(e){
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
	}
});