Ext.define('NextThought.view.content.notepad.View',{
	extend: 'Ext.Component',
	alias: 'widget.content-notepad',

	//<editor-fold desc="Config">
	requires:[
		'NextThought.ux.ComponentReferencing'
	],

	plugins:[
		'component-referencing'
	],

	ui: 'reader-notepad',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'scroller' }
	]),


	renderSelectors: {
		scroller: '.scroller'
	},


	//reference functions will not exist until after the constructor returns. #initComponent() is called in the middle
	// of the constructor, so we cannot us that. AfterRender maybe the best place to setup, or subclass constructor.
	refs: [
		{ ref: 'readerRef', selector: '' }//set this in config.
	],
	//</editor-fold>


	//<editor-fold desc="Setup & Init">
	constructor: function() {
		this.callParent(arguments);
		this.on({
			afterRender: 'setupBindsToReaderRef',
			el: {
				scroll: 'onSyncScroll',
				mousewheel: 'onPushScroll',
				DOMMouseScroll: 'onPushScroll'
			}
		});
	},


	setupBindsToReaderRef: function() {
		var ref = this.getReaderRef();

		try{
			this.syncHight();

			this.mon(ref,{
				'sync-height':'syncHight',
				'scroll':'syncScroll'
			});
			console.log('Done');
		}
		catch(e){
			console.error(e.stack||e.message||e);

			Ext.defer(this.setupBindsToReaderRef,1,this);
		}
	},
	//</editor-fold>



	//<editor-fold desc="Synchronizing Handlers">
	syncHight: function(){
		this.scroller.setHeight(this.getReaderRef().getIframe().get().getHeight());
	},


	syncScroll: function(){
		this.getEl().setScrollTop( this.getReaderRef().getScroll().top() );
	},


	onSyncScroll: function(){},


	onPushScroll: function pushScroll(e){
		var d = e.getWheelDelta(),
			h = (this.scroller.getHeight()/this.getHeight())/2; //make sure the scale kinda matches

		this.getReaderRef().getScroll().by(d*h);
	}
	//</editor-fold>

});
