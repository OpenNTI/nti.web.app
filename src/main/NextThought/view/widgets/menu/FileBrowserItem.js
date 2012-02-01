Ext.define('NextThought.view.widgets.menu.FileBrowserItem',{
	extend: 'Ext.menu.Item',
	cls: 'file-browser-menu',
	alias: 'widget.file-browser-menu-item',
	text: 'Browse...',
	iconCls: 'upload',

	initComponent: function(){
		delete this.menu;
		delete this.listeners;
		delete this.handler;
		this.callParent(arguments);
	},

	onClick: function(e){
		e.stopEvent = Ext.emptyFn;
		this.callParent(arguments);
	},

	onRender: function(){
		var me = this;
		me.callParent(arguments);
		me.createFileInput();
	},


	createFileInput : function() {
		var me = this;
		me.fileInputEl = me.el.createChild({
			name: Globals.guidGenerator(),
			cls: 'file-input',
			tag: 'input',
			type: 'file',
			size: 1,
			multiple: true
		}).on('change', me.onFileChange, me, {single: true});
	},


	onFileChange: function(e){
		if(!this.target){
			console.error('no target set!');
		}

		this.target.doUpload(e.target.files);
		this.fileInputEl.remove();
		this.createFileInput();
	}

});
