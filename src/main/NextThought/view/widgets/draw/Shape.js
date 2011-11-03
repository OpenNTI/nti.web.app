Ext.define('NextThought.view.widgets.draw.Shape', {
	extend: 'Ext.draw.Sprite',
	alias: 'widget.sprite-base',

	constructor: function(config){
		this.callParent([Ext.apply(config,{ draggable: true, x:0, y:0 })]);
		this.on('render', function(s){
			s.el.dom.setAttribute('vector-effect','non-scaling-stroke');
		});
	},

	getShape: function(){
		return this.type;
	}
});
