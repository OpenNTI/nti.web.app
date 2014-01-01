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
			autoEl: { cn:[
				{ tag: 'h1', html: 'Feedback' },
				{ cls: 'message' }
			]},
			renderSelectors:{
				messageEl: '.message'
			}
		},
		{
			xtype: 'dataview',
			itemSelector: 'feedback-item',
			tpl: Ext.DomHelper.markup([
				{tag: 'tpl', 'for':'.', cn:[

				]}
			])
		},
		{
			xtype: 'box',
			ui: 'comment-box',
			name: 'comment',
			autoEl: { cn: [
				{cls:'editor-box'}
			]},
			renderSelectors:{
				feedbackBox: '.editor-box'
			}
		}
	],

	
	afterRender: function(){
		this.callParent(arguments);

		var commentBox;

		this.comment = this.down('box[name=comment]');

		commentBox = this.comment.feedbackBox;

		if (this.history) {
			this.setHistory(this.history);
		}
		
		this.fireEvent('has-been-submitted', this);

		this.mon(commentBox,{
			'click': 'showEditor'
		});

		this.editor = Ext.widget('nti-editor', {ownerCt: this, renderTo: this.comment.feedbackBox});
	
		this.mon(this.editor,{
			'activated-editor': function(){
				commentBox.addCls('editor-active');
			},
			'deactivated-editor': function(){
				commentBox.removeCls('editor-active');
			},
			'save': 'addFeedback',
			'no-body-content': function(editor, el) {
				editor.markError(el, 'You need to type something');
				return false;
			}
		})
	},


	addFeedback: function(editor){
		var text = editor.getValue().body,
			feedback = this.history.get('Feedback');

		Service.request({
			url: feedback.get('href'),
			method: 'POST',
			jsonData: {
				body: text
			}
		}).done(function(){
			console.log('Saved feedback');
		}).fail(function(reason){
			console.error('faild to save feedback', reason);
		});

	},


	setHistory: function(history){
		if(!history || !history.get('Feedback')){ 
			this.hide();
			return;
		}
		
		var s = 'The comments below will only be visible to you and your {0}.',
			header = this.down('box[name=title]');

		header.messageEl.update(Ext.String.format(s, (isMe(history.get('Creator'))? 'instructor' : 'student')));

		this.show();
	},

	showEditor: function(){
		this.editor.activate();
		this.updateLayout();
	}

});
