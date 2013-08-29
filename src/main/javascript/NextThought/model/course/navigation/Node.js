Ext.define('NextThought.model.course.navigation.Node', {
	extend:   'Ext.data.Model',
	requires: [
		'Ext.data.reader.Xml'
	],

	idProperty: 'NTIID',

	proxy: {
		type:   'memory',
		reader: {
			type:   'xml',
			root:   'course',
			record: 'unit,lesson'//flatten the tree
		}
	},

	fields: [
		//id
		{ name:      'NTIID', type: 'string', mapping: '@topic-ntiid',
			convert: function (v, m) {
				//no topic ntiid? ok, use the actual ntiid... (why we cant use an "or" in the mapping query, i donno)
				return v || m.raw.getAttribute('ntiid');
			}
		},

		//sort order
		{ name:      'position', type: 'string',
			convert: function (v, m) {
				function toPostionString(n) {
					var p = n && n.parentNode;
					if (!p) {
						return 0;
					}
					return [toPostionString(p), Ext.Array.indexOf(p.getChildren(), n)].join(',');
				}

				return toPostionString(m.raw);
			}
		},

		//(nti)id of parent
		{ name:      'parent', type: 'string', mapping: '@parentNode',
			convert: function (v) {return v && (v.getAttribute('topic-ntiid') || v.getAttribute('ntiid'));} },


		{ name:      'tocNode', type: 'auto',
			convert: function (v, m) {
				return m.raw;
			}
		},

		//string displayed in the UI
		{ name:      'label', type: 'string', mapping: '@label',
			convert: function (v, m) {
				var n = !v && m.getAssociatedNode();
				return v || (n && Ext.DomQuery.selectValue(this.mapping, n)) || 'Failed';
			}
		},

		//unit, lesson
		{ name: 'type', type: 'string', mapping: '@nodeName', convert: function (v) {return v && v.toLowerCase(); } },

		//due date
		{ name:      'date', type: 'date', mapping: '@date', dateFormat: 'c', exampleValue: '2013-10-16T00:00:00+00:00',
			convert: function (v, m) {
				if (Ext.isEmpty(v)) {
					return null;
				}
				if (!m.dates) {
					m.dates = m.parseDates(v, this);
				}

				return m.dates.first();
			}
		},

		{ name:      'startDate', type: 'date', mapping: '@date', dateFormat: 'c', exampleValue: '2013-10-16T00:00:00+00:00',
			convert: function (v, m) {
				if (Ext.isEmpty(v)) {
					return null;
				}
				if (!m.dates) {
					m.dates = m.parseDates(v, this);
				}
				return m.dates.last();

			}
		},

		{ name: 'pageInfo', type: 'Synthetic', persist: false,
			fn: function (r) {

				if (r.data.hasOwnProperty('$pageInfo')) {
					return r.data.$pageInfo;
				}

				$AppConfig.service.getPageInfo(r.getId(), function (p) {
					r.data.$pageInfo = p;
					r.afterEdit(['pageInfo']);
				});
				return null;
			}
		}
	],


	parseDates: function (str, fieldScope) {
		if (Ext.isEmpty(str)) {
			return null;
		}

		var v = str.split(',');
		v = Ext.Array.map(v, Ext.data.Types.DATE.convert, fieldScope || this);
		v.sort(function (a, b) {return b - a;});
		this.dates = v;

		return v;
	},


	getAssociatedNode: function () {
		var n = this.raw,
				ntiid;
		if (!this.associatedNode) {
			ntiid = n.getAttribute('topic-ntiid') || '';
			this.associatedNode = /topic/i.test(n.nodeName) ? n : Ext.DomQuery.selectNode(
					'topic[ntiid="' + ntiid
							.replace(/:/g, '\\3a ') //no colons
							.replace(/,/g, '\\2c ') //no commas
							+ '"]',
					n.ownerDocument);
			if (!this.associatedNode) {
				console.warn('Could not find associated topic', n);
			}
		}
		return this.associatedNode;
	},


	getChildren: function () {
		var n = this.get('tocNode'),
				c = n && n.getChildren();

		n = (c && c.length) ? n : this.getAssociatedNode();

		if (!n) {
			return null;
		}

		return Ext.Array.clone(n.getChildren());
	},


	listenForFieldChange: function (field, fn, scope, single) {
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
			update:      update
		});
		return monitor;
	}
});
