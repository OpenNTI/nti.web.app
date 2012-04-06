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
			name: 'file1',
			cls: 'file-input',
			tag: 'input',
			type: 'file',
			size: 1,
			multiple: !Ext.isIE9 //enable multi-select on FileAPI enabled browsers. (Clue: not IE9)
		}).on('change', me.onFileChange, me, {single: true});
	},


	onFileChange: function(e){
		if(!this.target){
			console.error('no target set!');
		}

		if(!e.target.files){
			this.target.doLegacyUpload(this);
		}
		else {
			this.target.doUpload(this.extractFileInput().files);
		}
	},


	//for Legacy
	isDirty: function(){ return true; },
	isFormField: true,
	isFileUpload: function() { return true; },
	getSubmitData: function(){ return null; },
	validate: function(){ return Boolean(this.fileInputEl.dom.value); },

	extractFileInput: function() {
		var fileInput = this.fileInputEl.dom;
		this.fileInputEl.remove();
		this.createFileInput();
		return fileInput;
	}

});
