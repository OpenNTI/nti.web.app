Ext.define('NextThought.view.profiles.ProfileFieldEditor',{
	extend: 'Ext.Editor',
	alias: 'widget.profile-field-editor',

	updateEl: false,
	allowBlur: false,
	cancelOnBlur: true, //Only valid if allowBlur is true this has no effect.  If allowBlur is false this will trigger a blur to cancel edit

	ignoreNoChange: true,
	revertInvalid: false,
	alignment: 'l-l',

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

		this.on({
			'complete':'textTransform',
			'canceledit':'textTransform'
		});
	},


	textTransform: function(){
		this.boundEl.setStyle({textTransform:null});
	},


	startEdit: function(t,v){
		var me = this;
		//Ensure the editor is wide enough to see something...
		function resetWidth(){ me.autoSize.width='boundEl'; }
		if(t.getWidth() < 150){
			me.autoSize.width = 150;
		}

		this.on({deactivate:resetWidth,single:true});

		if( t.getVisibilityMode() === Ext.Element.DISPLAY ){
			if(!t.isVisible()){
				t.show();//undo display:none
			}
			t.setVisibilityMode(Ext.Element.VISIBILITY);//ensure we are not mode DISPLAY...otherwise we can't align to it.
		}
		t.setStyle({textTransform:'none'});//temporarily remove any transforms so we can edit the raw value.
		return this.callParent([t,v]);
	}
});
