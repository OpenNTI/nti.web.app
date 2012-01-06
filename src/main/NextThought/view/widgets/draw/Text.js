Ext.define('NextThought.view.widgets.draw.Text', {
	extend: 'NextThought.view.widgets.draw.Shape',
	alias: 'widget.sprite-text',

	constructor: function(config){

		//text-anchor can be 'start', 'middle', or 'end'
		this.callParent([Ext.apply(config,{ 'text-anchor': 'start',
			'font':'9pt Georgia,Serif',

			type: 'text'})]);
	},

	getShape: function(){
		return 'text';
	}
});
