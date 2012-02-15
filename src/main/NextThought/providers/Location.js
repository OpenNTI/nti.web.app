Ext.define('NextThought.providers.Location', {
	singleton: true,
	mixins: { observable: 'Ext.util.Observable' },
	requires: [
		'NextThought.Library'
	],

	constructor: function(){
		this.addEvents({
			navigate: true,
			change : true
		});

		Ext.apply(this,{
			currentNTIID: "",
			timers: {},
			cache: {}
		});


		this.callParent(arguments);
		this.mixins.observable.constructor.call(this);
	},


	/**
	 *
	 * @param ntiid
	 * @param [callback]
	 */
	setLocation: function(ntiid, callback){
		if(!this.fireEvent('navigate',ntiid, callback)){
			return false;
		}
		this.currentNTIID = ntiid;
		this.fireEvent('change', ntiid);
	},

	/**
	 *
	 * @param [id]
	 */
	getLocation : function(id){
		var me = this, r, d, i = id || me.currentNTIID;
		if(!i){
			return {};
		}

		r = me.cache[i];
		if( !r ) {
			r = Library.findLocation(i);
			d = r.toc.documentElement;
			r = Ext.apply({
					NTIID: i,
					icon: d.getAttribute('icon'),
					root: d.getAttribute('base'),
					title: d.getAttribute('title')
				},r);
		}

		me.cache[i] = r;

		clearTimeout(me.timers[i]);
		me.timers[i] = setTimeout(function(){delete me.cache[i];},15000);

		return r;
	}


}, function(){
	window.LocationProvider = this;
});
