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
			ui: 'feedback-box',
			itemSelector: '.feedback-item',
			tpl: Ext.DomHelper.markup([
				{tag: 'tpl', 'for': '.', cn: {
					cls: 'feedback-item', cn: [
						{ cls: 'avatar', style: {backgroundImage: 'url({Creator:avatarURL()})'}},
						{ cls: 'wrap', cn: [
							{ cls: 'meta', cn: [
								{ tag: 'span', cls: 'name', html: '{Creator}'},
								{ tag: 'time', datetime: '{CreatedTime:date("c")}', html: '{CreatedTime:ago()}'}
							]},
							{ cls: 'message', html: '{body}'}
						]}
					]
				}}
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

		this.editor = Ext.widget('nti-editor', {
			ownerCt: this,
			renderTo: this.comment.feedbackBox,
			enableObjectControls: false //lets not open too much complexity yet.
		});

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
			editor.deactivate();
			editor.setValue('');
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

		this.history = history;

		var s = 'The comments below will only be visible to you and your {0}.',
			header = this.down('box[name=title]'),
			feedback = history.get('Feedback').get('href');

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

		this.mon(this.store, 'load', 'resolveUsers');

		if (this.history.fields.get('feedback')) {
			this.mon(this.store, 'load', 'updateFeedback');
		}

		this.feedbackList.bindStore(this.store);
		this.store.load();

		this.mon(this.feedbackList, 'itemclick', 'maybeShowProfile');

		header.messageEl.update(Ext.String.format(s, (isMe(history.get('Creator')) ? 'instructor' : 'student')));

		this.show();
	},


	showEditor: function() {
		this.editor.activate();
		Ext.defer(this.editor.focus, 350, this.editor);
		this.updateLayout();
	},


	updateFeedback: function(store){
		this.history.set('feedback', store.getCount());
	},


	resolveUsers: function(store) {
		var pluck = Ext.Array.pluck,
			list = this.feedbackList,
			records = store.getRange();

		function fill(users) {
			users.forEach(function(u, i) {
				var r = records[i],
					c = r && r.get('Creator');
				if (c && typeof c === 'string' && u.getId() === c) {
					r.set('Creator', u);
				} else {
					console.warn('Did not resolve', c, 'for:', r, '. Got:', u);
				}
			});
			list.refresh();
		}

		UserRepository.getUser(pluck(pluck(records, 'data'), 'Creator'))
				.done(fill);

	},


	maybeShowProfile: function(s, record, item, index, e) {
		var c = record.get('Creator');
		if ((e.getTarget('.avatar') || e.getTarget('.name')) && c && c.getProfileUrl) {
			this.fireEvent('show-profile', c);
		}
	}
});
