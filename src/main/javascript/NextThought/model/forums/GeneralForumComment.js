Ext.define('NextThought.model.forums.GeneralForumComment', {
	extend: 'NextThought.model.forums.GeneralPost',

	isComment: true,

	fields: [
		{ name: 'Deleted', type: 'boolean', persist: false },
		{ name: 'inReplyTo', type: 'string' },
		{ name: 'RecursiveLikeCount', type: 'int'},
		{ name: 'references', type: 'auto', defaultValue: []},
		//for the view ui
		{ name: 'bodyContent', type: 'string', persist: false},
		{ name: 'threadShowing', type: 'boolean', persist: false},
		{ name: 'depth', type: 'number', persist: false},
		{ name: 'creatorAvatarURL', type: 'AvatarUrl'},
		{ name: 'flagged', type: 'Synthetic', fn: function(rec){
			return rec.isFlagged();
		}},
		{ name: 'liked', type: 'Synthetic', fn: function(rec){
			return rec.isLiked();
		}}
	],

	isThreadable: true,
	canReply: true,


	/**
	 *	Make a reply to this comment
	 *	@return {NextThought.model.forums.GeneralForumComment}
	 */
	makeReply: function(){
		var comment = this,
			reply = this.self.create(),
			parent = comment.get('NTIID'),
			refs = (comment.get('references') || []).slice();

		refs.push(parent);

		reply.set({
			'ContainerId': comment.get('ContainerId'),
			'inReplyTo': parent,
			'references': refs
		});

		return reply;
	},


	getThreadFilter: function(){
		var id = this.get('NTIID');
		//if my id is in the rec's references, its below me so return false, otherwise true
		//if my id is in the references indexOf will return a number > 0 so we will return false to not show
		//if my id isn't in the references indexOf will return -1 so we will return true
		this.threadFilter = this.threadFilter || {
			id: 'ThreadFilter-'+id,
			filterFn: function(rec) {
				return rec.get('references').indexOf(id) < 0;
			}
		};

		return this.threadFilter;
	}
});
