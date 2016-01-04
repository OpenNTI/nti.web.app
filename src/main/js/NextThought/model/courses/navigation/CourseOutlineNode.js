Ext.define('NextThought.model.courses.navigation.CourseOutlineNode', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.courses.courseoutlinenode',

	statics: {
		mimeType: 'application/vnd.nextthought.courses.courseoutlinenode'
	},

	requires: [
		'NextThought.model.converters.Date',
		'NextThought.model.courses.overview.Lesson',
		'NextThought.model.courses.navigation.CourseOutlineNodeProgress'
	],

	mixins: {
		// DataTransfer: 'NextThought.mixins.dnd.DataTransferSource',
		OrderedContents: 'NextThought.mixins.OrderedContents',
		DurationCache: 'NextThought.mixins.DurationCache'
	},

	isNode: true,

	fields: [
		{ name: 'DCDescription', type: 'string'},
		{ name: 'DCTitle', type: 'string'},
		{ name: 'Items', type: 'arrayItem', mapping: 'contents'},
		{ name: 'description', type: 'string'},
		{ name: 'title', type: 'string'},
		{ name: 'src', type: 'string'},

		{ name: 'ContentNTIID', type: 'string'},

		{ name: 'AvailableBeginning', type: 'ISODate'},
		{ name: 'AvailableEnding', type: 'ISODate'},

		{ name: 'label', type: 'string', mapping: 'title'},

		{ name: 'position', type: 'int' },

		{ name: 'isAvailable', type: 'Synthetic', persis: false, fn: function(r) {
			return !!this.get('ContentNTIID');
		}},

		{ name: 'type', type: 'Synthetic', persist: false, fn: function(r) {
			var d = r._max_depth || 2,
				myDepth = r._depth,
				unit = 'unit heading';

			if (d !== 2) {
				unit = myDepth > 1 ? 'unit' : unit;
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

			return t && t.get && t.get('tocNode');
		}}
	],


	constructor: function() {
		this.callParent(arguments);
	},


	findNode: function(id) {
		if ((this.getId() === id) || (this.get('ContentNTIID') === id)) { return this; }
		return (this.get('Items') || []).reduce(function(a, o) {
			return a || (o.findNode && o.findNode(id));
		}, null);
	},


	getChildren: function() {
		var c = this.get('tocOutlineNode');
		return (c && c.getChildren()) || [];
	},


	getTitle: function() {
		return this.get('label');
	},


	getDataForTransfer: function() {
		return {
			MimeType: this.mimeType,
			title: this.getTitle(),
			NTIID: this.get('NTIID')
		};
	},


	isLeaf: function() {
		var depth = this._depth,
			maxDepth = this._max_depth;

		return depth === maxDepth;
	},


	isTopLevel: function() {
		var depth = this._depth;

		return depth === 1;
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
	},


	getFirstContentNode: function() {
		var items = this.get('Items'), index = 0,
			contentNode, item = items && items[0];

		while (!contentNode && item) {
			if (item.getFirstContentNode) {
				contentNode = item.getFirstContentNode();
			}

			index += 1;

			item = items[index];
		}

		return contentNode;
	},


	getProgress: function() {
		var link = this.getLink('Progress');

		if (!link) {
			return Promise.resolve(null);
		}

		return Service.request(link)
			.then(function(response) {
				return ParseUtils.parseItems(response)[0];
			});
	},


	getContents: function() {
		var me = this,
			key = 'contents',
			link = this.getLink('overview-content'),
			contents;

		contents = this.getFromCache(key);

		if (!contents) {
			if (!link) {
				contents = Promise.resolve(null);
			} else {
				contents = Service.request(link)
							.then(function(response) {
								return ParseUtils.parseItems(response)[0];
							})
							.then(function(contents) {
								contents.outlineNode = me;

								return contents;
							});
			}


			this.cacheForShortPeriod(key, contents);
		}

		return contents;
	},


	onItemAdded: function(record) {
		this.fillInDepths(record);
	},


	fillInDepths: function(record) {
		if (!record) { return; }

		record._depth = this._depth + 1;
	}
});
