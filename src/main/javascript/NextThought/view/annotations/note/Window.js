Ext.define('NextThought.view.annotations.note.Window',{
	extend: 'NextThought.view.Window',
	alias: 'widget.note-window',

	requires: [
		'NextThought.view.annotations.note.FilterBar',
		'NextThought.view.annotations.note.Carousel',
		'NextThought.view.annotations.note.Main',
		'NextThought.view.annotations.note.Responses',
		'NextThought.view.annotations.note.Reply'
	],

	cls: 'note-window',
	ui: 'note-window',
	minimizable: false,
	closable: true,
	modal: true,
	resizable: false,
	title: 'Comments',
	width: 670,
	height: '80%',

	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	items: [
		{xtype: 'note-filter-bar' },
		{xtype: 'note-carousel' },
		{
			noteWindowBody: true,
			xtype: 'container',
			cls: 'note-content-container scrollbody',
			autoScroll: true,
			flex: 1,
			layout: {
				type: 'vbox',
				align: 'stretch'
			},
			items: [
				{xtype: 'note-main-view' },
				{xtype: 'note-responses' },
				{xtype: 'box', cls: 'note-footer'}
			]
		}
	],


	initComponent: function(){
		var a = this.annotation, m;
		this.callParent(arguments);
		this._editorActive = false;

		m = this.down('note-main-view');
		m.prefix = a.prefix;
		if(this.isEdit){
			m.editMode = this.isEdit;
		}

		if(this.isReply){
			m.isReply = true;
		}
		this.down('note-carousel').setRecord(a.getRecord());

		this.mon(LocationProvider, 'navigateComplete', this.destroy, this);
	},


	editorActive: function(){
		return this._editorActive;
	},

	setEditorActive: function(active){
		console.log('Will mark window as having an ' + (active ? 'active' : 'inactive') + ' editor');
		if(this._editorActive === active){
			console.warn('Window already has an ' + (active ? 'active' : 'inactive') + ' editor. Unbalanced calls?');
			return;
		}
		this._editorActive = active;
		this.fireEvent(active ? 'editorActivated' : 'editorDeactivated', this);
	},

	checkAndMarkAsActive: function(){
		if(!this.editorActive()){
			this.setEditorActive(true);
			return true;
		}
		return false;
	},

	getSearchTerm: function(){
		var search = this.down('note-filter-bar').down('simpletext');
		return search ? search.getValue() : '';
	}
});
