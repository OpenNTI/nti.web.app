Ext.define('NextThought.controller.Classroom', {
    extend: 'Ext.app.Controller',

    requires: [
        'NextThought.util.Classroom'
    ],

    views: [
        'content.Classroom',
		'modes.Classroom',
        'widgets.classroom.Browser',
        'widgets.classroom.LiveDisplay',
        'widgets.classroom.Management',
        'widgets.classroom.Moderation',
        'windows.ClassroomChooser',
        'windows.ClassroomEditor',
        'Viewport'
    ],

	refs:[
		{ ref: 'classroomContainer', selector: 'classroom-mode-container' },
		{ ref: 'classroom', selector: 'classroom-content' },
        { ref: 'liveDisplay', selector: 'live-display' },
        { ref: 'viewport', selector: 'master-view' },
        { ref: 'reader', selector: 'reader-panel' }
	],

	init: function(){
		this.rooms = {};

		this.control({
			'classroom-browser':{
				'selected': this.selectedClassRoom
			},

			'classroom-chooser link':{
				'click': this.createClassClicked
			},

			'classroom-mode-container toolbar button[action=leave]':{
				'click': this.leaveRoom
			},

            'classroom-mode-container classroom-content' : {
                'content-message-received': this.onMessageContentNavigate
            },

            'classroom-mode-container' : {
                'mode-activated' : this.classroomActivated
            },

            'classroom-mode-container reader-panel' : {
                'unrecorded-history' : this.recordState
            }



		},{});
    },

	isClassroom: function(roomOrMessageInfo){
		if(!roomOrMessageInfo)return false;
		var c = roomOrMessageInfo.get('ContainerId');
		return (c in this.rooms || (/:/i.test(c) && ClassroomUtils.isClassroomId(c)));
	},

    onMessageContentNavigate: function(ntiid) {
        var o = Library.findLocation(ntiid),
            book = o.book,
            href = o.location.getAttribute('href'),
            path = book.get('root')+href;

        //update classroom's state
        this.recordState(book, path, ntiid, null, true);

        //pass in boolean to skip adding this to history since classroom is synced
        this.getReader().restore({reader: { index: book.get('index'), page: path}});
    },

	onMessage: function(msg, opts){
		return this.getClassroom().onMessage(msg,opts);
	},


	onEnteredRoom: function(roomInfo){
		this.rooms[roomInfo.getId()] = roomInfo;
        this.getClassroomContainer().hideClassChooser();
		this.getClassroomContainer().showClassroom(roomInfo);
        this.getClassroomContainer().activate();

        //load content into live display:
        this.classroomActivated();
	},

    recordState: function(book, path, ntiid, eopts, viaSocket) {
        console.log('path', path, 'stack', printStackTrace().join('\n'));
        history.updateState({classroom: {reader: { index: book.get('index'), page: path}}});

        //If this navigate event came from somewhere other than the socket, we need to issue
        //a CONTENT message to the room.
        //TODO - this only works if you are a mod, how should this work?
        if (viaSocket !== true) {
            console.log('requesting content update on all pages');
            var ri = this.getClassroom().roomInfo,
                id = !ntiid ? this.getReader().getContainerId() : ntiid;

            this.getController('Chat').postMessage(ri, {'ntiid': id}, null, 'CONTENT');
        }
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


	createClassClicked: function(btn){
//		var c = this.getClassroomContainer();
//		c.hideClassChooser();
		Ext.widget('class-editor').show();
	},


    classroomActivated: function() {
        var c = this.getClassroomContainer(),
            ld = this.getLiveDisplay();

        //make sure activate makes it to live display if the classroom is up, if its not up, show chooser
		if(!c.down('classroom-content'))
            c.showClassChooser();
        else {
            if (ld._content.items.first() !== ld.getReaderPanel()) {
                ld._content.add(ld.getReaderPanel());
                ld.getReaderPanel().restore(this.getController('State').getState().classroom);
            }
        }
    }
});
