var Ext = require('extjs');
var ParseUtils = require('../../util/Parsing');
var StoreNTI = require('../NTI');
var UtilUserDataThreader = require('../../util/UserDataThreader');


module.exports = exports = Ext.define('NextThought.store.forums.Comments', {
	extend: 'NextThought.store.NTI',
	model: 'NextThought.model.forums.CommentPost',

	proxy: {
		type: 'rest',
		noCache: false,
		limitParam: 'batchSize',
		pageParam: undefined,
		startParam: 'batchStart',
		reader: {
			type: 'nti',
			root: 'Items',
			totalProperty: 'FilteredTotalItemCount',
			readRecords: function (resp) {
				var data = this.self.prototype.readRecords.apply(this, arguments);
				this.currentPage = resp.BatchPage;
				return data;
			}
		},
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json'
		}
	},

	constructor: function () {
		this.callParent(arguments);

		this.on('load', 'topLevelLoaded');
	},

	topLevelLoaded: function (store, records) {
		(records || []).forEach(function (rec) {
			rec.set('depth', 0);
		});
	},

	hideCommentThread: function (comment) {
		this.__addFilter(comment.getThreadFilter(), true);
		comment.set('threadShowing', false);
	},

	showCommentThread: function (comment) {
		if (!comment) {
			console.error('Cant show thread for a comment thats not loaded:', id);
			return;
		}

		this.removeFilter(comment.getThreadFilter().id, true);
		comment.set('threadShowing', true);

		if (!comment.threadLoaded) {
			this.__loadCommentThread(comment);
		}
	},

	__loadCommentThread: function (comment) {
		var url = comment.getLink('replies'), req;

		if (!url) { return; }

		req = {
			url: url,
			scope: this,
			method: 'GET',
			params: {
				accept: comment.get('MimeType')
			},
			callback: function (q, s, r) {
				if (!s) {
					console.error('Failed to load threaded replies');
					return;
				}

				var flatList, json = Ext.decode(r.responseText, true),
					items = json && ParseUtils.parseItems(json), tree;

				items.push(comment);
				tree = items && UtilUserDataThreader.threadUserData(items);

				flatList = this.__flattenReplies(tree[0].children, comment.get('depth') || 0);

				this.__insertFlatThread(flatList, comment);
			}
		};

		Ext.Ajax.request(req);
	},

	__flattenReplies: function (tree, currentDepth) {
		var flatTree = [];

		function commentCompare (a, b) {
			a = a.get('CreatedTime');
			b = b.get('CreatedTime');

			if (a === b) { return 0;}

			return (a < b) ? -1 : 1;
		}

		function flattenThread (thread, depth) {
			if (!thread || Ext.Object.isEmpty(thread) || Ext.isEmpty(thread)) { return; }
			thread.sort(commentCompare);

			thread.forEach(function (t) {
				t.threadLoaded = true;
				t.set('depth', depth);
				t.set('threadShowing', true);
				flatTree.push(t);

				flattenThread(t.children, depth + 1);
			});
		}

		flattenThread(tree, currentDepth + 1);

		return flatTree;
	},

	__insertFlatThread: function (flatList, parent) {
		this.__clearFilters();
		var me = this,
			index = this.indexOf(parent);

		this.insert(index + 1, flatList);

		parent.threadLoaded = true;

		this.__applyFilters();
	},

	//silently clear the filters, so the indexs will be correct for the insertions
	__clearFilters: function () {
		this.filterCache = this.filters.items.slice();
		this.filtersCleared = true;
		this.clearFilter(true);
	},

	//add the filters back, so the view will look the same as before
	__applyFilters: function () {
		var filters = this.filters.getRange();

		this.filter(this.filterCache.concat(filters), true);
		delete this.filtersCleared;
		this.fireEvent('filters-applied');
	},

	__addFilter: function (filter) {
		var filters = this.filters.getRange();

		this.clearFilter();

		this.filter([filter].concat(filters));
		delete this.filtersCleared;
	},

	getTotalPages: function () {
		var total = this.getTotalCount(),
			pageSize = this.pageSize;

		return Math.ceil(total / pageSize);
	},

	getCurrentPage: function () {
		return this.proxy.reader.currentPage;
	},

	loadNextPage: function () {
		var current = this.getCurrentPage(),
			total = this.getTotalPages();

		if (current < total) {
			this.loadPage(current + 1);
		}
	},

	loadPreviousPage: function () {
		var current = this.getCurrentPage();

		if (current > 1) {
			this.loadPage(current - 1);
		}
	},

	//insert a single record into the right spot in the store
	insertSingleRecord: function (record) {
		this.__clearFilters();

		var parentId = record.get('inReplyTo'), i, current,
			parent = this.getById(parentId),
			parentIndex = parent && this.indexOf(parent),
			count = this.getCount(),
			depth = (parent && parent.get('depth')) || 0;

		if (!parent) {
			depth = -1;
		}

		try {
			if (parent && parentId !== this.parentTopic.getId()) {
				parent.children = parent.children || [];
				parent.addChild(record);
				parent.set('threadShowing', true);
				parent.threadLoaded = true;
			}

			record.set({
				depth: depth + 1,
				threadShowing: true
			});
			record.threadLoaded = true;

			if (parent) {
				for (i = parentIndex + 1; i < count; i++) {
					current = this.getAt(i);

					if (current.get('depth') <= depth) {
						this.insert(i, record);
						return;
					}
				}
			}

			this.add(record);
			this.fireEvent('load');
		} finally {
			this.__applyFilters();
		}
	}
});
