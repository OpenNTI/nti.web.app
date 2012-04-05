Ext.define('NextThought.mixins.SplitterMaintenance', {

	/**
	 * first removes all splitters in this components layout.  Then adds new splitters between every component.
	 */
	addOrUpdateSplitters: function() {
		var index;

		//remove all splitters that currently exist:
		this.items.each(function(i){
				if (i instanceof Ext.resizer.Splitter) {
					this.remove(i, true);
				}
			},
			this);

		//add splitters between each component
		this.items.each(function(i){
				index = this.items.indexOf(i);
				if (index < (this.items.getCount() - 1)){
					this.insert(this.items.indexOf(i) + 1,
						{xtype:'splitter'}
					);
				}
			},
			this);
	}

});

