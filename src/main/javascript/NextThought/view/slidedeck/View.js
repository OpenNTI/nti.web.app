Ext.define('NextThought.view.slidedeck.View',{
	extend: 'Ext.container.Container',
	alias: 'widget.slidedeck-view',
	requires: [
		'NextThought.view.slidedeck.Slide',
		'NextThought.view.slidedeck.Queue',
		'NextThought.view.slidedeck.Video'
	],

	cls: 'view',
	ui: 'slidedeck',
	plain: true,
	layout: {
		type: 'hbox',
		align: 'stretch'
	},

	renderTpl: Ext.DomHelper.markup([
		'{%this.renderContainer(out,values)%}',
		{ cls: 'exit-button', html: 'Exit Presentation', tabIndex: 0, role: 'button' }]),

	renderSelectors: {
		exitEl: '.exit-button'
	},

	items: [{
		xtype: 'container',
		width: 400,
		plain: true,
		ui: 'slidedeck-controls',
		layout: { type: 'vbox', align: 'stretch' }
	},{
		flex: 1,
		xtype: 'slidedeck-slide'
	}],

	initComponent: function(){
		this.callParent(arguments);
		var store = this.store,
			start = this.startOn,
			ctrls = this.items.getAt(0),
			slide = this.items.getAt(1),
			v,q;

		//clear the reference, pass it along...
		delete this.store;
		delete this.startOn;

		v = this.video = ctrls.add({ xtype: 'slidedeck-video', store: store});
		//Ths queue is the primary control. Selection causes video and slide to change.
		q = this.queue = ctrls.add({ xtype: 'slidedeck-queue', store: store, startOn: start, flex: 1 });

		v.queue = q;
		slide.queue = q;

		//wire up
		this.mon(q,'select', v.updateVideoFromSelection, v);
		this.mon(q,'select', slide.updateSlide,slide);

		this.on('editorActivated',function(){
			this.pausedForEditing = v.pausePlayback();
		}, this);
		this.on('editorDeactivated', function(){
			//Don't start back up if the user had us paused explictly
			//only if we paused for the edit
			if(this.pausedForEditing){
				this.pausedForEditing = false;
				v.resumePlayback();
			}
		}, this);
	},


	afterRender: function(){
		this.callParent(arguments);
		var me = this;

		function enterFilter(e) { var k = e.getKey(); return (k === e.ENTER || k === e.SPACE); }
		function close(){me.destroy();}

		this.mon(this.exitEl,{
			click: close,
			keydown: Ext.Function.createInterceptor(close,enterFilter,null,null)
		});
	}
});
