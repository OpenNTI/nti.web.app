Ext.define('NextThought.view.menus.PresenceEditor',{
	extend: 'Ext.Editor',
	alias: 'widget.presence-editor',

	updateEl: false,
	allowBlur: false,
	cancelOnBlur: true, //Only valid if allowBlur is true this has no effect.  If allowBlur is false this will trigger a blur to cancel edit

	ignoreNoChange: true,
	revertInvalid: false,
	alignment: 'l-l',
	updateEl: true,
	cls:['meta-editor','presence-editor'],


	controlTemplateObj: {
		cls: 'controls',
		cn: [{cls: 'cancel'}, {cls: 'save', html: 'Save'}]
	},


	afterRender: function(){
		this.callParent(arguments);
		Ext.DomHelper.append(this.el, this.controlTemplateObj);
		this.mon(this.el.down('.save'), 'click', this.completeEdit, this);
		this.mon(this.el.down('.cancel'), 'click', this.cancelEdit, this);
		//this.on('beforestatesave','saveEdit',this);
	},

	/*completeEdit: function(){
		var newPresence,
			currentPresence = Ext.getStore('PresenceInfo').getPresenceOf($AppConfig.username),
			value = this.field.value;

		if(this.activeTarget === 'offline' && currentPresence.isOnline()){
			newPresence = NextThought.model.PresenceInfo.createPresenceInfo($AppConfig.username,'')
		}
		console.log("Completing Edit");
	},*/

	startEdit: function(t,v){

		return this.callParent([t,v]);
	}
});