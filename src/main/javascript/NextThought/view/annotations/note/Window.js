Ext.define('NextThought.view.annotations.note.Window',{
	extend: 'NextThought.view.Window',
	alias: 'widget.note-window',

	requires: [
		'NextThought.view.annotations.note.FilterBar',
		'NextThought.view.annotations.note.Carousel',
		'NextThought.view.annotations.note.Main'
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
				{xtype: 'box', cls: 'note-footer'}
			]
		}
	],

	constructor: function(){
		Ext.each(Ext.ComponentQuery.query('note-window'),function(w){w.destroy();});
		return this.callParent(arguments);
	},


	initComponent: function(){
		var a = this.annotation, m, c;
		this.callParent(arguments);

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

		c = this.down('note-carousel').setRecord(a.getRecord());

		this.mon(LocationProvider, 'navigateComplete', this.destroy, this);

		this.mon(Ext.getBody(),'click',this.dismissClick, this);
	},

	canSelectRecord: function(){
		return !this.down('note-main-view').editorActive();
	},

	recordSelected: function(r){
		this.down('note-main-view').setRecord(r);
	},

	dismissClick: function(e){
		var t = e.getTarget(),
			p = t? Ext.fly(t).parent('body',true): null;

		if(!this.down('note-main-view').editorActive() //an editor is not active,
		&& !e.getTarget('.note-window') // the click did not fall inside the note window
		&& !e.getTarget('.nti-alert')   // the click did not fall in a messageBox( confirmation box)...
		&& p //the thing clicked, has to still have a parent node. (if it was a button in a dialog that has been destroyed,...)
		&& this.zIndexManager.getActive() === this){ // the note window is the top most active window
			this.destroy(); //then you can close the note window
		}
	},


	close: function(e){
		//Only close if the editor is not active.
		if(!this.down('note-main-view').editorActive()){
			this.callParent(arguments);
		}
	},


	getSearchTerm: function(){
		var search = this.down('note-filter-bar').down('simpletext');
		return search ? search.getValue() : '';
	}
});
