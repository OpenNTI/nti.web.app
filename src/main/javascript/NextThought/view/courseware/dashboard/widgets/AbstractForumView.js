Ext.define('NextThought.view.courseware.dashboard.widgets.AbstractForumView', {
	extend: 'Ext.Component',

	mixins: {
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions'
	},

	ui: 'tile',

	constructor: function() {
		this.callParent(arguments);
		this.mixins.likeAndFavoriteActions.constructor.call(this);
	},


	setBody: function(body) {
		this.renderData.compiledBody = body;
		if (this.rendered) {
			this.snip.update(body);
		}
		this.maybeEllipse();
	},

	maybeEllipse: function() {
		if (!this.rendered) {
			this.needToMaybeEllipse = true;
			return;
		}
		var snip = this.snip,
			content;

		if (snip.getHeight() < snip.dom.scrollHeight) {
			content = ContentUtils.getHTMLSnippet(snip.getHTML(), this.snippetSize || 150);
			content = content + Ext.DomHelper.markup({cls: 'ellipse', cn: [{}, {}, {}]});
			snip.setHTML(content);
			snip.addCls('overflowing');
		}
	},

	beforeRender: function() {
		this.callParent(arguments);
		if (!this.record) {
			return;
		}
		var h = this.record.get('headline'),
			rd = this.record.getData();

		if (this.record instanceof NextThought.model.forums.CommunityForum) {
			rd.label = 'forum';
			rd.CreatedTime = null;
			rd.subCount = rd.TopicCount;
			rd.subName = 'Discussion';
		} else {
			rd.label = 'discussion';
			rd.subCount = rd.PostCount;
			rd.subName = 'Comment';
		}

		this.renderData = Ext.apply(this.renderData || {}, rd);

		if (h) {
			h.compileBodyContent(this.setBody, this, null, 100);
		}
		else {
			console.error('Forum has no headline.  Were we given something we didnt expect', this.record, this);
		}
	},

	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, 'click', 'handleClick');

		if (this.needToMaybeEllipse) {
			this.maybeEllipse();
		}
	},

	handleClick: function(e) {
		if (e.getTarget('.controls')) {
			return;
		}

		this.fireEvent('goto-forum-item', this.record);
	}
});
