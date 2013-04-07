Ext.define('NextThought.model.Note', {
	extend: 'NextThought.model.Base',

	mixins: {
		bodyContent: 'NextThought.mixins.ModelWithBodyContent'
	},

	statics: {
		createFromHighlight: function(hl){

			var p = LocationProvider.getPreferences();
			p = p ? p.sharing : null;
			p = p ? p.sharedWith || [] : null;

			return this.create({
				ContainerId: hl.get('ContainerId'),
				sharedWith: p || hl.get('sharedWith'),
				prohibitReSharing: hl.get('prohibitReSharing'),
				tags: hl.get('tags'),
				selectedText: hl.get('selectedText'),
				applicableRange: hl.get('applicableRange')
			});
		}
	},

	requires: [
		'NextThought.model.anchorables.DomContentRangeDescription',
		'NextThought.model.converters.ContentRangeDescription',
		'NextThought.model.converters.GroupByTime'
	],


	isThreadable: true,
	canReply: true,

	fields: [
		{ name: 'ReferencedByCount', type: 'int'},
		{ name: 'inReplyTo', type: 'string' },
		{ name: 'references', type: 'auto', defaultValue: [] },
		{ name: 'AutoTags', type: 'Auto'},
		{ name: 'tags', type: 'Auto'},
		{ name: 'applicableRange', type: 'ContentRangeDescription'},
		{ name: 'body', type: 'auto' },
		{ name: 'selectedText', type: 'string'},
		{ name: 'style', type: 'string' },
		{ name: 'sharedWith', type: 'UserList' },
		{ name: 'prohibitReSharing', type: 'boolean' },
		{ name: 'RecursiveLikeCount', type: 'int'},

		{ name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false, affectedBy: 'Last Modified'},
		{ name: 'FavoriteGroupingField', defaultValue:'Note', persist: false}
	],

	/*
	 * Retrieves the descendants for the given note.
	 * If this is a placeholder that means aggregating
	 * getDescendants on each of it's children.  If this
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
	getDescendants: function(callback, scope){
		var resultStore = NextThought.store.PageItem.create(),
			outstandingChildren = 0, me = this;


		function childFinished(childStore){
			if(childStore){
				resultStore.loadRecords(childStore.getRange(), {addRecords: true});
			}
			outstandingChildren--;

			if(outstandingChildren === 0){
				Ext.callback(callback, scope, [resultStore]);
			}
		}

		if(this.placeholder){
			if(Ext.isEmpty(this.children)){
				//A placeholder with no children
				//that probably shouldn't happen
				console.warn('Encountered a placeholder with no children when getting descendants', this.children);
				Ext.callback(callback, scope, [resultStore]);
				return;
			}

			outstandingChildren += this.children.length;
			Ext.each(this.children, function(child){
				if(!child.placeholder){
					//Note we don't use add here.  PageItem overrides
					//that to generate threads, which we don't really want
					resultStore.loadRecords([child], {addRecords: true});
				}
				child.getDescendants(childFinished);
			});
		}
		else{
			me.loadReplies(callback, scope);
		}
	},

	/**
	 * Asynchronously loads replies using the "replies" link type
	 *
	 * @param callback {Function}
	 * @param scope {Object}
	 * @param additionalParams {Object} An optional object describing params to send to the server.
	 *          Ext: { sortOn: 'lastModified', sortOrder: 'descending' }
	 */
	loadReplies: function(callback, scope, additionalParams){
		var me = this,
			link = this.getLink('replies'),
			store,
			params;

		if(!link){
			Ext.callback(callback, scope, [NextThought.store.PageItem.create()]);
			return;
		}

		store = NextThought.store.PageItem.make(link, undefined, true);
		params = store.proxy.extraParams || {};

		if(additionalParams){
			params = Ext.apply(params, additionalParams);
			store.proxy.extraParams = params;
		}

		store.on('load', callback, me, {single: true, scope: scope});
		store.load({});
	},

	/**
	 * From a note, build its reply
	 * @return {NextThought.model.Note}
	 */
	makeReply: function(){
		var note = this,
			reply = this.self.create(),
			parent = note.get('NTIID'),
			refs = (note.get('references') || []).slice();

		refs.push(parent);

		reply.set('applicableRange', note.get('applicableRange'));
		reply.set('ContainerId', note.get('ContainerId'));
		reply.set('inReplyTo', parent);
		reply.set('references', refs);

		return reply;
	},

	getReplyCount: function(){
		if(this.hasRepliesBeenLoaded(this)){
			return this.countChildren();
		}
		return this.sumReferenceByCount();
	},

	/**
	 * 'AdjustedReferenceCount' is a derived field. Thus, we need to implement at least a getter fn.
	 * When it's triggered, things that are listening to it will update their replyCount.
	 */
	getAdjustedReferenceCount: Ext.emptyFn,

	hasRepliesBeenLoaded: function(rec){
		if(!rec.placeholder){
			return rec.get('ReferencedByCount') === 0 || ((rec.children || []).length > 0);
		}

		return Ext.Array.every((rec.children || []), rec.hasRepliesBeenLoaded, this);
	},

	countChildren: function(){
		function allDescendants (rec) {
			var i, child;
			for (i = 0; i < (rec.children || []).length; i++) {
				child = rec.children[i];
				sum = sum + (child.placeholder ? 0 : 1);
				allDescendants(child);
			}
		}
		var sum = 0;
		allDescendants(this);
		return sum;
	},

	sumReferenceByCount: function(rec){
		var sum = 0;
		if(!rec){
			rec = this;
		}

		if(rec.raw.hasOwnProperty('ReferencedByCount')){
			return rec.get('ReferencedByCount') + (rec.parent ? 1:0);
		}

		Ext.Array.each((rec.children || []), function(a){
			sum += rec.sumReferenceByCount(a);
		});

		return sum;
	},

	debugString: function(){
		var bs = (this.get('body') || []).toString(), cs;

		if(this.placeholder){
			bs = '_';
		}

		if(Ext.isEmpty(this.children)){
			return '['+bs+']';
		}

		cs = Ext.Array.map(this.children, function(c){return c.debugString();});

		return '['+bs+' ('+cs.join(',')+') ]';
	},

	getTotalLikeCount: function(){
		if(this.raw.hasOwnProperty('RecursiveLikeCount') ){
			return this.get('RecursiveLikeCount') || 0;
		}

		return (this.children||[]).reduce(function(sum,child){
			return sum + (child.getTotalLikeCount ? (child.getTotalLikeCount()||0) : 0);
		}, (this.isLiked() ? 1 : 0));
	},

	convertToPlaceholder: function(){
		var me = this,
			data = this.getData(false);
		me.suspendEvents(true);
		me.callParent(arguments);

		me.set('CreatedTime', data.CreatedTime);
		me.set('Last Modified', new Date());
		me.set('Creator', User.getUnresolved('Unknown'));
		me.set('applicableRange', data.applicableRange);
		me.set('selectedText',data.selectedText);
		me.set('inReplyTo', data.inReplyTo);
		me.set('references', data.references);
		me.set('style',data.style);
		me.set('ReferencedByCount', data.ReferencedByCount);
		me.resumeEvents();
	}
});
