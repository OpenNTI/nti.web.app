Ext.define('NextThought.controller.Classroom', {
    extend: 'Ext.app.Controller',


    views: [
        'content.Classroom',
		'modes.Classroom',
        'widgets.classroom.Browser',
        'widgets.classroom.LiveDisplay',
        'widgets.classroom.Management',
        'widgets.classroom.Moderation',
        'windows.ClassRoomChooser',
        'NextThought.util.Classroom',
        'Viewport'
    ],

	refs:[
		{ref: 'classroomContainer', selector: 'classroom-mode-container'},
		{ref: 'classroom', selector: 'classroom-content'},
        {ref: 'liveDisplay', selector: 'live-display'},
        { ref: 'viewport', selector: 'master-view' }
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

    loadContent: function()
    {
        //TEMP init some data into the live display
        //TODO: This puts some default data into the content display, by virtue of the belongsTo iVar on the reader,
        //          the tracker is ommitted.  Not sure if that's right or not, but it is for now.  There's still a left side gap though
        //          and I don't know how to get rid of it.
        var b = Library.getTitle('/prealgebra/eclipse-toc.xml');
        this.getLiveDisplay().getReaderPanel().setActive(b, '/prealgebra/sect0001.html', true);
    },

	isClassroom: function(roomOrMessageInfo){
		if(!roomOrMessageInfo)return false;
		var c = roomOrMessageInfo.get('ContainerId');
		return (c in this.rooms || (/:/i.test(c) && ClassroomUtils.isClassroomId(c)));
	},


	onMessage: function(message, options){
		this.getClassroom().onMessage(message,options);
	},


	onEnteredRoom: function(roomInfo){
		this.rooms[roomInfo.getId()] = roomInfo;
		this.getClassroomContainer().showClassroom(roomInfo);

        //load content into live display:
        this.loadContent();
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

		this.getController('Chat').enterRoom([],{ContainerId: n});
		this.getClassroomContainer().hideClassChooser();
	},

    isActive: function()
    {
        return /classroom-mode-container/i.test(this.getViewport().getActive().xtype);
    }


});
