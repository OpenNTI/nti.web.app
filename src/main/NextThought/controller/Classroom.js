Ext.define('NextThought.controller.Classroom', {
    extend: 'Ext.app.Controller',


    views: [
        'content.Classroom',
		'modes.Classroom',
        'widgets.classroom.Browser',
        'widgets.classroom.LiveDisplay',
        'widgets.classroom.Management',
        'widgets.classroom.Moderation',
        'windows.ClassRoomChooser'
    ],

	refs:[
		{ref: 'classroomContainer', selector: 'classroom-mode-container'},
		{ref: 'classroom', selector: 'classroom-content'}
	],


	init: function(){
		this.control({
			'classroom-browser':{
				'selected': this.selectedClassRoom
			},

			'classroom-mode-container toolbar button[action=leave]':{
				'click': function(){ this.getClassroomContainer().leaveClassroom(); }
			}

		},{});
	},


	isClassroom: function(roomInfo){
		console.dir(roomInfo);
		return true;
	},


	onMessage: function(message, options){
		this.getClassroom().onMessage(message,options);
	},


	onEnteredRoom: function(roomInfo){
		//
		this.getClassroomContainer().showClassroom(roomInfo);
	},


	selectedClassRoom: function(model){
		var n = model.get('realname').toLowerCase().replace(/\s/g,'');

		console.log(n);

		this.getController('Chat').enterRoom([],{ID: n});
		this.getClassroomContainer().hideClassChooser();
	}


});
