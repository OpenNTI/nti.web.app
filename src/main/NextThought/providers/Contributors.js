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
		this.fireEvent('change', contributors);
	}

}, function(){
	window.ContributorsProvider = this;
});
