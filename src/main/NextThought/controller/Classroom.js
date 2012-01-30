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
		'widgets.classroom.ResourceView',
		'widgets.LinkButton',
		'widgets.classroom.LiveDisplay',
		'widgets.classroom.Management',
		'widgets.classroom.ScriptLog',
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
		{ ref: 'classScriptEditor', selector: 'class-script-editor' },
		{ ref: 'classroom', selector: 'classroom-content' },
		{ ref: 'liveDisplay', selector: 'live-display' },
		{ ref: 'viewport', selector: 'master-view' },
		{ ref: 'reader', selector: 'reader-panel' },
		{ ref: 'scriptView', selector: 'script-log-view' },
		{ ref: 'resourceView', selector: 'classroom-resource-view' }
	],

	init: function(){
		this.rooms = {};
		this.promotedScriptEntries = [];

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
				'click': this.manageClassMenuItemClicked,
				'manageScripts' : this.manageClassScriptsClicked
			},

			'class-create-edit-window toolbar button[action]' : {
				'click' : this.onClassroomEditorAction
			},

			'classroom-content chat-occupants-list tool[action=moderate]' : {
				'click' : this.onModerateClicked
			},

			'class-script-editor menuitem[addscript]': {
				'click': this.onAddNewScriptClicked
			},

			'class-script-editor combobox' : {
				'change': this.onClassScriptComboBoxChange
			},

			'classroom-resource-view' : {
				'select': this.onResourceSelected
			},

			'body-editor button[savescript]' : {
				'click': this.onScriptSave
			}
		},{});
	},

	onSessionReady: function(){
		var s = _AppConfig.service,
			host = _AppConfig.server.host,
			pColl = s.getCollection('OU', 'providers'),
			sColl = s.getCollection('EnrolledClassSections');

		if(pColl) {
			this.getProvidersStore().proxy.url = host+pColl.href;
			this.getProvidersStore().load({url:host+pColl.href});
		}
		else {
			console.warn('NO providers workspace!');
		}

		if(sColl) {
			this.getSectionsStore().proxy.url = host+sColl.href;
			this.getSectionsStore().load({url: host+sColl.href});
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


	manageClassScriptsClicked: function(cmp) {
		var classId = cmp.classInfoId,
			w;

		if (!classId) {return;}

		w = Ext.widget('class-script-editor', {classInfo: this.getProvidersStore().getById(classId)});
		w.show();
	},


	flaggedButtonClicked: function(btn){
		var i = btn.menu.items,
			c = (btn.lastAction+1) % i.getCount();

		btn.lastAction = isNaN(c) ? 0 : c;

		this.flaggedMenuItemClicked(i.getAt(btn.lastAction));
	},


	isClassroom: function(info){
		if(!info) {
			return false;
		}
		var c = Ext.isFunction(info.get) ? info.get('ContainerId') : info.ContainerId;

		if (this.rooms.hasOwnProperty(c)) {
			this.rooms[c] = info;
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
		this.markScriptEntryAsSent(msg.getId());
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

		this.compileResources(roomInfo.get('ContainerId'));
	},


	/**
	 *
	 * @param ri - raw response from the server, not a Record
	 */
	onFailedToEnterRoom: function(ri) {
		var ci = ri.ContainerId,
			s = this.getSectionsStore(),
			r = s.getById(ci),
			chooser = this.getClassroomContainer().chooser;

		delete this.rooms[ci];

		if (chooser){
			chooser.notify('something');
		}

		console.log('onFail', ri, r);
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

		content.addScriptView();
		content.showMod();
		//mod.show();
		view.initOccupants(true);
	},


	onClassScriptComboBoxChange: function(cb) {
		this.getClassScriptEditor().down('classroom-resource-view').setRecord(cb.value);
	},


	onAddNewScriptClicked: function() {
		var reg = this.getClassScriptEditor().down('[region=east]'),
			editor = { xtype: 'body-editor', showButtons: true, record:Ext.create('NextThought.model.ClassScript')};

		reg.add(editor);
	},


	onScriptSave: function() {
		var ed = this.getClassScriptEditor(),
			v = ed.down('body-editor').getValue(),
			href = _AppConfig.server.host + ed.down('classroom-resource-view').record.get('href'),
			cs;

		debugger;
		console.log('script to save:', v);

		if (v && v.length > 0) {
			cs = Ext.create('NextThought.model.ClassScript', {body: v, ContainerId:ed.down('classroom-resource-view').record.getId()});
			cs.save({url: href});
			console.log('cs', cs);
		}

	},


	onResourceSelected: function() {
		console.log('resource selected', arguments);
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
	},

	/*
	Find the section and pass it to the resource view to load
	NOTE: The containerId of a RoomInfo should match the NTIID of a section info if
		the room was spawned from a section, otherwise it won't match.
	 */
	compileResources: function(cid) {
		var sStore = this.getSectionsStore(),
			secIndex = sStore.find('NTIID', cid),
			sec = secIndex > -1 ? sStore.getAt(secIndex) : null;

		if (sec) {
			this.getResourceView().setRecord(sec, true);
		}
	},

	markScriptEntryAsSent: function(id) {
		console.log('debug me...');
		var genId = IdCache.getIdentifier(id),
			qResults = this.getScriptView().query('script-entry[messageId='+genId+']'),
			entry = (qResults && qResults.length === 0) ? qResults[0] : null;

			//There may be no script entry, that's fine, just quit now
			if (!entry) {return;}

			//set the flag so it'll be styled appropriatly:
			entry.setPromoted();
			this.promotedScriptEntries.push(id);
	}
});

