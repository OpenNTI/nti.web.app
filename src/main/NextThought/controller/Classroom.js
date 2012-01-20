Ext.define('NextThought.controller.Classroom', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.util.Classroom'
	],

	views: [
		'content.Classroom',
		'modes.Classroom',
		'form.ClassInfoForm',
		'form.SectionInfoForm',
		'widgets.classroom.Browser',
		'widgets.classroom.BrowserStudyGroups',
		'widgets.LinkButton',
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
		'InstructorInfo',
		'Provider'
	],

	stores: [
		'Providers',
		'Sections'
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

			'classroom-mode-container splitbutton[action=flagged] menuitem': {
				'click': this.flaggedMenuItemClicked
			},

			'classroom-mode-container splitbutton[action=flagged]': {
				'click' : this.flaggedButtonClicked
			},

			'classroom-mode-container button[action=manageclass] menuitem': {
				'click': this.manageClassMenuItemClicked
			},

			'class-create-edit-window toolbar button[action]' : {
				'click' : this.onClassroomEditorAction
			},

			'classroom-content chat-occupants-list tool[action=moderate]' : {
				'click' : this.onModerateClicked
			}
		},{});
	},

	onSessionReady: function(){
		var pStore = this.getProvidersStore(),
			pColl = _AppConfig.service.getCollection('OU', 'providers'),
			sStore = this.getSectionsStore(),
			sColl = _AppConfig.service.getCollection('EnrolledClassSections');

		if(pColl) {
			pStore.proxy.url = _AppConfig.server.host+pColl.href;
			pStore.load();
		}
		else {
			console.warn('NO providers workspace!');
		}

		if(sColl) {
			sStore.proxy.url = _AppConfig.server.host+sColl.href;
			sStore.load();
		}
		else {
			console.warn('NO providers workspace!');
		}
	},

	flaggedMenuItemClicked: function(mi) {
		this.showMessage(mi.relatedCmp);
	},


	manageClassMenuItemClicked: function(cmp) {
		var w = Ext.widget('class-create-edit-window'),
			s = this.getProvidersStore(),
			ci = s.getById(cmp.classInfoId),
			createNew = (cmp.create);

		if (!ci && !createNew ){return;}
		else if (!createNew){
			w.setValue(ci);
		}
		else {
			w.setValue(null);
		}
		w.show();
	},


	flaggedButtonClicked: function(btn){
		var i = btn.menu.items,
			c = (btn.lastAction+1) % i.getCount();

		btn.lastAction = isNaN(c) ? 0 : c;

		this.flaggedMenuItemClicked(i.getAt(btn.lastAction));
	},


	isClassroom: function(roomOrMessageInfo){
		if(!roomOrMessageInfo) {
			return false;
		}
		var c = roomOrMessageInfo.get('ContainerId');

		if (this.rooms.hasOwnProperty(c)) {
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


	/**
	 *
	 * @param roomInfo
	 * @param [moderated]
	 */
	onEnteredRoom: function(roomInfo, moderated) {
		this.rooms[roomInfo.getId()] = roomInfo;
		this.getClassroomContainer().hideClassChooser();
		this.getClassroomContainer().showClassroom(roomInfo);
		this.getClassroomContainer().activate();

		//load content into live display:
		this.classroomActivated();

		if (moderated) {
			this.onModerateClicked();
		}
	},


	onClassroomEditorAction: function(btn) {
		var win = btn.up('window'),
			value,
			me = this;

		if (btn.action === 'cancel') {
			win.close();
			return;
		}
		if (btn.action !== 'save') {
			return;
		}

		value = win.down('class-info-form').getValue();
		win.el.mask('Saving...');

		value.save({
			success:
				function(){
					win.close();
					me.getProvidersStore().load();
					me.getSectionsStore().load();
				},
			failure:
				function(){win.el.unmask();}
		});
	},


	onModerateClicked: function(btn) {
		var content = btn ? btn.up('classroom-content') : this.getClassroom(),
			mod = content.down('chat-log-view[moderated]'),
			view = content.down('chat-view');

		if (mod){return;} //already moderated

		content.showOnDeck();
		content.showMod();
		//mod.show();
		view.initOccupants(true);
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
		if (model.get('Class') === 'ClassInfo'){
			n = model.get('Sections')[0].get('NTIID');
			console.warn('entering first section for now.');
		}

		this.rooms[n] = true;

		this.getController('Chat').enterRoom([],{ContainerId: n});
		this.getClassroomContainer().hideClassChooser();
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
		if(!c.down('classroom-content')) {
			c.showClassChooser();
		}
		else {
			if (ld._content.items.first() !== ld.getReaderPanel()) {
				ld._content.add(ld.getReaderPanel());
				ld.getReaderPanel().restore(this.getController('State').getState().classroom);
			}
		}
	},


	getFlaggedMessagesButton: function() {
		return this.getClassroomContainer().down('button[action=flagged]');
	},

	showMessage: function(msgCmp) {
		msgCmp.up('chat-log-view').scroll(msgCmp);
	}
});

