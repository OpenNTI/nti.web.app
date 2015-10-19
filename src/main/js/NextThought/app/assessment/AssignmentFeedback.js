Ext.define('NextThought.app.assessment.AssignmentFeedback', {
	extend: 'NextThought.app.contentviewer.overlay.Panel',
	alias: 'widget.assignment-feedback',

	requires: [
		'NextThought.editor.Editor'
	],

	cls: 'feedback-panel',
	ui: 'assessment',
	appendPlaceholder: true,
	forceInsert: true,
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
						'{Creator:avatar}',
						{ cls: 'wrap', cn: [
							{ cls: 'meta', cn: [
								{ tag: 'span', cls: 'name', html: '{Creator}'},
								{ tag: 'time', datetime: '{CreatedTime:date("c")}', html: '{CreatedTime:ago()}'}
							]},
							{ cls: 'message', html: '{body}'},
							{tag: 'tpl', 'if': 'isMe(Creator)', cn: { cls: 'footer', cn: [
								{ tag: 'span', cls: 'link edit', html: '{{{NextThought.view.assessment.AssignmentFeedback.edit}}}'},
								{ tag: 'span', cls: 'link delete', html: '{{{NextThought.view.assessment.AssignmentFeedback.delete}}}'}
							]}}
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
				editor.markError(el, getString('NextThought.view.assessment.AssignmentFeedback.empty-editor'));
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

		var s = getString('NextThought.view.assessment.AssignmentFeedback.visibility-message') + ' {0}.',
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
			},
			sorters: [
				{ property: 'CreatedTime' }
			]
		});

		this.mon(this.store, 'load', 'resolveUsers');

		if (this.history.fields.get('feedback')) {
			this.mon(this.store, 'load', 'updateFeedback');
		}

		this.feedbackList.loadMask.disable();
		this.feedbackList.bindStore(this.store);
		this.store.load();

		this.feedbackList.loadMask.enable();

		this.mon(this.feedbackList, 'itemclick', 'onFeedbackClick');

		header.messageEl.update(
			Ext.String.format(
				s,
				(isMe(history.get('Creator')) ?
					getString('NextThought.view.assessment.AssignmentFeedback.visibility-instr') :
					getString('NextThought.view.assessment.AssignmentFeedback.visibility-student')
				)
			)
		);

		this.show();
	},


	showEditor: function() {
		this.editor.activate();
		Ext.defer(this.editor.focus, 350, this.editor);
		this.updateLayout();
	},


	updateFeedback: function(store) {
		var items = store.getRange();

		this.history.get('Feedback').set({
			Items: items
		});

		this.history.afterEdit(['feedback']);
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


	openEditorFor: function(record, el) {
		var me = this;


		el.select('.message,.footer').remove();
		Ext.destroy(me.editEditor);
		me.editEditor = Ext.widget('nti-editor', {
			ownerCt: this,
			renderTo: el.down('.wrap'),
			record: record,
			enableObjectControls: false, //lets not open too much complexity yet.
			listeners: {
				save: function(editor, record, value) {
					editor.mask(getString('NextThought.view.assessment.AssignmentFeedback.editor-mask'));
					if (!record) {
						console.error('No record!');
						return;
					}
					record.suspendEvents();
					record.set('body', value.body);
					record.save({
						callback: function(q, s, r) {
							record.resumeEvents();
							editor.unmask();
							if (!s) {
								alert({
									title: getString('NextThought.view.assessment.AssignmentFeedback.error-title'),
									msg: getString('NextThought.view.assessment.AssignmentFeedback.error-msg')
								});
								console.error('Failled to update feedback');
								return;
							}
							Ext.destroy(editor);

							try {
								var view = me.down('dataview');
								if (view) {
									view.refresh();
								}
							} catch (e) {
								console.error(e.message);
							}
						}
					});
				},
				'deactivated-editor': function() {
					var view = me.down('dataview');

					if (view) {
						view.refresh();
					}
				}
			}
		});

		me.editEditor.editBody(record.get('body'));

		me.editEditor.activate();
	},


	onFeedbackClick: function(s, record, item, index, e) {
		var c = record.get('Creator'),
			store = this.store;

		if ((e.getTarget('.avatar') || e.getTarget('.name')) && c && c.getProfileUrl) {
			this.fireEvent('show-profile', c);
		} else if (e.getTarget('.link.edit')) {
			this.openEditorFor(record, Ext.get(item));
		} else if (e.getTarget('.link.delete')) {
			record.destroy({callback: function() {
				store.load();
			}});
		}
	}
});
