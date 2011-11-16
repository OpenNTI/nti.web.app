

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

    showTeacherClassroom: function() {
        this.mainArea.add(Ext.widget('classroom-content')).show()
    },

	activate: function(){
		this.callParent(arguments);

		// if(!this.activeClass)
		//	this.showClassChooser();
        //else
            this.showTeacherClassroom();
	},

	deactivate: function(){
		this.callParent(arguments);
		this.hideClassChooser();
	}
    
});
