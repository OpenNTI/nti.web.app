Ext.define('NextThought.view.account.activity.topic.Preview', {
	extend: 'NextThought.view.account.activity.Preview',
	alias: 'widget.activity-preview-topic',

	requires: [
		'NextThought.mixins.forum-feature.Path',
		'NextThought.view.account.activity.note.Reply',
		'NextThought.view.forums.topic.parts.Comments'
	],

	mixins: {
		forumPath: 'NextThought.mixins.forum-feature.Path'
	},

	renderSelectors: {
		pathEl: '.path'
	},

	threadedReplies: true,

	defaultType: 'activity-preview-topic-reply',

	toolbarTpl: Ext.DomHelper.markup({ cls: 'path'}),


	getCommentCount: function(record) {
		return record.get('PostCount');
	},


	buildStore: function() {
		this.store = NextThought.store.NTI.create({
			storeId: 'activity-popout-topic-preview' + guidGenerator(),
			url: this.record.getLink('contents')
		});

		this.mon(this.store, {
			scope: this,
			load: this.fillInReplies
		});

		this.store.load();
	},


	fillInReplies: function(store, records) {
		if (Ext.isEmpty(records)) {
			return;
		}

		this.removeAll(true);
		records = Ext.Array.sort(records, Globals.SortModelsBy('CreatedTime', 'DESC'));
		this.add(Ext.Array.map(records, function(r) {
			return {record: r};
		}));
		this.fireEvent('realign');
	},


	showReplies: function() {
		this.navigateToItem('show-topic', this, this.record);
	},


	navigateToItem: function() {
		var pop = this.up('activity-popout');

		this.fireEvent('show-topic', this, this.record, this.record.focusRecord);

		if (pop) {
			pop.destroy();
		}
	},


	beforeRender: function() {
		this.callParent(arguments);
		this.record.get('headline').compileBodyContent(this.setBody, this, null, this.self.WhiteboardSize);
		this.fillInPath();
		//Load the last comment or the this.record.focusRecord (if its set)

		if (this.record.focusRecord && !this.threadedReplies) {
			this.add({record: this.record.focusRecord});
		}
	},

	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.pathEl, 'click', this.navigateToItem, this);

		if (!this.threadedReplies) { return; }

		var me = this,
			comments = me.add({xtype: 'forums-topic-comment-thread', topic: me.record, activeComment: me.record.focusRecord});

		if (me.record.focusRecord) {
			comments.store.addFilter({
				id: 'flyoutComment',
				filterFn: function(record) {
					var refs = record.get('references') || [];

					//if the record is the focus record
					if (me.record.focusRecord.getId() === record.getId()) {
						return true;
					}

					//if the record's references contain the focus record
					if (refs.indexOf(me.record.focusRecord.getId()) >= 0) {
						return true;
					}

					//if the record shares a ancestor with the focus record
					if (!Ext.isEmpty(Ext.Array.intersect(refs, me.record.focusRecord.get('references')))) {
						return true;
					}

					//if the record is a child of the focus record
					return (me.record.focusRecord.get('references') || []).indexOf(record.getId()) >= 0;
				}
			});
		}

		me.mon(comments, {
			'activated-editor': function() {
				me.openEditor = true;
			},
			'deactivated-editor': function() {
				delete me.openEditor;
			}
		});
	},

	destroy: function() {
		if (this.store) {
			this.store.destroyStore();
		}
		this.callParent(arguments);
	}

});


Ext.define('NextThought.view.account.activity.topic.Reply', {
	extend: 'NextThought.view.account.activity.note.Reply',
	alias: 'widget.activity-preview-topic-reply',


	deleteComment: function() {
		this.fireEvent('delete-topic-comment', this.record, this, Ext.bind(this.onDelete, this));
	},

	navigateToComment: function() {
		var me = this,
			rec = this.record,
			r = this.up('[record]') && this.up('[record]').record,
			cid = rec.get('ID');

		if (!r) {
			console.warn('could not find the parent record');
			return;
		}

		me.fireEvent('show-topic', this, r, cid);
	},

	handleDestroy: function() {
		//First remove the delete and edit link listeners followed by the els
		if (this.deleteEl) {
			this.mun(this.deleteEl, 'click', this.onDeletePost, this);
			this.deleteEl.remove();
		}

		if (this.editEl) {
			this.mun(this.editEl, 'click', this.onEditPost, this);
			this.editEl.remove();
		}

		//Now tear down like and favorites
		this.tearDownLikeAndFavorite();


		//Now clear the rest of our field listeners
		this.record.removeObserverForField(this, 'body', this.updateContent, this);

		//Now update the body to the same text the server uses.
		this.bodyEl.update(getString('NextThought.view.account.activity.topic.Reply.deleted'));
		this.addCls('deleted');
	}
});
