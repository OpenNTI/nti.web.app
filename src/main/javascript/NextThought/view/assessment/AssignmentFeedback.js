Ext.define('NextThought.view.assessment.AssignmentFeedback', {
	extend: 'NextThought.view.content.overlay.Panel',
	alias: 'widget.assignment-feedback',

	requires: [
		'NextThought.editor.Editor'
	],

	cls: 'feedback-panel',
	ui: 'assessment',
	appendPlaceholder: true,
	hidden: true,
	shouldShow: true,

	items: [
		{
			xtype: 'box',
			ui: 'feedback-title',
			name: 'title',
			autoEl: { cn: [
				{ tag: 'h1', html: 'Feedback' },
				{ cls: 'message' }
			]},
			renderSelectors: {
				messageEl: '.message'
			}
		},
		{
			xtype: 'dataview',
			itemSelector: 'feedback-item',
			tpl: Ext.DomHelper.markup([
				{tag: 'tpl', 'for': '.', cn: [
					'{body}'
				]}
			])
		},
		{
			xtype: 'box',
			ui: 'comment-box',
			name: 'comment',
			autoEl: { cn: [
				{cls: 'editor-box'}
			]},
			renderSelectors: {
				feedbackBox: '.editor-box'
			}
		}
	],


	afterRender: function() {
		this.callParent(arguments);

		var commentBox;
		this.feedbackList = this.down('dataview');
		this.comment = this.down('box[name=comment]');

		commentBox = this.comment.feedbackBox;

		if (this.history) {
			this.setHistory(this.history);
		}

		this.fireEvent('has-been-submitted', this);

		this.mon(commentBox, {
			'click': 'showEditor'
		});

		this.editor = Ext.widget('nti-editor', {ownerCt: this, renderTo: this.comment.feedbackBox});

		this.mon(this.editor, {
			'activated-editor': function() {
				commentBox.addCls('editor-active');
			},
			'deactivated-editor': function() {
				commentBox.removeCls('editor-active');
			},
			'save': 'addFeedback',
			'no-body-content': function(editor, el) {
				editor.markError(el, 'You need to type something');
				return false;
			}
		});
	},


	addFeedback: function(editor) {
		var item = new NextThought.model.courseware.UsersCourseAssignmentHistoryItemFeedback(
						{body: editor.getValue().body}),
			feedback = this.history.get('Feedback'),
			store = this.store;

		Service.request({
			url: feedback.get('href'),
			method: 'POST',
			jsonData: item.getData()
		}).done(function() {
			console.log('Saved feedback');
			editor.cancel();//short cut to closing and clearing. :P
			store.load();
		}).fail(function(reason) {
			console.error('faild to save feedback', reason);
		});

	},


	setHistory: function(history) {
		if (!history || !history.get('Feedback')) {
			this.hide();
			return;
		}

		var s = 'The comments below will only be visible to you and your {0}.',
			header = this.down('box[name=title]'),
			feedback = this.history.get('Feedback').get('href');

		this.store = new Ext.data.Store({
			model: NextThought.model.courseware.UsersCourseAssignmentHistoryItemFeedback,
			proxy: {
				type: 'rest',
				url: feedback,
				reader: {
					type: 'json',
					root: 'Items'
				}
			}
		});

		this.feedbackList.bindStore(this.store);
		this.store.load();

		header.messageEl.update(Ext.String.format(s, (isMe(history.get('Creator')) ? 'instructor' : 'student')));

		this.show();
	},

	showEditor: function() {
		this.editor.activate();
		this.updateLayout();
	}

});
