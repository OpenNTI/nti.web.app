Ext.define('NextThought.view.course.dashboard.tiles.Title',{
	extend: 'Ext.Component',
	alias: 'widget.tile-title',
	
	ui: 'tile',
	
	cls: 'tile-header',
	
	renderTpl: Ext.DomHelper.markup([
		{ cls: 'tools', cn:[
			
		]},
		{ tag:'tpl', 'if':'heading', cn:{ cls: 'heading {withLabel}', html: '{heading}'} },
		{ tag:'tpl', 'if':'label',   cn:{ cls: 'label', html: '{label}' } }
	]),
	
	config:{
		heading: null,
		label: ''
	},
	
	beforeRender: function(){
		this.callParent(arguments);
		var rd = this.renderData = Ext.apply(this.renderData||{},this.initialConfig);
		
		if(!Ext.isEmpty(rd.label)){
			rd.withLabel = 'with-label';
		}
	}
});