Ext.define('NextThought.proxy.PageSource', {
	extend: 'NextThought.util.PageSourceStore',

	statics: {

		 urlFrom: function(store) {
			var px = store.getProxy(),
				op = new Ext.data.Operation({
					action: 'read',
					filters: store.filters.items,
					sorters: store.sorters.items
				}),
				url,
			params = {};

			op.params = px.getParams(op);
			url = px.buildUrl({
				operation: op
			});

			Ext.apply(params, px.extraParams || {});
			Ext.apply(params, op.params || {});

			delete params.sorters;

			return Ext.urlAppend(url, Ext.Object.toQueryString(params));
		 }

	},

	config: {
		modelAugmentationHook: Ext.identityFn,
		idExtractor: Ext.identityFn,
		current: null,
		url: '',
		model: null,
		batchAroundParam: 'batchAround',
		backingStore: null
	},


	constructor: function(cfg) {
		this.mixins.observable.constructor.call(this);
		this.initConfig(cfg);
		this.addEvents({
			update: true
		});

		var model = this.getModel();

		if (Ext.isString(model)) {
			this.setModel(Ext.ClassManager.get(model));
		}

		this._loadRecord(0);
	},


	applyCurrent: function(n, o) {
		if (!n) { return o;}

		if (this._getIdOf(o) === this._getIdOf(n)) {
			return undefined;
		}

		this._loadRecord(0, n);
		return n;
	},


	_loadRecord: function(direction, current) {
		var rec, url, me = this,
			p = {
				batchSize: 3,
				batchStart: 0
			};

		if (direction === 0) {
			rec = current || me.current;
		} else if (direction < 0) {
			rec = me.getPrevious() || current || me.current;
		} else {
			rec = me.getNext() || current || me.current;
		}

		if (!rec) {
			console.error('Trying to page with an empty record');
			return;
		}

		p[me.getBatchAroundParam()] = me._getIdOf(rec);

		url = Ext.urlAppend(me.getUrl(), Ext.Object.toQueryString(p));

		delete me.next;
		delete me.previous;

		Service.request(url)
			.done(function(result) {
				me.current = rec;
				me.update(result);
			})
			.fail(function(reason) {
				console.error(reason);
			});
	},


	_makeRecord: function(json) {
		var Model = this.getModel(),
			idProp = Model.create().idProperty;

		return this.getModelAugmentationHook().call(this, Model.create(json, json[idProp]));
	},


	_getIdOf: function(o) {
		return (this.getIdExtractor() || Ext.identityFn).call(this, o);
	},


	_indexOfCurrentIn: function(list) {
		var id = this._getIdOf(this.current);
		list = list.map(this._getIdOf.bind(this));
		return list.indexOf(id);
	},


	update: function(reply) {
		reply = Ext.decode(reply, true) || {};

		function username(o) {
			return (o && o.get && o.get('Creator')) || o;
		}

		var me = this,
			rawTotal = 'TotalItemCount',
			total = 'Filtered' + rawTotal,
			items = ((reply && reply.Items) || []).map(me._makeRecord.bind(me)),
			idx = me._indexOfCurrentIn(items);

		this.total = reply.hasOwnProperty(total) ? reply[total] :
					 reply.hasOwnProperty(rawTotal) ? reply[rawTotal] :
					 null;

		//todo: fill in next/prev from results
		// The docs say batchAround(Creator) should put the id in the
		// middle of the batch, if it can.  We set the batch size
		// specifically to three. So in all but the edge cases the item
		// we are "currently" at is in the middle, and the next/prevous
		// items are on either side.

		me.previous = items[idx - 1] || null;
		me.next = items[idx + 1] || null;

		me.updatePageNumber(reply.Links, idx);

		me.fireEvent('update');
	},


	updatePageNumber: function(links, current) {
		var nextLink, prevLink;

		//if the current is the first one, we are the first item in the list
		if (current === 0) {
			this.currentPage = 1;
			return;
		}

		(links || []).forEach(function(link) {
			if (link.rel === 'batch-next') {
				nextLink = link.href;
			} else {
				prevLink = link.href;
			}
		});

		if (nextLink) {
			nextLink = Ext.urlDecode(nextLink);
			this.currentPage = nextLink && nextLink.batchStart - 1;
		}
	},


	//we do not care about the actual page number.
	// The consumers of this function should expect
	// that it might return null.
	getPageNumber: function() { return this.currentPage || null; },


	getNext: function(set) {
		var next = this.next;

		if (next && set) {
			this.setCurrent(next);
		}

		return next || null;
	},


	getPrevious: function(set) {
		var previous = this.previous;

		if (previous && set) {
			this.setCurrent(previous);
		}

		return previous || null;
	},


	getTotal: function() { return this.total || '?'; },
	hasNext: function() { return !!this.next; },
	hasPrevious: function() { return !!this.previous; }
});
