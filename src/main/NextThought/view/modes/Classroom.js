Ext.define( 'NextThought.view.modes.Classroom', {
	extend: 'NextThought.view.modes.Mode',
	alias:	'widget.classroom-mode-container',
	requires: [
			'NextThought.view.windows.ClassroomChooser'
	],

	cls: 'classroom-mode',

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
			layout: 'fit',
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
		var items = [],
			s = Ext.StoreManager.get('Providers'),
			ci, i,
			me = this,
			menu;

		for (i = 0; i < s.getTotalCount(); i++) {
			ci = s.getAt(i);
			items.push({text: ci.get('ID'), classInfoId: ci.getId()});
		}

		//always an add new
		items.push('-');
		items.push({text: 'create class', create:true});

		menu = Ext.create('Ext.menu.Menu', {
			items: items
		});

		return {
			xtype: 'splitbutton',
			text: 'Manage Classes',
			action: 'manageclass',
			menu: menu
		};
	},


	showClassChooser: function(){
		this.chooser = this.mainArea.add({xtype:'classroom-chooser'}).show().center();
	},

	hideClassChooser: function(){
		if(!this.chooser) {
			return;
		}
		this.chooser.close();
		delete this.chooser;
	},

	showClassroom: function(roomInfo) {
		var tb = this.down('toolbar');
		tb.removeAll();
		tb.insert(0, {text:'Leave Class', action: 'leave'});
		this.mainArea.add({xtype: 'classroom-content', roomInfo: roomInfo});

		//insert flagged messages button
		tb.add({
			iconCls: 'flag',
			disabled: true,
			menu: [],
			action: 'flagged',
			xtype: 'splitbutton',
			tooltip:'flagged messages'
		});
	},


	leaveClassroom: function(){
		var tb = this.down('toolbar');
		this.mainArea.removeAll(true);
		this.showClassChooser();

		tb.removeAll();
		tb.add(this.getClassItemsSplitButton());
	},

	deactivate: function(){
		this.callParent(arguments);
		this.hideClassChooser();
	}
	
});
