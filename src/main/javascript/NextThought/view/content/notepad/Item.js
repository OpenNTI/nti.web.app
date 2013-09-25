Ext.define('NextThought.view.content.notepad.Item',{
	extend: 'Ext.Component',
	alias: 'widget.notepad-item',

	ui: 'notepad-item',
	cls: 'note notepad-item',

	renderTpl: Ext.DomHelper.markup([
		'{body}'
	]),


	initComponent: function(){
		this.callParent(arguments);
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
		var me = this, el = me.getEl();

		this.setLocalY(data.placement || 0);

		if( this.record !== data.record ){
			this.updateRecordMonitors(data.record);
		}

		if( this.annotation !== data.annotation ){
			this.updateAnnotationMonitors(data.record);
		}

		//Start with the stupid thing... (always draw)
		data.record.compileBodyContent(function(html,cb){
			me.renderTpl.overwrite(el,{body:html});
			if (Ext.isFunction(cb)) {
				Ext.each(cb(el, me), function (c) { me.on('destroy', 'destroy', c); });
			}
		});
	},


	contextMenu: function(e){
		alert('context menu?');
	},


	edit: function(e){
		alert('implement edit...');
		return this.eat(e);
	}
});
