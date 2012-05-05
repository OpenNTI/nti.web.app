Ext.define( 'NextThought.view.views.Classroom', {
	extend: 'NextThought.view.views.Base',
	alias:	'widget.classroom-view-container',
	requires: [
		'NextThought.view.classroom.ClassroomChooser',
		'NextThought.cache.IdCache'
	],

	cls: 'classroom-view',

	border: false,
	defaults: {
		border: false,
		defaults: {
			border: false
		}
	},

	afterRender: function(){
		this.callParent(arguments);

		this.mainArea = this.add({
			border: false,
			flex:1,
			layout: 'card',
			dockedItems: this.getDefaultToolbar()
		});
	},


	getDefaultToolbar: function() {
		return {
			xtype:'toolbar',
			cls:'x-docked-noborder-top',
			items: this.getClassItemsSplitButton()
		};
	},


	getClassItemsSplitButton: function() {
		var s = Ext.StoreManager.get('Providers'),
			btn;

		function edit(e){
			var i = e.parentMenu.parentItem;
			i.fireEvent('click',i);
		}

		function deleteItem(e){
			var i = e.parentMenu.parentItem;
			i.fireEvent('delete-clicked',i);
		}

		function manageScripts(e) {
			var i = e.parentMenu.parentItem;
			i.fireEvent('manageScripts',i);

		}

		function loaded(){
			var ci, i, items=[], d;

			for (i = 0; i < s.getTotalCount(); i++) {
				ci = s.getAt(i);
				d = !(ci.isModifiable());
				items.push({
					text: ci.get('ID'),
					classInfoId: ci.getId(),
					menu: [
						{text:'<b>Edit...</b>', cls:'default', handler: edit, disabled: d},
						{text:'Delete', handler: deleteItem, disabled: d},
						'-',
						{text:'Manage Resources', handler: manageScripts}
					]
				});
			}

			//always an add new
			if(items.length>0) {
				items.push('-');
			}
			items.push({text: 'Create a Class...', create:true});

			if (btn) {
				btn.menu.removeAll(true);
				btn.menu.add(items);
				return null;
			}

			return items;
		}

		return {
			xtype: 'button',
			text: 'Manage Classes',
			action: 'manageclass',
			menu: loaded(),
			listeners: {
				beforedestroy: function (){ s.un('load', loaded, this); },
				added: function (c){ s.on('load', loaded, this); btn = c; }
			}
		};
	},


	showClassChooser: function(enableClose){
		this.chooser = this.mainArea.add({xtype:'classroom-chooser', enableClose: enableClose}).show().center();
	},

	hideClassChooser: function(){
		if(!this.chooser) {
			return;
		}
		this.chooser.close();
		delete this.chooser;
	},

	showClassroom: function(roomInfo) {
		var me = this,
			tb = me.down('toolbar'),
			cb = tb.down('button[title=Classes]'),
			fb = tb.down('button[action=flagged]'),
			db = tb.down('button[action=manageclass]');


		//delete manage class toolbar button if it's there
		if (db) {
			tb.remove(db);
		}

		//switch to the appropriate room (adds if necessary)
		me.switchTo(roomInfo);

		//add toolbar buttons if they aren't there.
		if (!cb) {
			tb.add({
				text: 'Classes',
				tooltip:'Open other classes',
				handler: function(){
					me.showClassChooser(true);			}
			});
		}

		if (!fb) {
			//insert flagged messages button
			tb.add('->');
			tb.add({
				iconCls: 'flag',
				disabled: true,
				menu: [],
				action: 'flagged',
				xtype: 'splitbutton',
				tooltip:'flagged messages'
			});
		}

		me.addClassroomToSwitcher(roomInfo);
		this.getClassroomSwitcherButton().setText(ClassroomUtils.getClassSectionNameFromRoomInfo(roomInfo, 'Unknown'));
	},


	getClassroomSwitcherButton: function(){
		return this.down('button[action=classroom-switcher]');
	},


	getCurrentRoom: function() {
		return this.mainArea.getLayout().getActiveItem().roomInfo;
	},


	addClassroomToSwitcher: function(roomInfo) {
		var b = this.getClassroomSwitcherButton(),
			tb = this.down('toolbar'),
			lc = tb.down('button[action=leave]'),
			me = this,
			roomName = ClassroomUtils.getClassSectionNameFromRoomInfo(roomInfo, 'Unknown');

		//If the switcher does not currently exist, create it.
		if (!b) {
			b = tb.add(1, {
				menu: [],
				action: 'classroom-switcher',
				xtype: 'button',
				tooltip:'Open Classrooms'
			});
		}

		if (!lc) {
			tb.insert(1, {
				text:'Leave Class',
				action: 'leave'
			});
		}

		//add to it
		b.menu.add(
			{
				text: roomName,
				roomGuid: IdCache.getIdentifier(roomInfo.getId()),
				roomId: roomInfo.getId(),
				group: 'class-options',
				action: 'class-options',
				handler: function(e) {
					e.checked = true;
					me.switchTo(e.roomId, e.text);
				}
			}
		);
	},


	removeMenuItem: function(guid) {
		var b = this.getClassroomSwitcherButton(),
			i = b ? b.menu.down('[roomGuid='+guid+']') : null;

		if (b && i){
			b.menu.remove(i, true);
		}
	},


	switchTo: function(idOrRoomInfo, roomName) {
		var ri = idOrRoomInfo.getId ? idOrRoomInfo : null,
			id = ri ? ri.getId() : idOrRoomInfo,
			b = this.getClassroomSwitcherButton(),
			view = this.findItem(id);

		//If a roomInfo is passed in, see if it's aready in our modes, and switch to it.
		if (ri && !view) {
			//room info passed in but we dont know about it yet, add it and switch to it.
			view = this.mainArea.add({xtype: 'classroom-content', roomInfo: ri, roomGuid: IdCache.getIdentifier(id)});
			this.mainArea.getLayout().setActiveItem(view);
		}
		//otherwise, we should know about it if given an id, just switch to it
		else if (view){
			this.mainArea.getLayout().setActiveItem(view);
		}
		else {
			console.error('Cannot switch to a classroom of ' + id + '.  I dont know the RoomInfo.');
		}

		//adjust the switcher button to have the correct text
		if (b) { b.setText(roomName); }
	},


	leaveClassroom: function(){
		var tb = this.down('toolbar'),
			lo = this.mainArea.getLayout(),
			currentItem = lo.getActiveItem(),
			nextItem;

		//delete the mode we are currently in
		this.mainArea.remove(currentItem, true);
		this.removeMenuItem(currentItem.roomGuid);

		//if there is another active mode, switch to it and we are done
		nextItem = this.findNextItem();
		if (nextItem) {
			this.switchTo(nextItem.roomInfo, ClassroomUtils.getClassSectionNameFromRoomInfo(nextItem.roomInfo, 'Unknown'));
			return;
		}

		//if we get here, there's nothing left, go back to chooser
		this.showClassChooser();
		tb.removeAll();
		tb.add(this.getClassItemsSplitButton());
	},


	findNextItem: function() {
		var is = this.mainArea.getLayout().getLayoutItems(),
			i;

		for(i in is) {
			if (is.hasOwnProperty(i) && is[i].roomInfo) {
				return is[i];
			}
		}

		//no return yet, return null:
		return null;
	},


	findItem: function(id) {
		if (!this.mainArea) {
			//this may not have been rendered yet and others are trying to figure out if
			//items exist in a classroom, just return null, means no
			return null;
		}

		var is = this.mainArea.getLayout().getLayoutItems(),
			i;

		for(i in is) {
			if (is.hasOwnProperty(i) && is[i].roomInfo) {
				if (is[i].roomInfo.getId() === id) {
					return is[i];
				}
			}
		}

		//no return yet, return null:
		return null;
	},


	hasActiveClassrooms: function() {
		return (this.mainArea.getLayout().getLayoutItems().length > 0);
	},


	deactivate: function(){
		this.callParent(arguments);
		this.hideClassChooser();
	}
});
