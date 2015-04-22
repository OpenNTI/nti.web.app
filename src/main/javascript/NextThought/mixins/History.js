Ext.define('NextThought.mixins.History', {

	constructor: function(config) {
		this.callParent(arguments);

		this.history_key = config.history_key || '';
		this.history_title = config.history_title || '';
		this.history_url = config.history_url || '';
		this.history_children = [];
	},

	/**
	 * Add a component's pushState and setState as one of my children
	 *
	 * @param {Object} cmp component to add
	 */
	addChildState: function(cmp) {
		var key = cmp.history_key || cmp.xtype,
			state = this.getHistoryState();

		if (!key) {
			console.warn('No Key to track state of child cmp: ', cmp);
			return;
		}

		cmp.history_key = key;

		//define the childs push and replace to update my state
		cmp.pushState = this.pushChildState.bind(this, cmp, key);
		cmp.replaceState = this.replaceChildState.bind(this, cmp, key);
		this.history_children.push(cmp);

		if (state[key]) {
			cmp.setState(state[key]);
		}
	},


	/**
	 * Give a key, state, title, and url of a child's state, merge them in to our state.
	 *
	 * @param  {String} key   child's history_key
	 * @param  {Object} state current state of the child
	 * @param  {String} title title for the child's state, if falsy the title will not be updated
	 * @param  {String} url   url part for the child's state, if falsy the url will not be updated
	 * @return {Object}       the merged state, title, and url values
	 */
	__mergeChildState: function(key, state, title, url) {
		var myState = this.getHistoryState(),
			myTitle = this.getHistoryTitle(),
			myURL = this.getHistoryURL();

		//update my state for the child
		myState[key] = state || {};

		//if given a title append it to mine and pass it a long
		if (title) {
			myTitle = myTitle + ' | ' + title;
		} else {
		//otherwise don't pass it a long so the title won't be updated
			myTitle = '';
		}

		//if given a url append it to mine and pass it along
		if (url) {
			myURL = myURL + '/' + url;
		} else {
		//otherwise don't pass it a long so the url won't be updated
			myURL = '';
		}

		return {
			state: myState,
			title: myTitle,
			url: myURL
		};
	},


	/**
	 * Merge the child's and my state and pass it a long to my push state
	 *
	 * @param  {Object} cmp   the child component
	 * @param  {String} key   child's history_key
	 * @param  {Object} state current state of the child
	 * @param  {String} title title for the child's state, if falsy the title will not be updated
	 * @param  {String} url   url part for the child's state, if falsy the url will not be updated
	 * @return {Boolean}      return value of push state
	 */
	pushChildState: function(cmp, key, state, title, url) {
		var merged = this.__mergeChildState(key, state, title, url);

		cmp.state = state;
		this.state = merged.state;

		return this.pushState(merged.state, merged.title, merged.url);
	},

	/**
	 * Merge the child's and my state and pass it a long to my set state
	 *
	 * @param {Object} cmp 	  the child component
	 * @param  {String} key   child's history_key
	 * @param  {Object} state current state of the child
	 * @param  {String} title title for the child's state, if falsy the title will not be udpated
	 * @param  {String} url   url part for the child's state, if falsy the url will not be updated
	 * @return {Boolean}      return value of replace state
	 */
	replaceChildState: function(cmp, key, state, title, url) {
		var merged = this.__mergeChildState(key, state, title, url);

		cmp.state = state;
		this.state = merged.state;

		return this.replaceState(merged.state, merged.title, merged.url);
	},


	/**
	 * Given a state, iterate through my children and set any state keyed off of the child
	 * @param  {Object} state state to apply
	 * @return {Promise}      fulfills once all the children's state has been applied
	 */
	__setChildrenState: function(state) {
		var apply;

		apply = this.history_children.map(function(child) {
			var s = child.history_key && state[child.history_key];

			if (child.setState && s) {
				return child.setState(s);
			}

			return Promise.resolve(null);
		});

		return Promise.all(apply);
	},


	/**
	 * Given a state apply it to myself then set all the child states in it
	 * @param {Object} state state to apply
	 * @return {Proimse} Fulfills once my and my children's state has been applied
	 */
	setState: function(state) {
		this.state = state;

		var apply = this.applyState(state);

		if (!(apply instanceof Promise)) {
			apply = Promise.resolve(apply);
		}


		return apply.then(this.__setChildrenState.bind(this, state));
	},

	/**
	 * Apply a state
	 *
	 * @override
	 * @param  {Object} state the state to apply
	 * @return {Promise}      fulfills once the state is applied
	 */
	applyState: function(state) {},


	/**
	 * Push a state to parent or history
	 *
	 * @override
	 * @param  {Object} state
	 * @param  {String} title
	 * @param  {String} url
	 * @return {Undefined}
	 */
	pushState: function(state, title, url) {},


	/**
	 * replace state on the parent or history
	 *
	 * @override
	 * @param  {Object} state
	 * @param  {String} title
	 * @param  {String} url
	 * @return {Undefined}
	 */
	replaceState: function(state, title, url) {},

	/**
	 * Return the current state
	 *
	 * @override
	 * @return {Object} current state
	 */
	getHistoryState: function() {
		return this.state || {};
	},


	/**
	 * Return the url part for the current state
	 * @override
	 * @return {String} url part
	 */
	getHistoryURL: function() {
		return this.history_url;
	},


	/**
	 * Return the title
	 * @override
	 * @return {String} title part
	 */
	getHistoryTitle: function() {
		return this.history_title;
	}
});
