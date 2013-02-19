Ext.define('NextThought.view.profiles.ProfileFieldEditor',{
	extend: 'Ext.Editor',
	alias: 'widget.profile-field-editor',

	allowBlur: false,
	cancelOnBlur: true, //Only valid if allowBlur is true this has no effect.  If allowBlur is false this will trigger a blur to cancel edit

	ignoreNoChange: true,
	revertInvalid: false,

	autoSize: {width: 'boundEl'},


	afterRender: function(){
		this.callParent(arguments);
		//Add overflow:visible,
		//Hang buttons off the this.el
	}
});
