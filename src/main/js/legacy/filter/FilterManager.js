const Ext = require('extjs');

const {isMe} = require('legacy/util/Globals');

require('./Filter');
require('./FilterGroup');


//TODO: find a way to generalize this and make this class responsible for all filter operations for UGD calls.

module.exports = exports = Ext.define('NextThought.filter.FilterManager', {

	constructor: function () {
		this.scopes = {};
	},

	getScope: function (scope) {
		if (!this.scopes[scope]) {
			this.scopes[scope] = new Ext.util.Observable();
			this.scopes[scope].addEvents('change');
		}
		return this.scopes[scope];
	},

	registerFilterListener: function retry (filterScope, fn, fnScope) {
		var me = this, o, p, fc;
		if (filterScope && filterScope.isComponent) {
			p = filterScope.up('view-container');
			if (p) {
				fc = p.down('content-filter');
				if (fc) {filterScope = fc.menu.getId();}
			}
			else {
				setTimeout(function () { retry.call(me, filterScope, fn, fnScope); },10);
				return;
			}
		}

		o = this.getScope(filterScope);
		o.on('change', fn, fnScope);
		if (o.current) {
			fn.call(fnScope, o.current);
		}
	},

	setFilter: function (scope, filter) {
		var o = this.getScope(scope);
		o.current = filter;
		o.fireEvent('change', filter);
	},

	getCurrentFilter: function (scope) {
		return this.getScope(scope || 'default-filter-control').current;
	},

	/**
	 * This will naively iterate the filters and grab all $className filters and add them to the result, as well as
	 * determin which filter to use. ie MeOnly,FollowingAndMe, Following.
	 *
	 * All union/intersection/include/exclude data will be dropped.
	 *
	 * @param {String} [scope] - id of the filter menu this filter is associated to.
	 * @returns {Object} -
	 */
	getServerListParams: function (scope) {
		var filter = this.getCurrentFilter(scope),
			list = filter ? filter.flatten() : [],
			params = {};

		//		list.push({
		//			fieldName: '$className',
		//			operation: 1,
		//			value: 'NextThought.model.Bookmark'
		//		});

		Ext.each(list, function (f) {
			var m;
			if (f.fieldName === 'sharedWith') {
				params.sharedWith = params.sharedWith || [];
				params.sharedWith.push(f.value.getId ? f.value.getId() : f.value);
				return;
			}
			if (f.fieldName === 'Creator') {
				if (isMe(f.value)) { params.me = true; }
				else { params.groups = true; }
				return;
			}
			try {
				m = Ext.ClassManager.get(f.value);
				if (!m || !m.prototype || !m.prototype.mimeType) {return;}
				params[f.fieldName] = params[f.fieldName] || [];
				params[f.fieldName].push(m.prototype.mimeType);
			}
			catch (e) {
				console.error(e.message, e);
			}
		});

		if (Ext.isArray(params.$className)) {
			params.accept = params.$className.join(',');
			delete params.$className;
		}

		if (params.me && params.groups) {
			//both true
			params.filter = 'IFollowAndMe';
		}
		else if (params.groups) {
			//groups true
			params.filter = 'IFollow';
		}
		else if (params.me) {
			//only me
			params.filter = 'MeOnly';
		}

		return params;
	}

}).create();
