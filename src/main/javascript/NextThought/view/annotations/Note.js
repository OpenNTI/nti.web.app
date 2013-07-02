Ext.define( 'NextThought.view.annotations.Note', {
	extend: 'NextThought.view.annotations.Highlight',
	alias: 'widget.note',

	isNote: true,


	constructor: function(config){
		this.callParent(arguments);
		this.hasSpecificRange = this.getRecordField('style') !== 'suppressed';
	},


	onDestroy: function(){
		var children = this.getRecord().children || [];

		if(children.length>0){
			this.ownerCmp.fireEvent('bubble-replys-up', children);
		}

		return this.callParent(arguments);
	},


	render: function(){
		if(this.hasSpecificRange){
			return this.callParent(arguments);
		}

		return this.resolveVerticalLocation();
	}
});
