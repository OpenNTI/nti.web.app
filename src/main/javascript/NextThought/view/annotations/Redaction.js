Ext.define('NextThought.view.annotations.Redaction', {
	extend:'NextThought.view.annotations.Highlight',
	alias: 'widget.redaction',
	requires:[
		'NextThought.cache.IdCache'
	],

	redactionCls: 'redaction',
	cls: 'redacted',


	inlineTpl: Ext.DomHelper.createTemplate([
		{tag:'span', cls: 'inlineRedactionAction', cn: [
			{tag: 'span', cls: 'delimiter'},
			{tag: 'span', cls: 'editableSpan', html: '{replacementContent}'},
			{tag: 'span', cls: 'controls', cn:[
				{tag: 'span', cls: 'edit', title: 'edit'},
				{tag: 'span', cls: 'share', title: 'share'},
				{tag: 'span', cls: 'delete', title: 'delete'}
			]},
			{tag: 'span', cls: 'delimiter'}
		]
		}]).compile(),


	constructor: function(){
		this.callParent(arguments);

		//TODO - this is a temporary measure to prevent anyone other than nextthought employees or the 2 law professors access to share a redaction,
		//       until permissioning of actions can be accomplished.
		this.allowShare = /(@nextthought\.com$)|(^stephen\.henderson@aya\.yale\.edu$)|(^thai@post\.harvard\.edu$)/.test($AppConfig.username);

		return this;
	},


	buildMenu: function(items){
		var me = this;

		items.push({
			text : 'Toggle Redaction',
			handler: function(){
				me.toggleRedaction();
			}
		});
		return this.callParent([items]);
	},


	makeEditableSpanEditable: function(e){
		e.stopEvent();
		var s = this.editableSpan, range, save = this.masterSpan.down('.edit'),
				sel = this.doc.parentWindow.getSelection();

		if (!s || !this.record.isModifiable()){
			return false;
		}

		this.masterSpan.addCls('editing');
		save.addCls('save');

		s.clearListeners();
		s.set({'contenteditable':'true'}).on('keydown', this.editableSpanEditorKeyDown, this);
		s.focus();

		if(s.getHTML()===NextThought.model.Redaction.DEFAULT_TEXT){
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



	makeEditableSpanNotEditable: function(){
		var s = this.editableSpan, save = this.masterSpan.down('.edit');
		if (!s || !this.record.isModifiable()){
			return;
		}

		this.masterSpan.removeCls('editing');
		save.removeCls('save');

		s.clearListeners();
		s.set({'contenteditable':undefined});
	},


	render: function(){
		var y = this.callParent(arguments);

		if (this.actionSpan){
			return this.actionSpan.getBoundingClientRect().top || this.rendered.first().getBoundingClientRect().top || y;
		}

		if(this.rendered){
			//Add the redaction action span so the user has something to click on
			if (this.isInlineRedaction()) {
				this.actionSpan = this.createActionHandle(this.rendered[0]).dom;
			}
			else {
				this.actionSpan = this.createBlockActionHandle(this.rendered[0]).dom;
			}

			//add the redaction class and the click handlers for redacted spans:
			this.compElements.addCls(this.redactionCls);

			this.toggleRedaction();
		}

		return y;
	},


	visibilityChanged: function(show){
		if(this.actionSpan){
			Ext.fly(this.actionSpan).setVisibilityMode(Ext.dom.Element.DISPLAY);
			Ext.fly(this.actionSpan)[show?'show':'hide']();
		}
		return this.callParent(arguments);
	},


//	getAlternateBoundingRect: function(){
//		var b = Ext.fly(this.actionSpan).getBox();
//		b.top = b.y;
//		b.bottom = b.y + b.height;
//		return b;
//	},


	isInlineRedaction: function(){
		var replacementText = this.record.get('replacementContent');
		return Boolean(replacementText);
	},


	createActionHandle: function(before){
		this.masterSpan = this.inlineTpl.insertBefore(before, {
			replacementContent: this.record.get('replacementContent')
		}, true);

		this.mon(this.masterSpan,{
			scope: this,
			'click':this.onControlClick,
			'mouseup': function(e){e.stopEvent();return false;}
		});

		this.editableSpan = this.masterSpan.down('.editableSpan');

		this.mon(this.masterSpan, 'click', this.onClick, this);

		if(!this.allowShare){
			this.masterSpan.down('.share').remove();
		}

		if (!this.record.isModifiable()){
			this.masterSpan.down('.controls').remove();
		}

		return this.masterSpan;
	},


	onClick: function(e){
		if(this.isInlineRedaction()){
			return undefined;
		}

		return this.callParent(arguments);
	},


	onControlClick: function(e) {
		//stop event
		e.stopEvent();

		//handle click
		if (e.getTarget('.edit')){
			if(!e.getTarget('.save')){
				this.makeEditableSpanEditable(e);
			}
			else {
				this.saveEditorContent();
			}
		}
		else if (e.getTarget('.share')){
			if(this.allowShare){
				this.ownerCmp.fireEvent('share-with',this.record);
			}
		}
		else if (e.getTarget('.delete')){
			this.remove();
		}
		else if(!this.editableSpan.dom.hasAttribute('contenteditable')){
			this.toggleRedaction(e);
		}

		return false; //for ie
	},


	saveEditorContent: function(){
		this.makeEditableSpanNotEditable();
		this.record.set('replacementContent', this.editableSpan.dom.textContent);
		this.record.save();
		AnnotationsRenderer.resume(this.prefix);
	},

	resetEditorContent: function(){
		this.makeEditableSpanNotEditable();
		this.editableSpan.update( this.record.get('replacementContent') );
		AnnotationsRenderer.resume(this.prefix);
	},


	editableSpanEditorKeyDown: function(event, span){
		var selection, range, cursorStart, rangeContainer,
				k = event.getKey();


		event.stopPropagation();


		if(k === event.ESC){
			this.resetEditorContent();
		}
		else if(k === event.ENTER){
			this.saveEditorContent();
		}
		else if (k === event.BACKSPACE) {
			event.stopEvent();
			selection = this.doc.parentWindow.getSelection();
			range = selection.getRangeAt(0);
			rangeContainer = range.startContainer;
			cursorStart = range.startOffset;
			if (!(range.collapsed)) {
				range.deleteContents();
			}
			else if(cursorStart > 0) {
				span.firstChild.data = span.firstChild.data.substring(0,cursorStart - 1) + span.firstChild.data.substring(cursorStart);
				range.setEnd(rangeContainer,cursorStart - 1);
				range.setStart(rangeContainer,cursorStart - 1);
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}

		return false;
	},


	createBlockActionHandle: function(before){
		this.masterSpan = Ext.get(this.createNonAnchorableSpan());

		this.masterSpan.update('&nbsp;');
		this.masterSpan.addCls('blockRedactionAction');
		this.masterSpan.insertBefore(before);
		//masterSpan.on('click', this.toggleRedaction, this);
		return this.masterSpan;
	},


	cleanup: function(){
		try{
			if (this.actionSpan){Ext.fly(this.actionSpan).remove();}
		}
		catch(e){
			console.warn(Globals.getError(e));
		}
		this.callParent(arguments);
	},


	toggleRedaction: function(e){
		//toggle redaction on generated spans:
		this.compElements.toggleCls(this.cls);

		if(this.canvas){Ext.fly(this.canvas).toggle();}
		if(this.masterSpan){this.masterSpan.toggleCls(this.cls);}

		this.requestRender();

		if( e ){
			e.stopEvent();
		}
		return false;
	}

});
