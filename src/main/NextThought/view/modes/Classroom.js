

Ext.define( 'NextThought.view.modes.Classroom', {
	extend: 'NextThought.view.modes.Mode',
	alias: 	'widget.classroom-mode-container',
	requires: [
			'NextThought.view.windows.ClassRoomChooser'
	],
	
    initComponent: function(){
   		this.callParent(arguments);
		this.mainArea = this.add({
			cls:'x-focus-pane',
			flex:1,
			layout: 'fit',
			dockedItems:this.getEmptyToolbar()
		});
    },

	showClassChooser: function(){
		this.chooser = this.mainArea.add(Ext.widget('classroom-chooser')).show().center();
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
        this.mainArea.add(Ext.widget('classroom-content',{roomInfo: roomInfo}));
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
