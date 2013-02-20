Ext.define('NextThought.view.profiles.ProfileFieldEditor',{
	extend: 'Ext.Editor',
	alias: 'widget.profile-field-editor',

	allowBlur: false,
	cancelOnBlur: true, //Only valid if allowBlur is true this has no effect.  If allowBlur is false this will trigger a blur to cancel edit

	ignoreNoChange: true,
	revertInvalid: false,

	autoSize: {width: 'boundEl'},

	controlTemplateObj: {
		cls: 'controls',
		cn: [{cls: 'cancel', html: 'Cancel'}, {cls: 'save', html: 'Save'}]
	},


	afterRender: function(){
		this.callParent(arguments);
		Ext.DomHelper.append(this.el, this.controlTemplateObj);
		this.mon(this.el.down('.save'), 'click', this.completeEdit, this);
		this.mon(this.el.down('.cancel'), 'click', this.cancelEdit, this);
	}
});
