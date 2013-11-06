Ext.define('NextThought.store.FlatPage', {
	extend: 'Ext.data.Store',
	model: 'NextThought.model.Base',
	proxy: 'memory',

	buffered: false,
	clearOnPageLoad: true,
	clearRemovedOnLoad: true,
	sortOnLoad: true,
	statefulFilters: false,
	remoteSort: false,
	remoteFilter: false,
	remoteGroup: false,
	filterOnLoad: true,
	sortOnFilter: true,

	sorters: [
		{
			//	property : 'line',
			//	direction: 'ASC'
			//},{
			property: 'CreatedTime',
			direction: 'DESC'
		}
	],
	filters: [
		{ id: 'nochildren', filterFn: function(r) { return !r.parent;}},
		{ id: 'no-private-notes', filterFn: function(r) {
			return !isFeature('notepad') ||
				   r.get('Class') !== 'Note' ||
				   (r.get('sharedWith').length ||
					!Ext.isEmpty(r.get('title')));
		}}
	],


	remove: function(record, isMove, silent) {
		var r = record || [],
				args = Array.prototype.slice.call(arguments);

		if (!Ext.isArray(r)) {
			r = [r];
		}

		if (isMove) {
			Ext.each(r, function(r, i, a) {
				if (r.placeholder) {
					console.log('>>???');
					a.splice(i, 1); }
			}, this, true);
		}

		if (r.length > 0) {
			args.shift();
			args.unshift(r);
			this.callParent(args);
		}
	},


	removeAll: function() {
		var f = this.filters.getRange();
		this.clearFilter(true);
		try {
			this.callParent(arguments);
		}
		finally {
			this.filter(f);
		}
	},


	bind: function(otherStore) {
		var me = this, monitors;

		if (!otherStore) {
			return;
		}

		if (Ext.Array.contains(otherStore.$boundToFlat || [], this)) { return; }


		function remove(s, rec) {
			var f;
			if (!Ext.isEmpty(rec)) {
				f = me.filters.getRange();
				me.clearFilter(true);
				me.remove(rec, true);
				me.filter(f);
			}
		}

		function cleanUp(o) {
			Ext.destroy(monitors);
			o.clearFilter(true);
			remove(o, o.getRange());
		}


		function add(s, rec) {

			function doesRecordPassFilters(rec) {
				return Ext.Array.every(currentFilters, function(f) {
					if (f.filterFn) { return f.filterFn.apply(f, [rec]); }
					return true;
				});
			}


			function addMe(r) {
				var i = me.findExact('NTIID', r.get('NTIID'));
				if (!r || !(r instanceof NextThought.model.Note)) { return; }

				if (i !== -1 && r !== me.getAt(i)) {
					console.warn('DUPLICATE NTIID', r, me.getAt(i));
					return;
				}

				if (!r.parent) {
					//If the rec passes current filters, add it.
					if (doesRecordPassFilters(r)) {
						me.add(r);//add one at a time to get insertion sort.
					}
					else {
						// If the lineFilter is set on the flatPage store,
						// wait until we set the line property on the new rec,
						// then check it and add it.
						r.addObserverForField(me, 'line', function() {
							me.suspendEvents(false);
							me.add(r);
							me.filter(me.filters.getRange());
							me.resumeEvents();
						}, {single: true});
					}
				}
			}

			var placeholders = Ext.Array.filter(s.getItems(), function(r) {return r.placeholder && !r.parent;}),
					records = ((rec && (Ext.isArray(rec) ? rec : [rec])) || []).concat(placeholders),
					currentFilters = me.filters.getRange();

			Ext.each(records, addMe);
		}

		function load(s, rec) {
			var placeholders = Ext.Array.filter(s.getItems(), function(r) {return r.placeholder && !r.parent;}),
					records = ((rec && (Ext.isArray(rec) ? rec : [rec])) || []).concat(placeholders), me = this;

			Ext.each(records, function(r) {
				var i = me.find('NTIID', r.get('NTIID'), 0, false, true, true);
				if (!r || !(r instanceof NextThought.model.Note)) { return; }

				if (i !== -1 && r !== me.getAt(i)) {
					me.removeAt(i);
				}

				if (!r.parent) {
					me.add(r);//add one at a time to get insertion sort.
				}
			});
			me.filter();//TEST THIS: Have filtered items been seen in the list and we not notice?? Or has it
			// "just worked" and now that I'm adding a new filter I'm just now noticing it?
		}

		monitors = me.mon(otherStore, {
			scope: me,
			destroyable: true,
			add: add,
			load: load,
			bulkremove: remove,
			remove: remove,
			cleanup: cleanUp
		});

		if (Ext.isArray(otherStore.$boundToFlat)) {
			otherStore.$boundToFlat.push(this);
		}
		else {
			otherStore.$boundToFlat = [this];
		}

		add(otherStore, otherStore.getRange());
	}

});
