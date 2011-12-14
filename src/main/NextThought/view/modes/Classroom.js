

Ext.define( 'NextThought.view.modes.Classroom', {
	extend: 'NextThought.view.modes.Mode',
	alias:	'widget.classroom-mode-container',
	requires: [
			'NextThought.view.windows.ClassroomChooser'
	],

	border: false,
	defaults: {
		border: false,
		defaults: {
			border: false
		}
	},
	
    initComponent: function(){
		this.callParent(arguments);
		this.mainArea = this.add({
			border: false,
			flex:1,
			layout: 'fit',
			dockedItems:this.getEmptyToolbar()
		});
    },

	showClassChooser: function(){
		this.chooser = this.mainArea.add({xtype:'classroom-chooser'}).show().center();
	},

	hideClassChooser: function(){
		if(!this.chooser)return;
		this.chooser.close();
		delete this.chooser;
	},

    showClassroom: function(roomInfo) {
		var tb = this.down('toolbar');
		tb.removeAll();
		tb.add({text:'Leave Class', action: 'leave'});
        this.mainArea.add({xtype: 'classroom-content', roomInfo: roomInfo});
    },


	leaveClassroom: function(){
		var tb = this.down('toolbar');
		tb.removeAll();
		tb.add(this.getPlaceHolder());

		this.mainArea.removeAll(true);

		this.showClassChooser();
	},

	deactivate: function(){
		this.callParent(arguments);
		this.hideClassChooser();
	}
    
});
