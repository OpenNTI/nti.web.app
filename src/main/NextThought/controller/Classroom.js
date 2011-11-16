Ext.define('NextThought.controller.Classroom', {
    extend: 'Ext.app.Controller',


    views: [
        'content.Classroom',
        'widgets.classroom.Browser',
        'widgets.classroom.LiveDisplay',
        'widgets.classroom.Management',
        'widgets.classroom.Moderation',
        'windows.ClassRoomChooser'
    ],


	init: function(){
		this.control({
			'classroom-browser':{
				'selected': this.selectedClassRoom
			}

		},{});
	},


	selectedClassRoom: function(){
		console.log(arguments);
	}


});
