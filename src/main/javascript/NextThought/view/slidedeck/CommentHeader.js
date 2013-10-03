Ext.define('NextThought.view.slidedeck.CommentHeader', {
	extend: 'Ext.Component',
	alias: 'widget.slide-comment-header',

	ui: 'slide',
	cls: 'comment-header',

	requires: [
		'NextThought.editor.Editor'
	],

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'comment',
			cn: [{
				cls: 'count',
				cn: [
					{tag: 'span', html: '{count}'}
				]
			},{
				cls: 'input',
				html: 'Write a comment'
			}]
		},
		{cls: 'respondBox'}
	]),

	renderSelectors: {
		comment: '.comment',
		count: '.comment .count span',
		respondBox: '.respondBox'
	},


	initComponent: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {},{
			count: Ext.util.Format.plural(this.count || 0, 'Comment', 'Comments')
		});
	},


	afterRender: function() {
		var me = this;
		me.callParent(arguments);

		me.editor = Ext.widget('nti-editor', {ownerCt: this, enableShareControls: true, renderTo: me.respondBox, enableTitle: true });
		//TODO: clean this up! We should be relying on the editor's events, not digging into its dom.
		me.editorEl = me.editor.getEl();
		me.comment.setVisibilityMode(Ext.dom.Element.DISPLAY);
		me.mon(me.comment, 'click', me.activateEditor, me);

		me.mon(me.editorEl.down('.cancel'), { scope: me, click: me.deactivateEditor });
		me.mon(me.editorEl.down('.save'), { scope: me, click: me.editorSaved });

		me.mon(me.editorEl.down('.content'), {
			scope: me,
			keypress: me.editorKeyPressed,
			keydown: me.editorKeyDown
		});

		console.log(this.count.getHTML());
		if (parseInt(this.count.getHTML(), 10) > 0) {
			this.comment.addCls('has-count');
		}
	},


	updateCount: function(c) {
		if (!this.rendered) {
			return;
		}
		this.comment[c > 0 ? 'addCls' : 'removeCls']('has-count');
		this.count.update(Ext.util.Format.plural(c, 'Comment', 'Comments'));
	},


	getRoot: function() {
		var r = this.rootCache || this.up('slidedeck-slide');
		if (!this.rootCache) { this.rootCache = r; }
		return r;
	},


	activateEditor: function() {
		var me = this;
		if (me.getRoot().checkAndMarkAsActive(this)) {
			me.comment.hide();
			me.editor.activate();
			setTimeout(function() {
				me.editor.focus(true);
				me.el.scrollIntoView(me.el.up('.x-container-slide'));
			}, 300);
		}
	},


	deactivateEditor: function(e) {
		if (e) {e.stopEvent();}
		if (this.getRoot().editorActive()) {
			this.editor.deactivate();
			this.editor.reset();
			this.editor.setValue('');
			this.comment.show();
			this.getRoot().setEditorActive(null);
			this.editor.clearError();
		}
		return false;
	},


	editorSaved: function(e) {
		e.stopEvent();

		function callback(success, record) {
			me.editorEl.unmask();
			if (success) {
				me.deactivateEditor();
			}
		}

		function onError(error) {
			console.error('Error saving note - ' + (error ? Globals.getError(error) : ''));
      alert('There was an error saving your note.');
      me.editorEl.unmask();
		}

		var me = this,
			re = /((&nbsp;)|(\u200B)|(<br\/?>)|(<\/?div>))*/g,
			style = 'suppressed',
			v = me.editor.getValue(),
			note = v.body,
			title = v.title,
			sharing = [],
			range,
			container = me.slide.get('ContainerId'),
			dom = me.slide.get('dom-clone'), img;

		if (v.sharingInfo) {
			sharing = SharingUtils.sharedWithForSharingInfo(v.sharingInfo);
		}

		//Avoid saving empty notes or just returns.
		if (!Ext.isArray(note) || note.join('').replace(re, '') === '') {
			me.editor.markError(me.editor.el.down('.content'), 'Please enter text before you save');
			return false;
		}

		img = dom.querySelector('img');

		if (!img) {
			onError();
			return false;
		}

		range = dom.ownerDocument.createRange();
		range.selectNode(img);

		me.editorEl.mask('Saving...');
    try {
		    me.fireEvent('save-new-note', title, note, range, container, sharing, style, callback);
    }
    catch (error) {
      onError(error);
    }
		return false;
	},


	editorKeyDown: function(event) {
		event.stopPropagation();
		var k = event.getKey();
		if (k === event.ESC) {
			this.deactivateEditor();
		}
	},


	onDestroy: function() {
		if (this.editor) {
			this.editor.destroy();
		}
		this.callParent(arguments);
	},


	editorKeyPressed: function(event) {
		event.stopPropagation();
	}

});
