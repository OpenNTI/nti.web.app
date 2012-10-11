Ext.define('NextThought.view.menus.file.BrowserItem',{
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
        this.href = true;
		this.callParent(arguments);
        delete this.href;
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
			multiple: (typeof window.FileReader !== 'undefined')
		}).on('change', me.onFileChange, me, {single: true});

		if(me.isDisabled()){
			me.fileInputEl.set({disabled: true});
		}
	},


	enable: function(){
		if(this.fileInputEl){
			this.fileInputEl.set({disabled: undefined});
		}
		return this.callParent(arguments);
	},

	disable: function(){
		if(this.fileInputEl){
			this.fileInputEl.set({disabled: true});
		}
		return this.callParent(arguments);
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
