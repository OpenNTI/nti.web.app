Ext.define('NextThought.view.content.notepad.View',{
	extend: 'Ext.Component',
	alias: 'widget.content-notepad',

	requires:[
		'NextThought.ux.ComponentReferencing'
	],

	plugins:[
		'component-referencing'
	],

	renderTpl: Ext.DomHelper.markup([
		{}
	]),

	//reference functions will not exist until after the constructor returns. #initComponent() is called in the middle
	// of the constructor, so we cannot us that. AfterRender maybe the best place to setup, or subclass constructor.
	refs: [
		{ ref: 'readerRef', selector: '' }//set this in config.
	],


	constructor: function() {
		this.callParent(arguments);
		this.on({
			afterRender: 'setupBindsToReaderRef'
		});
	},


	setupBindsToReaderRef: function() {
		var ref = this.getReaderRef();
		try{

			this.mon(ref,{
				'sync-height':function(){console.log('height');},
				'scroll':function(){console.log('wheee!');}
			});
			console.log('Done');
		}
		catch(e){
			console.error(e.stack||e.message||e);

			Ext.defer(this.setupBindsToReaderRef,1,this);
		}
	}

});
