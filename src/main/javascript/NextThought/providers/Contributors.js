Ext.define('NextThought.providers.Contributors', {
	singleton: true,
	mixins: { observable: 'Ext.util.Observable' },

	constructor: function(){
		this.addEvents({
			change : true
		});

		this.callParent(arguments);
		this.mixins.observable.constructor.call(this);
	},


	set: function(contributors){
		this.contributors = contributors;
		this.fireEvent('change', this.contributors);
	},


	add: function(newbie) {
		var name, alreadyThere = false;
		for (name in this.contributors) {
			if (this.contributors.hasOwnProperty(name) &&
				newbie === name) {
					alreadyThere = true;
			}
		}
		if (!alreadyThere) {
			this.contributors[newbie] = true;
			this.fireEvent('change', this.contributors);
		}
	},

	clearContributors: function(){
		this.contributors = {};
		this.fireEvent('change', {});
	}

}, function(){
	window.ContributorsProvider = this;
});
