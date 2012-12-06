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
			ctrls = this.items.getAt(0), v,q;

		//clear the reference, pass it along...
		delete this.store;

		v = this.video = ctrls.add({ xtype: 'slidedeck-video'});
		//Ths queue is the primary control. Selection causes video and slide to change.
		q = this.queue = ctrls.add({ xtype: 'slidedeck-queue', store: store, flex: 1 });

		//wire up
		this.mon(q,'select', v.updateVideoFromSelection, v);
		this.mon(v,'at-time', q.updateSlideFromVideo, q);
	},


	afterRender: function(){
		this.callParent(arguments);
		var me = this;

		function enterFilter(e) { return (e.getKey() === e.ENTER); }
		function close(){me.destroy();}

		this.mon(this.exitEl,{
			click: close,
			keydown: Ext.Function.createInterceptor(close,enterFilter,null,null)
		});
	}
});
