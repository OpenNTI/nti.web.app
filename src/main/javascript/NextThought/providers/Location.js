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
				try{
					v = v ? v.getAttribute(attr) : null;
					if (v) {return v;}
				}
				catch(e){
					console.warn('element did not have getAttribute');
				}
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
	},



	getNavigationInfo: function(ntiid) {
		var loc = Library.findLocation(ntiid),
			toc = loc? loc.toc : null,
			list = toc ? Ext.DomQuery.select('toc,topic' ,toc): [],
			i = 0,
			len = list.length,
			info = {};

		for (i; i < len; i++) {
			if (!list[i] || !list[i].tagName) {
				console.error('error in loop', ntiid, loc, list, i, len);
				continue;
			}

			if(list[i].getAttribute('ntiid') === ntiid) {
				info.hasPrevious = Boolean(info.previous = list[i - 1]);
				info.hasNext = !!(info.next = list[i + 1]);
				info.nextRef = info.hasNext ? info.next.getAttribute('ntiid') : null;
				info.previousRef = info.hasPrevious ? info.previous.getAttribute('ntiid') : null;
				info.current = list[i];
				break;
			}
		}

		return info;
	}


}, function(){
	window.LocationProvider = this;
});
