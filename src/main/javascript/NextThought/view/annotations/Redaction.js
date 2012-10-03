Ext.define('NextThought.view.annotations.Redaction', {
	extend  :'NextThought.view.annotations.Highlight',
	alias   :'widget.redaction',
	requires:[
		'NextThought.cache.IdCache'
	],

	redactionCls:'redaction',
	cls         :'redacted',


	constructor:function () {
		this.callParent(arguments);

		//TODO - this is a temporary measure to prevent anyone other than nextthought employees or the 2 law professors access to share a redaction,
		//       until permissioning of actions can be accomplished.
		this.allowShare = /(@nextthought\.com$)|(^stephen\.henderson@aya\.yale\.edu$)|(^thai@post\.harvard\.edu$)/.test($AppConfig.username);
		if (!this.allowShare) {
			this.record.set('sharedWith', []);
		}

		return this;
	},


	buildMenu:function (items) {
		var me = this;

		items.push({
			text   :'Toggle Redaction',
			handler:function () {
				me.toggleRedaction();
			}
		});
		return this.callParent([items]);
	},


	makeEditableSpanEditable:function (e) {
		e.stopEvent();
		var s = this.editableSpan, range, save = this.masterSpan.down('.edit'), sel = this.doc.parentWindow.getSelection();

		if (!s || !this.record.isModifiable()) {
			return false;
		}

		this.masterSpan.addCls('editing');
		save.addCls('save');

		s.clearListeners();
		s.set({'contenteditable':'true'}).on('keydown', this.editableSpanEditorKeyDown, this);
		s.focus();

		if (s.getHTML() === NextThought.model.Redaction.DEFAULT_TEXT) {
			s.update('***');
		}

		//select content in editable span
		range = this.doc.createRange();
		range.selectNodeContents(s.dom);
		sel.removeAllRanges();
		sel.addRange(range);

		AnnotationsRenderer.suspend(this.prefix);
		return false;
	},


	makeEditableSpanNotEditable:function () {
		var s = this.editableSpan, save = this.masterSpan.down('.edit');
		if (!s || !this.record.isModifiable()) {
			return;
		}

		this.masterSpan.removeCls('editing');
		save.removeCls('save');

		s.clearListeners();
		s.set({'contenteditable':undefined});
	},


	render:function () {

		var y = this.callParent(arguments), isBlock = this.isBlockRedaction();

		if (this.actionSpan) {
			return this.actionSpan.getBoundingClientRect().top || this.rendered[0].getBoundingClientRect().top || y;
		}

		if (this.rendered) {
			//Add the redaction action span so the user has something to click on
			this.actionSpan = this.createActionHandle(this.rendered[0], isBlock);
			if (isBlock) {
				this.insertFooter(this.rendered.last());
			}

			//add the redaction class and the click handlers for redacted spans:
			this.compElements.addCls(this.redactionCls);

			this.toggleRedaction();
		}

		return y;
	},


	visibilityChanged:function (show) {
		if (this.actionSpan) {
			Ext.fly(this.actionSpan).setVisibilityMode(Ext.dom.Element.DISPLAY);
			Ext.fly(this.actionSpan)[show ? 'show' : 'hide']();
		}
		return this.callParent(arguments);
	},


	isBlockRedaction:function () {
		return Boolean(this.record.get('redactionExplanation'));
		//kind of hacky... as soon as you blank out this field, the redaction will become "inline" and there is no way
		// to go back, nor is this obvious. TODO: expose a "style" much like highlights/notes. (I'm actually surprised
		// style wasn't accepted already)
	},


	createActionHandle:function (before, block) {
		this.masterSpan = this.actionTpl.insertBefore(before, {
			replacementContent:this.record.get('replacementContent'),
			block             :Boolean(block),
			style             :block ? 'block' : 'inline'
		}, true);

		this.mon(this.masterSpan, {
			scope    :this,
			'click'  :this.onControlClick,
			'mouseup':function (e) {
				e.stopEvent();
				return false;
			}
		});

		this.editableSpan = this.masterSpan.down('.editableSpan');

		this.mon(this.masterSpan, 'click', this.onClick, this);

		if (!this.allowShare) {
			this.masterSpan.down('.share').remove();
		}

		if (!this.record.isModifiable()) {
			this.masterSpan.down('.controls').remove();
		}

		return this.masterSpan.dom;
	},


	insertFooter:function (after) {

	},


	onClick:function () {
	},


	onControlClick:function (e) {
		//stop event
		e.stopEvent();

		//handle click
		if (e.getTarget('.edit')) {
			if (!e.getTarget('.save')) {
				this.makeEditableSpanEditable(e);
			} else {
				this.saveEditorContent();
			}
		} else if (e.getTarget('.share')) {
			if (this.allowShare) {
				this.ownerCmp.fireEvent('share-with', this.record);
			}
		} else if (e.getTarget('.delete')) {
			this.remove();
		} else if (!this.editableSpan.dom.hasAttribute('contenteditable')) {
			this.toggleRedaction(e);
		}

		return false; //for ie
	},


	saveEditorContent:function () {
		this.makeEditableSpanNotEditable();
		this.record.set('replacementContent', this.editableSpan.dom.textContent);
		this.record.save();
		AnnotationsRenderer.resume(this.prefix);
	},


	resetEditorContent:function () {
		this.makeEditableSpanNotEditable();
		this.editableSpan.update(this.record.get('replacementContent'));
		AnnotationsRenderer.resume(this.prefix);
	},


	editableSpanEditorKeyDown:function (e, span) {
		var k = e.getKey();


		e.stopPropagation();


		if (k === e.ESC) {
			this.resetEditorContent();
		} else if (k === e.ENTER) {
			this.saveEditorContent();
		} else if (k === e.BACKSPACE) {

			if (this.editableSpan.dom.innerHTML === '') {
				e.stopEvent();
				return false;
			}
		}

		return true;
	},


	cleanup:function () {
		try {
			if (this.actionSpan) {
				Ext.fly(this.actionSpan).remove();
			}
		} catch (e) {
			console.warn(Globals.getError(e));
		}
		this.callParent(arguments);
	},


	toggleRedaction:function (e) {
		//toggle redaction on generated spans:
		this.compElements.toggleCls(this.cls);

		if (this.canvas) {
			Ext.fly(this.canvas).toggle();
		}
		if (this.masterSpan) {
			this.masterSpan.toggleCls(this.cls);
		}

		this.requestRender();

		if (e) {
			e.stopEvent();
		}
		return false;
	}

}, function () {

	var p = this.prototype, tpl = {tag:'span', 'data-non-anchorable':'true', cls:'redactionAction {style}', cn:[
			{tag:'span', cls:'editableSpan', html:'{replacementContent}'},
			{tag:'span', cls:'controls', cn:[
				{tag:'span', cls:'edit', title:'edit'},
				{tag:'span', cls:'share', title:'share'},
				{tag:'span', cls:'delete', title:'delete'}
			]}
		]};

	p.actionTpl = new Ext.XTemplate(Ext.DomHelper.markup([
		{tag:'tpl', 'if':'block', cn:[
			{tag:'span', cls:'block-redaction head', 'data-non-anchorable':true, cn:[Ext.clone(tpl)]}
		]},
		{tag:'tpl', 'if':'!block', cn:[ tpl ]}
	]));


});
