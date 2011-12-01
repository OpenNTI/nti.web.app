

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

	activate: function(){
		this.callParent(arguments);

        //make sure activate makes it to live display if the classroom is up, if its not up, show chooser
		if(!this.down('classroom-content'))
            this.showClassChooser();
        else this.down('live-display').activate();


	},

	deactivate: function(){
		this.callParent(arguments);
		this.hideClassChooser();
	}
    
});
