/**
 * Will maintain a map of contributors to number of contributions, so events can be fired when:
 * a) a new contributor is added
 * b) contributor's contributons count falls below 0
 *
 * Use set instead of add to buld load this map without firing a bunch of events, fires one updated event
 * regardless of contributor levels.
 */
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


	/**
	 * Set takes an array of contributors.  One name per annotation.  If a name occurs more than once,
	 * that means there are more than one associated annotation.  We need this so we can account for changes
	 * when annotations are added or removed.
	 *
	 * @param contributors - the array of contributors, e.g ['user1', 'user2', 'user1', 'user3']
	 */
	set: function(contributors){
		if (!contributors || contributors.length === 0){return;}

		Ext.each(contributors, function(c){
			this.add(c, true);
		}, this);
		this.fireEvent('change', this.contributors);
	},


	add: function(newbie, noEvent) {
		if(this.contributors[newbie]) {
			this.contributors[newbie]++;
		}
		//fire the change event in this case because the newbie was not there before.
		else {
			this.contributors[newbie] = 1;
			if (!noEvent){this.fireEvent('change', this.contributors);}
		}
	},


	remove: function(newbie) {
		//decrement if user is there (he should be, log a warn if he's not for debugging)
		if(this.contributors[newbie]) {
			this.contributors[newbie]--;
		}
		else {
			console.warn('request to remove contributor who is not there, which is strange, investigate.');
		}

		//if the removal of newbie caused the newbie to fall below 0 annotations, need to fire updated event.
		if (this.contributors[newbie] <= 0) {
			delete this.contributors[newbie];
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
