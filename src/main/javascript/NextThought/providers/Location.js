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
			currentNTIID: null,
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
	setLocation: function(ntiid, callback, fromHistory){
		var me = this,e = Ext.getCmp('viewport').getEl();

		function finish(){
			console.timeEnd('navigation');
			if(e.isMasked()){
				e.unmask();
			}
			Globals.callback(callback,null,arguments);

			if(fromHistory!==true){
				window.history.pushState({location: ntiid}, "");
			}
		}

		if(me.currentNTIID && ntiid !== me.currentNTIID){
			e.mask('Loading...');
		}

		//make this happen out of this function's flow, so that the mask shows immediately.
		setTimeout(function(){
			console.time('navigation');
			if(!me.fireEvent('navigate',ntiid,finish)){
				return false;
			}
			me.currentNTIID = ntiid;
			me.fireEvent('change', ntiid);
		},1);
	},

	/**
	 *
	 * @param [id]
	 */
	getLocation : function(id){
		function getAttribute(elements, attr){
			var i=0, v;
			for (i; i < elements.length; i++) {
				v = elements[i];
				v = v && 'getAttribute' in v ? v.getAttribute(attr) : null;
				if (v) {return v;}
			}
			return null;
		}

		var me = this, r, l, d, i = id || me.currentNTIID;
		if(!i){
			return {};
		}

		r = me.cache[i];
		if( !r ) {
			r = Library.findLocation(i);

			//If still not r, it's not locational content...
			if (!r) {return null;}

			d = r.toc.documentElement;
			l = r.location;
			r = Ext.apply({
					NTIID: i,
					icon: getAttribute([l,d],'icon'),
					root: getAttribute([l,d],'base'),
					title: getAttribute([l,d],'title'),
					label: getAttribute([l,d],'label'),
					thumbnail: getAttribute([l,d],'thumbnail')
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
