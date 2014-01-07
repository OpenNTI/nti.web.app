Ext.define('NextThought.model.courseware.navigation.CourseOutlineNode', {
	extend: 'NextThought.model.Base',

	isNode: true,

	fields: [
		{ name: 'DCDescription', type: 'string'},
		{ name: 'DCTitle', type: 'string'},
		{ name: 'Items', type: 'arrayItem', mapping: 'contents'},
		{ name: 'description', type: 'string'},
		{ name: 'title', type: 'string'},

		{ name: 'AvailableBeginning', type: 'date', dateFormat: 'c'},
		{ name: 'AvailableEnding', type: 'date', dateFormat: 'c'},

		{ name: 'label', type: 'string', mapping: 'title'},

		{ name: 'position', type: 'int' },

		{ name: 'type', type: 'Synthetic', persist: false, fn: function(r) {
			var d = r._max_depth || 2,
				myDepth = r._depth,
				unit = 'unit';

			if (d !== 2) {
				unit = myDepth > 1 ? 'unit' : 'unit heading';
			}

			return myDepth === d ? 'lesson' : unit;
		} },

		{ name: 'date', type: 'Synthetic', persist: false,
			fn: function(r) {
				//console.warn('DEPRECATED: use "AvailableEnding" instead of "date"');
				return r.get('AvailableEnding');
			}
		},

		{ name: 'startDate', type: 'Synthetic', persist: false,
			fn: function(r) {
				//console.warn('DEPRECATED: use "AvailableBeginning" instead of "startDate"');
				return r.get('AvailableBeginning');
			}
		},

		{ name: 'pageInfo', type: 'Synthetic', persist: false,
			fn: function(r) {

				if (r.data.hasOwnProperty('$pageInfo')) {
					return r.data.$pageInfo;
				}

				Service.getPageInfo(r.getId(), function(p) {
					r.data.$pageInfo = p;
					r.afterEdit(['pageInfo']);
				});
				return null;
			}
		},

		{ name: 'tocOutlineNode', type: 'auto', persist: false},

		{ name: 'tocNode', type: 'Synthetic', persist: false, fn: function(r) {
			var t = r.get('tocOutlineNode');

			return t & t.get && t.get('tocNode');
		}}
	],


	findNode: function(id) {
		if (this.getId() === id) { return this; }
		return (this.get('Items') || []).reduce(function(a, o) {
			return a || (o.findNode && o.findNode(id));
		}, null);
	},


	getChildren: function() {
		var c = this.get('tocOutlineNode');
		return (c && c.getChildren()) || [];
	},


	listenForFieldChange: function(field, fn, scope, single) {
		var monitor;

		function update(store, record, type, modifiedFieldNames) {
			if (Ext.Array.contains(modifiedFieldNames, field)) {
				if (Ext.isString(fn)) {

					if ((scope || record)[fn]) {
						fn = (scope || record)[fn];
					}
					else if (!fn && store[fn]) {
						fn = store[fn];
						scope = store;
					} else {
						console.error('Could not find function "' + fn + '" in scope, record nor store.', {
							scope: scope, record: record, store: store});
						Ext.destroy(monitor);
						return;
					}
				}
				if (single) {
					Ext.destroy(monitor);
				}
				Ext.callback(fn, scope || record, [record, record.get(field)]);
			}
		}

		monitor = this.mon(this.store, {
			destroyable: true,
			update: update
		});
		return monitor;
	}
});
