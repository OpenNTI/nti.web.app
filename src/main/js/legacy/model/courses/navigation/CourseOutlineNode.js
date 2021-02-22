const Ext = require('@nti/extjs');

const Note = require('legacy/model/Note');
const lazy = require('legacy/util/lazy-require')
	.get('CourseOutlineContentNode', () =>
		require('./CourseOutlineContentNode')
	)
	.get('ParseUtils', () => require('legacy/util/Parsing'));

require('legacy/mixins/OrderedContents');
require('legacy/mixins/DurationCache');

require('../../courses/overview/Lesson');
require('../../Base');
require('./CourseOutlineNodeProgress');

module.exports = exports = Ext.define(
	'NextThought.model.courses.navigation.CourseOutlineNode',
	{
		extend: 'NextThought.model.Base',
		mimeType: 'application/vnd.nextthought.courses.courseoutlinenode',

		statics: {
			mimeType: 'application/vnd.nextthought.courses.courseoutlinenode',
		},

		mixins: {
			// DataTransfer: 'NextThought.mixins.dnd.DataTransferSource',
			OrderedContents: 'NextThought.mixins.OrderedContents',
			DurationCache: 'NextThought.mixins.DurationCache',
		},

		isNode: true,

		fields: [
			{ name: 'DCDescription', type: 'string' },
			{ name: 'DCTitle', type: 'string' },
			{ name: 'Items', type: 'arrayItem', mapping: 'contents' },
			{ name: 'description', type: 'string' },
			{ name: 'title', type: 'string' },
			{ name: 'src', type: 'string' },

			{ name: 'ContentNTIID', type: 'string' },

			{ name: 'AvailableBeginning', type: 'ISODate' },
			{ name: 'AvailableEnding', type: 'ISODate' },

			{ name: 'label', type: 'string', mapping: 'title' },

			{ name: 'position', type: 'int' },

			{
				name: 'isAvailable',
				type: 'Synthetic',
				persis: false,
				fn: function () {
					return !!this.get('ContentNTIID');
				},
			},

			{
				name: 'type',
				type: 'Synthetic',
				persist: false,
				fn: function (r) {
					var d = Math.max(2, r._max_depth || 2), // default max depth to 2
						myDepth = r._depth,
						unit = 'unit heading';

					if (d !== 2) {
						unit = myDepth > 1 ? 'unit' : unit;
					}

					return myDepth === d ? 'lesson' : unit;
				},
			},

			{
				name: 'date',
				type: 'Synthetic',
				persist: false,
				fn: function (r) {
					//console.warn('DEPRECATED: use "AvailableEnding" instead of "date"');
					return r.get('AvailableEnding');
				},
			},

			{
				name: 'startDate',
				type: 'Synthetic',
				persist: false,
				fn: function (r) {
					//console.warn('DEPRECATED: use "AvailableBeginning" instead of "startDate"');
					return r.get('AvailableBeginning');
				},
			},

			{ name: 'tocOutlineNode', type: 'auto', persist: false },

			{
				name: 'tocNode',
				type: 'Synthetic',
				persist: false,
				fn: function (r) {
					var t = r.get('tocOutlineNode');

					return t && t.get && t.get('tocNode');
				},
			},
		],

		constructor: function () {
			this.callParent(arguments);

			this.fillInItems();
		},

		findNode: function (id) {
			if (this.getId() === id || this.get('ContentNTIID') === id) {
				return this;
			}
			return (this.get('Items') || []).reduce(function (a, o) {
				return a || (o.findNode && o.findNode(id));
			}, null);
		},

		getChildren: function () {
			var c = this.get('tocOutlineNode');
			return (c && c.getChildren()) || [];
		},

		getTitle: function () {
			return this.get('label');
		},

		getDataForTransfer: function () {
			return {
				MimeType: this.mimeType,
				title: this.getTitle(),
				NTIID: this.get('NTIID'),
			};
		},

		getAllowedTypes: function () {
			var allowed = [];

			if (this._depth === 1) {
				allowed.push(lazy.CourseOutlineContentNode.mimeType);
			}

			return allowed;
		},

		isLeaf: function () {
			var depth = this._depth,
				maxDepth = this._max_depth;

			return depth === maxDepth;
		},

		isTopLevel: function () {
			var depth = this._depth;

			return depth === 1;
		},

		listenForFieldChange: function (field, fn, scope, single) {
			var monitor;

			function update(store, record, type, modifiedFieldNames) {
				if (Ext.Array.contains(modifiedFieldNames, field)) {
					if (Ext.isString(fn)) {
						if ((scope || record)[fn]) {
							fn = (scope || record)[fn];
						} else if (!fn && store[fn]) {
							fn = store[fn];
							scope = store;
						} else {
							console.error(
								'Could not find function "' +
									fn +
									'" in scope, record nor store.',
								{
									scope: scope,
									record: record,
									store: store,
								}
							);
							Ext.destroy(monitor);
							return;
						}
					}
					if (single) {
						Ext.destroy(monitor);
					}
					Ext.callback(fn, scope || record, [
						record,
						record.get(field),
					]);
				}
			}

			monitor = this.mon(this.store, {
				destroyable: true,
				update: update,
			});
			return monitor;
		},

		getFirstContentNode: function () {
			var items = this.get('Items'),
				index = 0,
				contentNode,
				item = items && items[0];

			while (!contentNode && item) {
				if (item.getFirstContentNode) {
					contentNode = item.getFirstContentNode();
				}

				index += 1;

				item = items[index];
			}

			return contentNode;
		},

		getCommentCounts: function () {
			var link = this.getLink('overview-summary');

			if (!link) {
				return Promise.resolve({});
			}

			return Service.request({
				url: link,
				method: 'GET',
				params: {
					accept: Note.mimeType,
					filter: 'TopLevel',
				},
			})
				.then(function (resp) {
					return JSON.parse(resp);
				})
				.catch(function (reason) {
					console.error('Failed to load overview summary: ', reason);
				});
		},

		getProgress: function () {
			var link = this.getLink('Progress');

			if (!link) {
				return Promise.resolve(null);
			}

			return Service.request(link).then(function (response) {
				return lazy.ParseUtils.parseItems(response)[0];
			});
		},

		getContents: function () {
			const link = this.getLink('overview-content');
			let contents;

			if (!link) {
				contents = Promise.resolve(null);
			} else {
				contents = Service.request(link)
					.then(response => lazy.ParseUtils.parseItems(response)[0])
					.then(content => ((content.outlineNode = this), content))
					.catch(error => {
						console.error(
							'Unable to get contents because: %o',
							error.stack || error.message || error
						);
						return null;
					});
			}

			return contents;
		},

		onItemAdded: function (record) {
			this.fillInDepths(record);
		},

		fillInDepths: function (record) {
			if (!record) {
				return;
			}

			record._depth = this._depth + 1;
		},
	}
);
