Ext.define('NextThought.view.content.notepad.Item',{
	extend: 'Ext.Component',
	alias: 'widget.notepad-item',

	requires: [
		'NextThought.view.content.notepad.Editor'
	],

	ui: 'notepad-item',
	cls: 'note notepad-item',

	renderTpl: Ext.DomHelper.markup([
		'{body}'
	]),


	initComponent: function(){
		this.callParent(arguments);
		this.enableBubble(['detect-overflow', 'editor-closed', 'editor-open']);
		this.on({
			el: {
				contextmenu: 'contextMenu',
				mouseover:'eat',
				mousemove:'eat',
				click: 'edit'
			}
		});
	},


	eat: function(e){
		e.stopEvent();
		return false;
	},


	updateAnnotationMonitors: function(annotation){
		Ext.destroy(this.annotationMonitors);
		this.annotation = annotation;
		this.annotationMonitors = this.mon(annotation,{
			destroyable: true,
			//monitors go here...
			'cleanup':'destroy'//remove this widget if the annotation is cleaned.
		});
	},


	destroy: function(){
		console.log('cleaning up');
		return this.callParent(arguments);
	},


	updateRecordMonitors: function(record){
		Ext.destroy(this.recordMonitors);
		this.record = record;
		this.recordMonitors = this.mon(record,{
			destroyable: true,
			//monitors go here...
			'destroy':'destroy'//remove this widget if the record is deleted.
		});
	},


	updateWith: function(data){
		var me = this, el = me.getEl(),
			p = data.placement || 0;

		if( p !== this.getLocalY() ){
			this.setLocalY(p);
		}

		if( this.record !== data.record ){
			this.updateRecordMonitors(data.record);
		}

		if( this.annotation !== data.annotation ){
			this.updateAnnotationMonitors(data.annotation);
		}

		//Start with the stupid thing... (always draw)
		data.record.compileBodyContent(function(html,cb){
			me.renderTpl.overwrite(el,{body:html});
			if (Ext.isFunction(cb)) {
				Ext.each(cb(el, me), function (c) { me.on('destroy', 'destroy', c); });
			}
			me.checkOverflow();
		});
	},


	refresh: function(){
		this.updateWith({
			placement: this.getLocalY(),
			record: this.record,
			annotation: this.annotation
		});
	},


	contextMenu: function(e){
		console.log('context menu?');
	},


	checkOverflow: function(){
		this.fireEvent('detect-overflow');
	},


	edit: function(e){
		if(!this.editor) {
			this.update('');
			this.fireEvent('editor-open');
			this.addCls('edit');
			this.editor = Ext.widget({
				xtype: 'notepad-editor',
				ownerCmp: this,
				renderTo: this.getEl(),
				value: this.record.get('body'),
				listeners: {
					scope: this,
					blur: 'commitEdit',
					cancel: 'cancelEdit',
					keydown: {fn:'checkOverflow',buffer:200}
				}
			});
		}
		Ext.defer(this.editor.focus,1,this.editor);

		return this.eat(e);
	},


	cleanupEditor: function(){
		this.removeCls('edit');
		Ext.destroy(this.editor);
		delete this.editor;
		this.refresh();
		this.fireEvent('editor-closed');
	},


	cancelEdit: function(){
		this.cleanupEditor();
	},


	commitEdit: function(){
		var me = this, r = me.record,
			b = this.editor.getValue(),
			oldBody = r.get('body');

		if(b.join() == oldBody.join()){
			this.cleanupEditor();
			return;
		}

		r.set('body',b);

		this.cleanupEditor();

		if(Ext.isEmpty(b)){
			r.destroy();
			return;
		}

		r.save({
			failure: function(){
				console.error('coudn\'t save note');
				r.set('body',oldBody);
				me.refresh();
			}
		});
	}
});
