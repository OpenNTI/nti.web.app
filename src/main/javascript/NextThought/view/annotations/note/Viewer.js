Ext.define('NextThought.view.annotations.note.Viewer',{
	extend: 'Ext.container.Container',
	alias: 'widget.note-window',

	requires: [
		'NextThought.view.annotations.note.Main'
	],

	cls: 'note-window',
	ui: 'note-window',
	width: 780,
	floating: true,
	shadow: false,
	preventBringToFront:true,
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	items: [
		{
			xtype: 'box',
			autoEl: {
				cls: 'title-bar nti-window-header',
				cn: [
					{
						cls: 'close-note-viewer'
					}
				]
			},
			listeners:{
				'click': {
					element: 'el',
					fn: 'closeViewer' 
				}
			},
			closeViewer: function(e){
				if(!e.getTarget('.close-note-viewer')){ return; }
				
				this.getRefOwner().close();
			}
		},
		{
			noteWindowBody: true,
			xtype: 'container',
			cls: 'note-content-container scrollbody',
			flex: 1,
			autoScroll: true,
			items: [
				{xtype: 'note-main-view' },
				{xtype: 'box', cls: 'note-footer'}
			]
		}
	],

	constructor: function(){
		Ext.each(Ext.ComponentQuery.query('note-window'),function(w){w.closeOrDie();});
		this.callParent(arguments);
	},


	initComponent: function(){
		var m;
		this.callParent(arguments);

		m = this.down('note-main-view');
	
		if(this.isEdit){
			m.editMode = this.isEdit;
		}

		if(this.replyToId){
			m.replyToId = this.replyToId;
		}
        if (this.scrollToId) {
            m.scrollToId = this.scrollToId;
        }

        m.setRecord(this.record);
		m.on('destroy','destroy',this);
	},

	afterRender: function(){
		this.callParent();
		this.resizeView();
	},

	resizeView: function(){
		var position, height, width,
			viewportHeight = Ext.Element.getViewportHeight(),
			reader = Ext.getCmp('readerPanel');

		if(reader){
			position = reader.getPosition();
			position[0] -= 10;
			position[1] += 10;
			width = reader.getWidth() + 20;
			height = viewportHeight - position[1];

			this.setPosition(position);
			this.setWidth(width);
			this.setHeight(height);
		}
	},


	canClose: function(){
		return !this.down('note-main-view').editorActive();
	},


	closeOrDie: function(){
		if(!this.close()){
			Ext.Error.raise('Editor open, refusing to close.');
		}
	},


	close: function(){
		//Only close if the editor is not active.
		if( this.canClose() ){
			this.destroy();
			return true;
		}

		this.warnBeforeDismissingEditor();
		return false;
	},


	warnBeforeDismissingEditor: function(){
		Ext.defer(alert, 1, null, [{
			msg: "You are currently creating a reply, please save or cancel it first."
		}]);
	}
});
