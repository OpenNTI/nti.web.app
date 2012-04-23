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

		this.contributors = {};
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
	set: function(contributors, namespace){
		if (!contributors || contributors.length === 0){return;}

		Ext.each(contributors, function(c){
			this.add(c, namespace, true);
		}, this);
		this.fireEvent('change', this.contributors[namespace], namespace);
	},


	add: function(newbie, namespace, noEvent) {
		var c = this.getContributorsForNamespace(namespace);

		if(c[newbie]) {
			c[newbie]++;
		}
		//fire the change event in this case because the newbie was not there before.
		else {
			c[newbie] = 1;
			if (!noEvent){this.fireEvent('change', c, namespace);}
		}
	},


	remove: function(newbie, namespace) {
		var c = this.getContributorsForNamespace(namespace);

		//decrement if user is there (he should be, log a warn if he's not for debugging)
		if(c[newbie]) {
			c[newbie]--;
		}
		else {
			console.warn('request to remove contributor who is not there, which is strange, investigate.');
		}

		//if the removal of newbie caused the newbie to fall below 0 annotations, need to fire updated event.
		if (c[newbie] <= 0) {
			delete c[newbie];
			this.fireEvent('change', c, namespace);
		}
	},


	clearContributors: function(namespace){
		var c = this.getContributorsForNamespace(namespace);
		c = {};
		this.fireEvent('change', {}, namespace);
	},


	getContributorsForNamespace: function(ns) {
		if (!this.contributors[ns]) {
			this.contributors[ns] = {};
		}
		return this.contributors[ns];
	}

}, function(){
	window.ContributorsProvider = this;
});
