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
        'windows.ClassCreateEditWindow',
        'windows.ClassroomChooser',
        'windows.ClassScriptEditor',
        'Viewport'
    ],

	models: [
		'ClassInfo',
		'SectionInfo',
		'InstructorInfo'
	],

	stores: [
		'Providers'
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

		this.application.on('session-ready', this.onSessionReady, this);

		this.control({
			'classroom-browser':{
				'selected': this.selectedClassRoom
			},

			'classroom-browser-study-groups':{
				'selected': this.selectedClassRoom
			},

			'classroom-chooser dataview':{
				'selectionchange': this.onClassroomChooserSelectionChange
			},

			'classroom-chooser button[create]':{
				'click': this.createClassClicked
			},

            'classroom-chooser button[edit]':{
                'click': this.editClassClicked
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
            },

            'class-create-edit-window toolbar button[action]' : {
                'click' : this.onClassroomEditorAction
            }

		},{});
    },

	onSessionReady: function(){
		var store = this.getProvidersStore(),
			coll = _AppConfig.service.getCollection('Classes','OU');
		if(!coll){
			console.warn('NO classroom workspace!');
			return;
		}
		store.proxy.url = _AppConfig.server.host+coll.href;
		store.load();
	},


	onClassroomChooserSelectionChange: function(evt,sel){
		if(this.selectionClearing){
			return;
		}

		this.selectionClearing = true;

		Ext.each(evt.view.up('classroom-chooser').query('dataview'),function(v){
			if(evt.view !== v ){
				v.getSelectionModel().deselectAll(true);
			}
		});

        var button = Ext.ComponentQuery.query('classroom-chooser button[edit]')[0];
        if (sel[0].get('Class') === 'ClassInfo') button.enable();
        else button.disable();


		delete this.selectionClearing;
	},


	isClassroom: function(roomOrMessageInfo){
		if(!roomOrMessageInfo)return false;
		var c = roomOrMessageInfo.get('ContainerId');

        if (c in this.rooms) {
            this.rooms[c] = roomOrMessageInfo;
            return true;
        }
		return false;
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


    onClassroomEditorAction: function(btn) {
        var win = btn.up('window'),
            value;

        if (btn.action === 'cancel') {
            win.close();
            return;
        }
        if (btn.action !== 'save') return;

        value = win.down('class-info-form').getValue();

        console.log('save this', value);

        win.el.mask('Saving...');
        value.save({
            success:
                function(){
                    win.close();
                    this.getProvidersStore().load();
                },
            failure:
                function(){win.el.unmask();}
        });
    },


    recordState: function(book, path, ntiid, eopts, viaSocket) {
        history.updateState({classroom: {reader: { index: book.get('index'), page: path}}});

        //If this navigate event came from somewhere other than the socket, we need to issue
        //a CONTENT message to the room.
        //TODO - this only works if you are a mod, how should this work?
        if (viaSocket !== true) {
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

        this.rooms[n] = true;

		this.getController('Chat').enterRoom([],{ContainerId: n});
		this.getClassroomContainer().hideClassChooser();
	},

    createClassClicked: function(btn) {
        Ext.widget('class-create-edit-window').show();
    },


    //TODO - merge with above?  In this case we just grab the first class, we need to get the selected class...
    editClassClicked: function(btn) {
        var w = Ext.widget('class-create-edit-window'),
            d = Ext.ComponentQuery.query('classroom-browser')[0];

        w.setValue(d.getSelectionModel().getSelection()[0]);
        w.show();
    },


	createClassScriptClicked: function(btn){
//		var c = this.getClassroomContainer();
//		c.hideClassChooser();
		Ext.widget('class-script-editor').show();
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
