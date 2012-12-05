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
		{ cls: 'exit-button', html: 'Exit Presentation'}]),

	renderSelectors: {
		exitEl: '.exit-button'
	},

	items: [{
		width: 400,
		layout: {
			type: 'vbox',
			align: 'stretch'
		},
		items: [{
			xtype: 'slidedeck-video'
		},{
			flex: 1,
			xtype: 'slidedeck-queue'
		}]
	},{
		flex: 1,
		xtype: 'slidedeck-slide'
	}],


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.exitEl,'click',function(){this.destroy();},this);
	}
});
