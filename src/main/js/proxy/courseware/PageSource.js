export default Ext.define('NextThought.proxy.courseware.PageSource', {
	extend: 'NextThought.util.PageSource',

	statics: {

		 urlFrom: function(store) {
			 var px = store.getProxy(),
				 op = new Ext.data.Operation({
					 action: 'read',
					 filters: store.filters.items,
					 sorters: store.sorters.items
				 }),
				url;

			 op.params = px.getParams(op);
			 url = px.buildUrl(op);

			 return Ext.urlAppend(url, Ext.Object.toQueryString(op.params));
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

		var p = {
				batchSize: 3,
				batchStart: 0
			};

		p[this.getBatchAroundParam()] = this._getIdOf(this.current);

		this.url = Ext.urlAppend(this.url, Ext.Object.toQueryString(p));

		Service.request(this.url)
				.done(this.update.bind(this))
				.fail(function(reason) {
					console.error(reason);
				});
	},


	_makeRecord: function(json) {
		var Model = this.getModel(),
			idProp = Model.create().idProperty;

		if (Ext.isArray(json)) {
			json = json[1] || {Creator: json[0], Class: 'UsersCourseAssignmentHistoryItem'};
		}

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

		//Meh, this isn't generic at all... but required.
		UserRepository.getUser(items.map(username))
				.then(function(u) {
					var x = u.length - 1;
					if (u.length !== items.length) {
						Ext.Error.raise('Resolved length does not match request length');
					}

					for (x; x >= 0; x--) {
						if (items[x].get('Creator') !== u[x].getId()) {
							Ext.Error.raise('Username missmatch! ' + items[x].get('Creator') + ' != ' + u[x].getId());
						}
						items[x].set('Creator', u[x]);
					}
				})
				.done(function() {
					me.fireEvent('update', me);
				});
	},


	updatePageNumber: function(links, current) {
		var nextLink, prevLink;

		//if the current is the first one, we are the first item in the list
		if (current === 0) {
			this.currentPage = 1;
			console.log('CurrentPage:', 1, 'of', this.total);
			return;
		}

		links.forEach(function(link) {
			if (link.rel === 'batch-next') {
				nextLink = link.href;
			} else {
				prevLink = link.href;
			}
		});

		if (nextLink) {
			nextLink = Ext.urlDecode(nextLink);
			this.currentPage = nextLink && nextLink.batchStart - 1;
			console.log('CurrentPage:', this.currentPage, 'of', this.total);
			return;
		}
	},


	// The consumers of this function should expect
	// that it might return null.
	getPageNumber: function() { return this.currentPage || null; },

	getNext: function() { return this.next || null; },
	getPrevious: function() { return this.previous || null; },
	getTotal: function() { return this.total || '?'; },
	hasNext: function() { return !!this.next; },
	hasPrevious: function() { return !!this.previous; }
});
