Ext.define('NextThought.filter.FilterManager',{
	singleton: true,
	requires: [
		'Ext.util.Observable',
		'NextThought.filter.Filter',
		'NextThought.filter.FilterGroup'
	],

	constructor: function(){
		this.scopes = {};
	},


	getScope: function( scope ){
		if(!this.scopes[scope]){
			this.scopes[scope] = new Ext.util.Observable();
			this.scopes[scope].addEvents('change');
		}
		return this.scopes[scope];
	},


	registerFilterListener: function retry(filterScope, fn, fnScope){
		var me = this, o, p, fc;

		if( filterScope && filterScope.isComponent){
			p = filterScope.up('mode-container');
			if(p){
				fc = p.down('filter-control');
				if (fc){filterScope = fc.getId();}
			}
			else {
				setTimeout(function(){ retry.call(me,filterScope,fn,fnScope); },10);
				return;
			}
		}

		o = this.getScope(filterScope);
		o.on('change',fn,fnScope);
		if(o.current){
			fn.call(fnScope, o.current);
		}
	},


	setFilter: function(scope, filter){
		console.log('set filter',scope, filter);
		var o = this.getScope(scope);
		o.fireEvent('change',filter);
		o.current = filter;
	}

},function(){
	window.FilterManager = this;
});
