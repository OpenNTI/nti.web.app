Ext.define('NextThought.controller.Classroom', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.util.ClassroomUtils'
	],

	views: [
		'content.Classroom',
		'views.Classroom',
		'form.ClassInfoForm',
		'form.SectionInfoForm',
		'widgets.ClassroomBreadcrumb',
		'widgets.classroom.Browser',
		'widgets.classroom.BrowserStudyGroups',
		'widgets.classroom.ResourceView',
		'widgets.LinkButton',
		'widgets.classroom.LiveDisplay',
		'widgets.classroom.Management',
		'widgets.classroom.ScriptLog',
		'windows.ClassCreateEditWindow',
		'windows.ClassroomChooser',
		'windows.ClassResourceEditor',
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
		{ ref: 'classroomContainer', selector: 'classroom-view-container' },
		{ ref: 'viewport', selector: 'master-view' },
		{ ref: 'classResourceEditor', selector: 'class-resource-editor' }
	],

	init: function(){
		this.resourceEditorMap = {
			'application/vnd.nextthought.classscript' : this.resolveAndOpenClassScriptEditor,
			'classroom:application/vnd.nextthought.classscript' : this.resolveAndOpenClassScriptLog,
			'image/jpeg': this.openImageViewer,
			'classroom:image/jpeg': this.sendImageAsContent
		};

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

			'classroom-view-container toolbar button[action=leave]':{
				'click': this.leaveRoom
			},

			'classroom-view-container classroom-content' : {
				'content-message-received': this.onMessageContentNavigate
			},

			'classroom-view-container' : {
				'view-activated' : this.classroomActivated
			},

			'classroom-view-container splitbutton[action=flagged] menuitem': {
				'click': this.flaggedMenuItemClicked
			},

			'classroom-view-container splitbutton[action=flagged]': {
				'click' : this.flaggedButtonClicked
			},

			'classroom-view-container button[action=manageclass] menuitem': {
				'click': this.manageClassMenuItemClicked,
				'delete-clicked' : this.deleteClassClicked,
				'manageScripts' : this.manageClassScriptsClicked
			},

			'class-create-edit-window toolbar button[action]' : {
				'click' : this.onClassroomEditorAction
			},
			'class-resource-editor menuitem[addscript]': {
				'click': this.onAddNewScriptClicked
			},

			'class-resource-editor combobox' : {
				'change': this.onClassScriptComboBoxChange
			},

			'class-resource-editor classroom-resource-view' : {
				'selected': this.onResourceSelected
			},

			'classroom-management classroom-resource-view' : {
				'selected': this.onResourceSelectedInClassroom
			},

			'body-editor button[action=save]' : {
				'click': this.onScriptSave
			},

			'body-editor button[action=cancel]' : {
				'click': this.onScriptCancel
			},

			'classroom-breadcrumbbar *[ntiid]' : {
				'click' : this.onClassroomNavigate
			}
		},{});
	},


	onSessionReady: function(){
		var app = this.application,
			s = $AppConfig.service,
			host = $AppConfig.server.host,
			pStore = this.getProvidersStore(),
			sStore = this.getSectionsStore(),
			pColl = s.getCollection('OU', 'providers'),
			sColl = s.getCollection('EnrolledClassSections'),
			pToken = {},
			sToken = {};

		if(pColl) {
			app.registerInitializeTask(pToken);
			pStore.on('load', function(s){ app.finishInitializeTask(pToken); }, this, {single: true});
			pStore.proxy.url = host+pColl.href;
			pStore.load({url:host+pColl.href});
		}
		else {
			console.warn('NO providers workspace!');
		}

		if(sColl) {
			app.registerInitializeTask(sToken);
			sStore.on('load', function(s){ app.finishInitializeTask(sToken); }, this, {single: true});
			sStore.proxy.url = host+sColl.href;
			sStore.load({url: host+sColl.href});
		}
		else {
			console.warn('NO providers workspace!');
		}
	},


	flaggedMenuItemClicked: function(mi) {
		this.showMessage(mi.relatedCmp);
	},


	deleteClassClicked: function(cmp) {
		var s = this.getProvidersStore(),
			ci = s.getById(cmp.classInfoId);

		if (ci && ci.isModifiable()) {
			ci.destroy();
			this.getProvidersStore().load();
			this.getSectionsStore().load();
		}
		else {
			console.error('Copuld not delete class', ci, 'it is either null or not modifiable.');
		}
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

		w = Ext.widget('class-resource-editor', {classInfo: this.getProvidersStore().getById(classId)});
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
		var isModel = Ext.isFunction(info.getId),
			c = isModel ? info.getId() : (info.Id || info),
			cid = isModel ? info.get('ContainerId') : (info.ContainerId || info);

		return (this.rooms.hasOwnProperty(c) || this.rooms.hasOwnProperty(cid));
	},


	onClassroomNavigate: function(btn){
		//trickery with up because menu's misbehave with up (only look at ownerCt)
		var rid = ClassroomUtils.getRoomInfoIdFromComponent(btn),
			ld = this.getClassroomDown(rid, 'live-display'),
			n = btn.ntiid;

		if (!rid || !n || !ld) {
			console.error('Cannot execute classroom navigation request, btn', btn);
			return;
		}

		ld.down('reader-panel').loadPage(n);
		ld.down('classroom-breadcrumbbar').updateLocation(n);
		this.recordState(n, null, false, rid);
	},


	onMessageContentNavigate: function(ntiid, roomId) {
		var s = $AppConfig.service,
			l = LocationProvider.getLocation(ntiid),
			ld = this.getClassroomDown(roomId, 'live-display'),
			href = null;

		if (l) {
			ld.down('reader-panel').loadPage(ntiid);
			ld.down('classroom-breadcrumbbar').updateLocation(ntiid);
			this.recordState(ntiid, null, true, roomId);
		}
	},


	onMessage: function(msg, opts){
		var cid;
		if (Ext.isArray(msg)){
			Ext.each(msg, function(o){
				this.getClassroomDown(o.get('ContainerId'), 'classroom-content').onMessage(o, {});
			}, this);

			return;
		}
		cid = msg.get('ContainerId');
		this.markScriptEntryAsSent(msg.getId(), cid);
		return this.getClassroomDown(cid, 'classroom-content').onMessage(msg,opts) ;
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
			this.openModerationPanel(roomInfo);
		}

		this.compileResources(roomInfo.get('ContainerId'), roomInfo.getId());
	},


	/**
	 *
	 * @param ri - raw response from the server, not a Record
	 */
	onFailedToEnterRoom: function(ri) {
		var cid = ri.ContainerId,
			id = ri.NTIID,
			s = this.getSectionsStore(),
			r = s.getById(cid),
			chooser = this.getClassroomContainer().chooser;

		delete this.rooms[id];

		if (chooser){
			chooser.notify('Failed to enter room.');
		}

		console.log('onFail', ri, r);
	},


	onClassroomEditorAction: function(btn) {
		var win = btn.up('window'),
			value,
			ci,
			me = this;

		if (btn.action === 'cancel') {
			win.close();
			return;
		}
		if (btn.action !== 'save') {
			return;
		}

		ci = win.down('class-info-form');
		if(!ci.getForm().isValid()){
			return;
		}

		value = ci.getValue();
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


	openModerationPanel: function(roomInfo) {
		var roomId = roomInfo.getId(),
			content = this.getClassroomDown(roomId, 'classroom-content'),
			mod = content.down('chat-log-view[moderated]'),
			view = content.down('chat-view');

		if (mod){return;} //already moderated

		content.showMod();
		view.initOccupants(true, roomInfo);
	},


	closeModerationPanel: function(roomInfo) {
		var roomId = roomInfo.getId(),
			content = this.getClassroomDown(roomId, 'classroom-content'),
			view = content.down('chat-view');

		content.removeMod();
		view.initOccupants(true, roomInfo);
	},


	onClassScriptComboBoxChange: function(cb) {
		var w = this.getClassResourceEditor(),
			reg = w.down('[region=east]');

		//If the editor region is open, collase it when we change
		if (reg) {
			reg.collapse();
			reg.removeAll(true);
		}

		w.down('classroom-resource-view').setRecord(cb.value);
	},


	onAddNewScriptClicked: function() {
		this.showResourceEditor(Ext.create('NextThought.model.ClassScript'));
	},


	onResourceSelectedInClassroom: function(r, cmp) {
		var href = $AppConfig.server.host + r.get('href'),
			name = ClassroomUtils.getNameFromHref(href),
			mime = r.get('type'),
			ntiid = r.get('ntiid'),
			rid = ClassroomUtils.getRoomInfoIdFromComponent(cmp);

		if (!rid){
			console.error('Cannot execute resource select, resource', r, 'component', cmp);
			return;
		}

		return this.resourceEditorMap['classroom:'+mime].call(this, href, name, this.getClassroomDown(rid, 'classroom-content'), ntiid, rid);
	},


	onOccupantsChanged: function(roomId, peopleWhoLeft, peopleWhoArrived) {
		var classroom = this.getClassroomDown(roomId, 'classroom-content');
		if(!classroom) {return;}
		classroom.down('chat-log-view[moderated=false]').occupantsChanged(peopleWhoLeft, peopleWhoArrived);
	},


	onModsChanged: function(roomId, left, added) {
		var classroom = this.getClassroomDown(roomId, 'classroom-content');
		if(!classroom) {return;}
		classroom.down('chat-log-view[moderated=false]').modsChanged(left, added);

		//TODO - maybe check if I'm mod here and do stuff...
	},


	onResourceSelected: function(r) {
		var href = $AppConfig.server.host + r.get('href'),
			mime = r.get('type'),
			name = ClassroomUtils.getNameFromHref(href);

		return this.resourceEditorMap[mime].call(this, href, name);
	},


	resolveAndOpenClassScriptEditor: function(href, name) {
		NextThought.model.ClassScript.load(href,
			{
				url: href,
				callback: Ext.bind(this.showResourceEditor, this, [name], true),
				scope: this
			});
	},


	resolveAndOpenClassScriptLog: function(href, name, classroom) {
		NextThought.model.ClassScript.load(href, {url: href, callback: function(r, o){
						classroom.addScriptView(r, name);
			}});
	},


	sendImageAsContent: function(href, name, classroom, ntiid, roomId) {
		this.getController('Chat').postMessage(this.getClassroomDown(roomId, 'classroom-content').roomInfo, {'ntiid': ntiid}, null, 'CONTENT');
	},


	openImageViewer: function(href, name) {
		var w = this.getClassResourceEditor(),
			reg = w.down('[region=east]'),
			v = { xtype: 'image', src: href};

		reg.removeAll(true);
		reg.add(v);
		reg.expand();
		w.doLayout();
	},


	showResourceEditor: function(r, e, n) {
		var w = this.getClassResourceEditor(),
			disableNameField = n ? true : false,
			className = w.classInfo.get('ID'),
			sectionName = w.down('classroom-resource-view').record.get('ID'),
			name = n || this.sanitizeClassScriptName(className, sectionName),
			reg = w.down('[region=east]'),
			editor = { xtype: 'body-editor', showButtons: true, record:r, scriptName: name, disabledNameField: disableNameField};

		reg.removeAll(true);
		reg.add(editor);
		reg.expand();
		w.doLayout();
	},


	sanitizeClassScriptName: function(className, sectionName) {
		var isClass = (className === sectionName),
			result = isClass ? className : className + '-' + sectionName;

		result += '_script';

		return result;
	},


	onScriptSave: function(btn) {
		var ed = btn.up('window'),
			html = ed.down('body-editor'),
			reg = ed.down('[region=east]'),
			scriptName = reg.down('textfield').value,
			v = html.getValue(),
			r = html.record,
			href = (!r || r.phantom) ? $AppConfig.server.host + ed.down('classroom-resource-view').record.get('href') : null,
			cs;

		ed.el.mask('Saving...');

		if (v && v.length > 0) {
			cs = r || Ext.create('NextThought.model.ClassScript', {ContainerId:ed.down('classroom-resource-view').record.getId()});
			cs.set('body', v);
			cs.save({
				headers: {'slug': scriptName},
				url: href,
				success:function(){
					ed.el.unmask();
					reg.collapse(Ext.Component.DIRECTION_RIGHT, true);
					ed.down('classroom-resource-view').reload();
				},
				failure: function() {
					ed.el.unmask();
					reg.el.mask('Problem saving script');
					setTimeout(function(){reg.el.unmask();}, 10000);
					console.error('Failed to save classscript', arguments);
				}});
		}
	},


	onScriptCancel: function(btn) {
		var r = btn.up('[region=east]');
		r.collapse(Ext.Component.DIRECTION_RIGHT, true);
	},


	recordState: function(ntiid, eopts, viaSocket, rid) {
		if (viaSocket !== true) {
			var ri = this.getClassroomDown(rid, 'classroom-content').roomInfo,
				id = !ntiid ? this.getReader(rid).getContainerId() : ntiid;

			this.getController('Chat').postMessage(ri, {'ntiid': id}, null, 'CONTENT');
		}
	},


	leaveRoom: function(cmp, evt, opts){
		//stop even propagation, class will now take care of itself
		evt.stopPropagation();
		evt.preventDefault();

		var c = this.getClassroomContainer(),
			ri = c.getCurrentRoom();

		//we're handling cleanup, don't let anyone else worry about it.
		ri.disableExitRoom=true;

		//actually leave room on server
		this.getController('Chat').leaveRoom(ri);

		//tell the view to leave the classroom
		c.leaveClassroom();

		delete this.rooms[ri.getId()];
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


	classroomActivated: function() {
		var c = this.getClassroomContainer();

		if(!c.hasActiveClassrooms()) {
			c.showClassChooser();
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
	compileResources: function(cid, roomId) {
		var sStore = this.getSectionsStore(),
			secIndex = sStore.find('NTIID', cid),
			sec = secIndex > -1 ? sStore.getAt(secIndex) : null;

		if (sec) {
			this.getClassroomDown(roomId, 'classroom-resource-view').setRecord(sec, true);
		}
	},


	getReader: function(roomId) {
		return this.getLiveDisplay(roomId).down('reader-panel');
	},


	markScriptEntryAsSent: function(id, roomId) {
		var genId = IdCache.getIdentifier(id),
			sView = this.getClassroomDown(roomId, 'script-log-view'),
			qResults = sView ? sView.query('script-entry[messageId='+genId+']') : null,
			entry = (qResults && qResults.length === 0) ? qResults[0] : null;

			//There may be no script entry, that's fine, just quit now
			if (!entry) {return;}

			//set the flag so it'll be styled appropriatly:
			entry.setPromoted();
			this.promotedScriptEntries.push(id);
	},


	getClassroomDown: function(roomId, css) {
		var i = this.getClassroomContainer().findItem(roomId);

		if(i && i.is(css)){
			return i;
		}

		return i ? i.down(css) : null;
	}
});

