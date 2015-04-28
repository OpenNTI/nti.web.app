Ext.define('NextThought.model.forums.CommentPost', {
	extend: 'NextThought.model.forums.Post',
	mimeType: 'application/vnd.nextthought.forums.generalforumcomment',

	isComment: true,

	fields: [
		{ name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false, affectedBy: 'Last Modified'},
		{ name: 'NotificationGroupingField', mapping: 'CreatedTime', type: 'groupByTime', persist: false, affectedBy: 'CreatedTime'},

		{ name: 'Deleted', type: 'boolean', persist: false },
		{ name: 'inReplyTo', type: 'string' },
		{ name: 'RecursiveLikeCount', type: 'int', persist: false},
		{ name: 'ReferencedByCount', type: 'int', persist: false},
		{ name: 'references', type: 'auto', defaultValue: []},
		//for the view ui
		{ name: 'bodyContent', type: 'string', persist: false},
		{ name: 'bodyPreview', type: 'string', persist: false},
		{ name: 'threadShowing', type: 'boolean', persist: false},
		{ name: 'depth', type: 'number', persist: false},
		{ name: 'creatorAvatarURL', type: 'AvatarUrl'},
		{ name: 'flagged', type: 'Synthetic', fn: function(rec) {
			return rec.isFlagged();
		}},
		{ name: 'liked', type: 'Synthetic', fn: function(rec) {
			return rec.isLiked();
		}},
		{ name: 'repliedTo', type: 'Synthetic', fn: function(rec) {
			return rec.parent && rec.parent.get('Creator');
		}},
		{ name: 'likeCount', type: 'Synthetic', fn: function(rec) {
			return rec.getFriendlyLikeCount && rec.getFriendlyLikeCount();
		}}
	],

	isThreadable: true,
	canReply: true,


	/**
	 *	Make a reply to this comment
	 *	@return {NextThought.model.forums.CommentPost}
	 */
	makeReply: function() {
		var comment = this,
			reply = this.self.create(),
			parent = comment.get('NTIID'),
			refs = (comment.get('references') || []).slice();

		refs.push(parent);

		reply.set({
			'ContainerId': comment.get('ContainerId'),
			'inReplyTo': parent,
			'references': refs,
			'MimeType': 'application/vnd.nextthought.forums.post'
		});

		return reply;
	},


	getThreadFilter: function() {
		var id = this.get('NTIID');
		//if my id is in the rec's references, its below me so return false, otherwise true
		//if my id is in the references indexOf will return a number > 0 so we will return false to not show
		//if my id isn't in the references indexOf will return -1 so we will return true
		this.threadFilter = this.threadFilter || {
			id: 'ThreadFilter-' + id,
			filterFn: function(rec) {
				return rec.get('references').indexOf(id) < 0;
			}
		};

		return this.threadFilter;
	},


	addChild: function(child) {
		if (!this.children) { return; }

		var count, p = this;

		this.children.push(child);

		while (p) {
			count = p.get('ReferencedByCount') || 0;
			p.set('ReferencedByCount', count + 1);
			p = p.parent;
		}
	}
});
