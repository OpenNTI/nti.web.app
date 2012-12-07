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

	layout: 'anchor',
	defaults:{anchor: '100%'},
	items: [
		{xtype: 'note-filter-bar' },
		{xtype: 'note-carousel' },
		{
			anchor: '0 -117',
			noteWindowBody: true,
			xtype: 'container',
			cls: 'note-content-container scrollbody',
			autoScroll: true,
			items: [
				{xtype: 'note-main-view' },
				{xtype: 'note-responses' },
				{xtype: 'box', cls: 'note-footer'}
			]
		}
	],

	constructor: function(){
		Ext.each(Ext.ComponentQuery.query('note-window'),function(w){w.destroy();});
		return this.callParent(arguments);
	},


	initComponent: function(){
		var a = this.annotation, m;
		this.callParent(arguments);
		this.isEditorActive = false;

		m = this.down('note-main-view');
		m.prefix = a.prefix;
		if(this.isEdit){
			m.editMode = this.isEdit;
		}

		if(this.replyToId){
			m.replyToId = this.replyToId;
		}
        if (this.scrollToId) {
            m.scrollToId = this.scrollToId;
        }
		m.setRecord(a.getRecord());
		this.down('note-carousel').setRecord(a.getRecord());

		this.mon(LocationProvider, 'navigateComplete', this.destroy, this);

        //We can auto close this window if there is a click outside of it, however there are lots of little edge cases
        //where the window can accidentally close which need to be handled one by one.  This close to the release, I'm going
        //to take away this functionality, which I think is kind of annoying anyway.
		//this.mon(Ext.getBody(),'click',this.dismissClick, this);
	},


	dismissClick: function(e){
		if(!e.getTarget('.note-window')){
			this.destroy();
		}
	},


	editorActive: function(){
		return this.isEditorActive;
	},

	setEditorActive: function(active){
		console.log('Will mark window as having an ' + (active ? 'active' : 'inactive') + ' editor');
		if(this.isEditorActive === active){
			console.warn('Window already has an ' + (active ? 'active' : 'inactive') + ' editor. Unbalanced calls?');
			return;
		}
		this.isEditorActive = active;
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
