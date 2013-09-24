Ext.define( 'NextThought.view.annotations.Note', {
	extend: 'NextThought.view.annotations.Highlight',
	alias: 'widget.note',

	isNote: true,


	constructor: function(config){
		this.callParent(arguments);
		this.hasSpecificRange = this.getRecordField('style') !== 'suppressed';
		this.privateNote = this.getRecord().get('sharedWith').length === 0
				&& isFeature('notepad');
	},


	onDestroy: function(){
		var children = this.getRecord().children || [];

		if(children.length>0){
			this.ownerCmp.fireEvent('bubble-replys-up', children);
		}

		return this.callParent(arguments);
	},


	attachRecord: function(record){
		this.mon(record,'convertedToPlaceholder','requestRender');
		var r = this.getRecord();
		if( r ){
			this.mun(r,'convertedToPlaceholder','requestRender');
		}
		this.callParent(arguments);
	},


	render: function(){
		var y;
		if(this.hasSpecificRange){
			y = this.callParent(arguments);
		} else {
			y = this.resolveVerticalLocation();
		}

		if(this.privateNote){
			this.fireEvent('annouce-private-note',this, y);
			y = -1;
		}


		return y;
	}
});
