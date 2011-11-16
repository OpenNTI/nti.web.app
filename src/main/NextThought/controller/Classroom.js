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
		this.rooms = {};

		this.control({
			'classroom-browser':{
				'selected': this.selectedClassRoom
			},

			'classroom-mode-container toolbar button[action=leave]':{
				'click': this.leaveRoom
			}

		},{});
	},


	isClassroom: function(roomOrMessageInfo){
		if(!roomOrMessageInfo)return false;
		var c = roomOrMessageInfo.get('ContainerId');
		return (c in this.rooms || (/:/i.test(c) && /meetingroom/i.test(c)));
	},


	onMessage: function(message, options){
		this.getClassroom().onMessage(message,options);
	},


	onEnteredRoom: function(roomInfo){
		this.rooms[roomInfo.getId()] = roomInfo;
		this.getClassroomContainer().showClassroom(roomInfo);
	},


	leaveRoom: function(){
		var room = this.getClassroom().roomInfo,
			id = room.getId();
		delete this.rooms[id];
		this.getClassroomContainer().leaveClassroom();
		this.getController('Chat').leaveRoom(room);
	},


	selectedClassRoom: function(model){
		var n = model.get('NTIID');

		console.log(n, model);

		this.getController('Chat').enterRoom([],{ContainerId: n});
		this.getClassroomContainer().hideClassChooser();
	}


});
