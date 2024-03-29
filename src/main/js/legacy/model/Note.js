const Ext = require('@nti/extjs');
const User = require('internal/legacy/model/User');
const ContentUtils = require('internal/legacy/util/Content');
const PageItem = require('internal/legacy/store/PageItem');

require('internal/legacy/mixins/ModelWithBodyContent');
require('./anchorables/DomContentRangeDescription');
require('./anchorables/TranscriptRangeDescription');
require('./Base');

module.exports = exports = Ext.define('NextThought.model.Note', {
	extend: 'NextThought.model.Base',

	mixins: {
		bodyContent: 'NextThought.mixins.ModelWithBodyContent',
	},

	statics: {
		createFromHighlight: function (hl) {
			return this.create({
				ContainerId: hl.get('ContainerId'),
				sharedWith: [],
				prohibitReSharing: hl.get('prohibitReSharing'),
				tags: hl.get('tags'),
				selectedText: hl.get('selectedText'),
				applicableRange: hl.get('applicableRange'),
			});
		},
	},

	isThreadable: true,
	canReply: true,
	isNoteModel: true,

	fields: [
		{ name: 'ReferencedByCount', type: 'int' },
		{ name: 'inReplyTo', type: 'string', defaultValue: null },
		{ name: 'references', type: 'auto', defaultValue: [] },
		{ name: 'AutoTags', type: 'Auto' },
		{ name: 'tags', type: 'auto', defaultValue: [] },
		{ name: 'applicableRange', type: 'ContentRangeDescription' },
		{ name: 'body', type: 'auto' },
		{ name: 'title', type: 'auto' },
		{ name: 'selectedText', type: 'string' },
		{ name: 'style', type: 'string' },
		{ name: 'sharedWith', type: 'UserList' },
		{ name: 'prohibitReSharing', type: 'boolean' },
		{ name: 'RecursiveLikeCount', type: 'int' },

		{
			name: 'GroupingField',
			mapping: 'Last Modified',
			type: 'groupByTime',
			persist: false,
			affectedBy: 'Last Modified',
		},
		{
			name: 'NotificationGroupingField',
			mapping: 'CreatedTime',
			type: 'groupByTime',
			persist: false,
			affectedBy: 'CreatedTime',
		},
		{ name: 'FavoriteGroupingField', defaultValue: 'Note', persist: false },

		{ name: 'line', type: 'int', defaultValue: 0, persist: false },
		{ name: 'pline', type: 'int', defaultValue: 0, persist: false },
		{
			name: 'ReplyCount',
			type: 'Synthetic',
			persist: false,
			fn: function (r) {
				if (r.placeholder) {
					return r.countChildren();
				}

				return r.get('ReferencedByCount');
			},
		},
		{
			name: 'preview',
			type: 'Synthetic',
			persist: false,
			affectedBy: ['body', 'title'],
			fn: function (r) {
				if (r.placeholder) {
					return '[Deleted]';
				}

				if (r.data.hasOwnProperty('$preview')) {
					return r.data.$preview;
				}

				r.resolveNotePreview(function (s) {
					r.data.$preview = s;
					try {
						r.afterEdit(['preview', 'GroupingField']);
					} catch (e) {
						console.error(e.stack || e.message || e); //setDirty is caught here...
						// would be nice to figure out why the store doesn't have a group for this record. :/
						// store/view destroyed?
					}
				}, 150);

				return '';
			},
			fnSet: function (r) {
				delete r.data.$preview;
				return r.data.preview;
			},
		},

		//We use these fields in the user-data panel
		{ name: 'path', type: 'string', persist: false },
		{ name: 'location', type: 'string', persist: false },
		{ name: 'textBodyContent', type: 'auto', persist: false },
	],

	/*
	 * Retrieves the descendants for the given note.
	 * If this is a placeholder that means aggregating
	 * getDescendants on each of it's children.	 If this
	 * is an actual note this means an ajax request to the server.
	 *
	 * When complete, callback will be called with a PageItem store
	 * containing all the descendants of this note.

	 * IMPORTANT:
	 * the threading relationships of this tree are not modified. That means
	 * if this is a placeholder or partial tree that the relationships may be
	 * maintained in the result.  Doesn't seem like this functions job to muck
	 * with that stuff.
	 */
	getDescendants: function (callback, scope) {
		var resultStore = PageItem.create(),
			outstandingChildren = 0,
			me = this;

		function childFinished(childStore) {
			if (childStore) {
				resultStore.loadRecords(childStore.getRange(), {
					addRecords: true,
				});
			}
			outstandingChildren--;

			if (outstandingChildren === 0) {
				Ext.callback(callback, scope, [resultStore]);
			}
		}

		if (this.placeholder) {
			if (Ext.isEmpty(this.children)) {
				//A placeholder with no children
				//that probably shouldn't happen
				console.warn(
					'Encountered a placeholder with no children when getting descendants',
					this.children
				);
				Ext.callback(callback, scope, [resultStore]);
				return;
			}

			outstandingChildren += this.children.length;
			Ext.each(this.children, function (child) {
				if (!child.placeholder) {
					//Note we don't use add here.  PageItem overrides
					//that to generate threads, which we don't really want
					resultStore.loadRecords([child], { addRecords: true });
				}
				child.getDescendants(childFinished);
			});
		} else {
			me.loadReplies(callback, scope);
		}
	},

	/**
	 * Asynchronously loads replies using the "replies" link type
	 *
	 * @param {Function} callback -
	 * @param {Object} scope -
	 * @param {Object} additionalParams An optional object describing params to send to the server.
	 *     Ex: { sortOn: 'lastModified', sortOrder: 'descending' }
	 * @returns {void}
	 */
	loadReplies: function (callback, scope, additionalParams) {
		var me = this,
			link = this.getLink('replies'),
			store,
			params;

		if (!link) {
			Ext.callback(callback, scope, [PageItem.create()]);
			return;
		}

		store = PageItem.make(link, undefined, true);
		params = store.proxy.extraParams || {};

		if (additionalParams) {
			params = Ext.apply(params, additionalParams);
			store.proxy.extraParams = params;
		}

		store.on('load', callback, me, { single: true, scope: scope });
		store.load({});
	},

	/**
	 * From a note, build its reply
	 *
	 * @returns {NextThought.model.Note} -
	 */
	makeReply: function () {
		var note = this,
			reply = this.self.create(),
			parent = note.get('NTIID'),
			refs = (note.get('references') || []).slice();

		refs.push(parent);

		reply.set('applicableRange', note.get('applicableRange'));
		reply.set('ContainerId', note.get('ContainerId'));
		reply.set('inReplyTo', parent);
		reply.set('references', refs);
		reply.set('style', 'suppressed');

		return reply;
	},

	getReplyCount: function () {
		if (this.hasRepliesBeenLoaded(this)) {
			return this.countChildren();
		}
		return this.sumReferenceByCount();
	},

	/**
	 * 'AdjustedReferenceCount' is a derived field. Thus, we need to implement at least a getter fn.
	 * When it's triggered, things that are listening to it will update their replyCount.
	 */
	getAdjustedReferenceCount: Ext.emptyFn,

	hasRepliesBeenLoaded: function (rec) {
		if (!rec.placeholder) {
			return (
				rec.get('ReferencedByCount') === 0 ||
				(rec.children || []).length > 0
			);
		}

		return Ext.Array.every(
			rec.children || [],
			rec.hasRepliesBeenLoaded,
			this
		);
	},

	isOnlyNonTextBodyParts: function (body) {
		if (Ext.isEmpty(body)) {
			return false;
		}
		return Ext.Array.every(body, function (i) {
			return typeof i !== 'string';
		});
	},

	resolveNoteTitle: function (cb, max) {
		var t = this.get('title'),
			body = this.get('body'),
			snip;

		max = max || 36;

		if (!Ext.isEmpty(t)) {
			snip = Ext.String.ellipsis(t, max, false);
		} else {
			if (this.isOnlyNonTextBodyParts(body)) {
				snip = '[Image]';
			} else {
				snip = Ext.String.ellipsis(
					this.simplifyTitle(body)[0],
					max,
					true
				);
			}
		}

		Ext.callback(cb, null, [snip, t]);
	},

	resolveNotePreview: function (cb, max) {
		var t = this.get('title'),
			body = this.get('body'),
			snip,
			onlyObject;

		max = max || 36;
		// NOTE: If there is a title set it.
		// If the note has no title and the body is Whiteboard only, set it to 'Whiteboard',
		// If the note has no title, set a snippet of the body.
		if (!Ext.isEmpty(t)) {
			snip = Ext.String.ellipsis(t, max, false);
		} else if (!Ext.isEmpty(body)) {
			onlyObject = this.isOnlyNonTextBodyParts(body);

			if (onlyObject) {
				t = 'Whiteboard';
			}
			this.compileBodyContent(
				function (html) {
					snip = onlyObject
						? html
						: ContentUtils.getHTMLSnippet(html, max);
					Ext.callback(cb, null, [snip || html, t]);
				},
				null,
				null,
				null
			);

			return;
		} else {
			snip = '';
			t = '';
		}

		Ext.callback(cb, null, [snip, t]);
	},

	//get the simplified body and filter out all non string parts
	simplifyTitle: function (body) {
		var text = this.simplifyBody(body) || [];

		text = text.filter(function (t) {
			return Ext.isString(t);
		});

		return text;
	},

	simplifyBody: function (body) {
		const text = [];
		const d = document.createElement('div');

		Ext.each(body, function (c) {
			if (Ext.isString(c)) {
				text.push(((d.innerHTML = c), d.textContent));
			} else {
				text.push(c);
			}
		});

		return text;
	},

	countChildren: function () {
		var sum = 0;

		function allDescendants(rec) {
			var i, child;
			for (i = 0; i < (rec.children || []).length; i++) {
				child = rec.children[i];
				sum = sum + (child.placeholder ? 0 : 1);
				allDescendants(child);
			}
		}
		allDescendants(this);
		return sum;
	},

	sumReferenceByCount: function (rec) {
		var sum = 0;
		if (!rec) {
			rec = this;
		}

		if (rec.raw && rec.raw.hasOwnProperty('ReferencedByCount')) {
			return rec.get('ReferencedByCount') + (rec.parent ? 1 : 0);
		}

		Ext.each(rec.children || [], function (a) {
			sum += rec.sumReferenceByCount(a);
		});

		return sum;
	},

	debugString: function () {
		var bs = (this.get('body') || []).toString(),
			cs;

		if (this.placeholder) {
			bs = '_';
		}

		if (Ext.isEmpty(this.children)) {
			return '[' + bs + ']';
		}

		cs = Ext.Array.map(this.children, function (c) {
			return c.debugString();
		});

		return '[' + bs + ' (' + cs.join(',') + ') ]';
	},

	getTotalLikeCount: function () {
		if (this.raw && this.raw.hasOwnProperty('RecursiveLikeCount')) {
			return this.get('RecursiveLikeCount') || 0;
		}

		return (this.children || []).reduce(
			function (sum, child) {
				return (
					sum +
					(child.getTotalLikeCount
						? child.getTotalLikeCount() || 0
						: 0)
				);
			},
			this.isLiked() ? 1 : 0
		);
	},

	convertToPlaceholder: function () {
		var me = this,
			data = this.getData(false),
			p = User.getUnresolved();
		me.suspendEvents(true);
		me.callParent(arguments);

		p.set('alias', ' ');

		me.set({
			CreatedTime: data.CreatedTime,
			'Last Modified': new Date(),
			Creator: p,
			applicableRange: data.applicableRange,
			selectedText: data.selectedText,
			inReplyTo: data.inReplyTo,
			references: data.references,
			style: data.style,
			ReferencedByCount: data.ReferencedByCount,
		});
		me.resumeEvents();
	},

	getActivityItemConfig: function () {
		return Promise.resolve({
			message: Ext.String.format(
				'&ldquo;{0}&rdquo;',
				Ext.String.ellipsis(this.getBodyText(), 50, true)
			),
			verb: this.get('inReplyTo') ? 'said' : 'shared a note',
		});
	},
});
