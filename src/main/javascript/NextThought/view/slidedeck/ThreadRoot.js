Ext.define('NextThought.view.slidedeck.ThreadRoot', {
	extend: 'NextThought.view.annotations.note.Panel',
	alias:  'widget.slidedeck-slide-note',

	root:         true,
	cls:          'dark',
	rootQuery:    'slidedeck-slide',
	collapsedCls: 'collapsed',

	defaults: {
		cls:      'dark',
		defaults: { cls: 'dark' }
	},

	initComponent: function () {
		this.addCls('slide');
		this.addEvents('beforecollapse', 'beforeexpand');
		this.enableBubble('beforecollapse', 'beforeexpand');
		this.callParent(arguments);
	},

	afterRender: function () {

		this.callParent(arguments);

		//Inject a link that shows we have comments
		this.commentsLink = Ext.DomHelper.insertAfter(this.time, {tag: 'a', cls: 'comment-link', html: this.textForCommentLink()}, true);

		this.updateHasChildren();
		this.noteBody.on('click', this.toggleCollapse, this);
		this.collapse();
		this.editorEl.down('.title').setVisibilityMode(Ext.dom.Element.DISPLAY);
	},


	createEditor: function () {
		this.editor = Ext.widget('nti-editor', {ownerCt: this, renderTo: this.responseBox, enableTitle: true});
		if (this.editor.el.down('.title')) {
			this.editor.el.down('.title').addCls('small');
		}
	},


	addAdditionalRecordListeners: function (record) {
		this.mon(record, 'count-updated', this.updateHasChildren, this);
		this.mon(record, 'count-updated', this.updateCommentLink, this);
	},

	removeAdditionalRecordListeners: function (record) {
		this.mun(record, 'count-updated', this.updateHasChildren, this);
		this.mon(record, 'count-updated', this.updateCommentLink, this);
	},

	textForCommentLink: function () {
		var commentLinkText = "No Comments",
				replyCount;
		replyCount = this.record.getReplyCount();
		if (replyCount > 0) {
			commentLinkText = Ext.String.format('{0} {1}', replyCount, replyCount > 1 ? 'Replies' : 'Reply');
		}
		return commentLinkText;
	},

	updateCommentLink: function () {
		this.commentsLink.update(this.textForCommentLink());
	},

	updateHasChildren: function () {
		if (this.record.getReplyCount() > 0) {
			this.addCls('hasChildren');
		}
	},

	rootToCountComponentsFrom: function () {
		return this;
	},

	toggleCollapse: function (e) {
		if (e.getTarget('a[href]')) {
			return true; //if the user clicked on a url link, let it continue to propagate.
		}

		e.stopEvent();
		//We need to find all the click handlers in the note panel and make sure they are stopped...other wise this will trigger as well.
		return (this.getTargetEl().hasCls(this.collapsedCls) ? this.expand() : this.collapse()) && false;
	},


	collapse: function () {
		var el = this.getTargetEl();
		if (this.fireEvent('beforecollapse', this, el) !== false) {
			el.addCls(this.collapsedCls);
			this.addCls(this.collapsedCls);
			this.updateLayout();
		}
	},


	expand: function () {
		var el = this.getTargetEl();
		if (this.fireEvent('beforeexpand', this, el) !== false) {
			el.removeCls(this.collapsedCls);
			this.removeCls(this.collapsedCls);
			this.updateLayout();
		}
	},

	onReply: function () {
		this.editorEl.down('.title').hide();
		this.activateReplyEditor();
	},


	onEdit: function () {
		this.text.hide();
		this.editMode = true;
		this.editorEl.down('.title').show();
		this.editor.editBody(this.record.get('body'));
		this.editor.setTitle(this.record.get('title'));
		this.activateReplyEditor();
	}
});
