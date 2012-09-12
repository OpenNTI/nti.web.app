Ext.define('NextThought.view.annotations.Redaction', {
	extend:'NextThought.view.annotations.Highlight',
	alias: 'widget.redaction',
	requires:[
		'NextThought.cache.IdCache'
	],

	redactionCls: 'redaction',
	cls: 'redacted',


    inlineTpl: new Ext.XTemplate(Ext.DomHelper.markup([
        {tag:'span', cls: 'inlineRedactionAction', cn: [
                {tag: 'span', cls: 'delimiter', html: '...'},
                {tag: 'span', cls: 'editableSpan', html: '{replacementContent}'},
                {tag: 'span', cls: 'controls', cn:[
                    {tag: 'span', cls: 'edit', title: 'edit'},
                    {tag: 'span', cls: 'share', title: 'share'},
                    {tag: 'span', cls: 'delete', title: 'delete'}
                ]},
                {tag: 'span', cls: 'delimiter', html: '...'}
            ]
        }])),


	constructor: function(){
		//TODO - this is a temporary measure to prevent anyone other than nextthought employees or the 2 law professors access to share a redaction,
		//       until permissioning of actions can be accomplished.
		this.allowShare = /(@nextthought\.com$)|(^stephen\.henderson@aya\.yale\.edu$)|(^thai@post\.harvard\.edu$)/.test($AppConfig.username);
		return this.callParent(arguments);
	},


	buildMenu: function(items){
		return; //disable menu in this case
	},


	makeEditableSpanEditable: function(e){
		console.log('make editable span editable');
		if (e){
			if (this.clickTimer){
				clearTimeout(this.clickTimer);
			}
			e.stopEvent();
		}

		//make the replacement content editable if it belongs to me.
		if (this.editableSpan && this.record.isModifiable()){
			this.editableSpan.dom.setAttribute('contenteditable', 'true');
			this.editableSpan.un('keydown', this.editableSpanEditorKeyDown, this);
			this.editableSpan.on('keydown', this.editableSpanEditorKeyDown, this);
			this.doc.parentWindow.getSelection().removeAllRanges();

            //select content in editable span
            var range = this.doc.createRange();
            range.selectNodeContents(this.editableSpan.dom);
			range.collapse(false);
			this.doc.parentWindow.getSelection().addRange(range);

			this.editableSpan.focus();
		}
		AnnotationsRenderer.suspend(this.prefix);
		return false;
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
				this.setupInlineSpanEvents();
			}
			else {
				this.actionSpan = this.createBlockActionHandle(this.rendered[0]).dom;
			}

			//add the redaction class and the click handlers for redacted spans:
			this.compElements.addCls(this.redactionCls);

			this.toggleRedaction();
		}

		console.log('rendering redaction, returning', y);

		return y;
	},


	getAlternateBoundingRect: function(){
		var b = Ext.fly(this.actionSpan).getBox();
		b.top = b.y;
		b.bottom = b.y + b.height;
		return b;
	},


	isInlineRedaction: function(){
		var replacementText = this.record.get('replacementContent');
		return Boolean(replacementText);
	},


	createActionHandle: function(before){
        this.masterSpan = this.inlineTpl.insertBefore(before, {
            replacementContent: this.record.get('replacementContent')
        }, true);

        this.editableSpan = this.masterSpan.down('.editableSpan');

        this.mon(this.editableSpan, {
            scope: this,
            blur: this.editableSpanBlur
        });
        this.mon(this.masterSpan.down('.controls'), 'click', this.onControlClick, this);
        return this.masterSpan;
	},


    onControlClick: function(e, span) {
        //stop event
        e.preventDefault();
        e.stopPropagation();

        //handle click
        if (Ext.fly(span).hasCls('edit')){
            console.log('edit');
            this.makeEditableSpanEditable();
        }
        else if (Ext.fly(span).hasCls('share')){
            console.log('share');
            this.ownerCmp.fireEvent('share-with',this.record);
        }
        else if (Ext.fly(span).hasCls('delete')){
            console.log('delete');
            this.remove();
        }

        return false; //for ie
    },


	setupInlineSpanEvents: function() {
		this.attachEvent('click', this.actionSpan, this.toggleRedaction, this);
	},


	editableSpanEditorKeyDown: function(event, span){
		var me = this, selection, range, cursorStart;
		function handledKey(){
			me.editableSpan.dom.removeAttribute('contenteditable');
			Ext.fly(span).blur();
			return false;
		}

		event.stopPropagation();
		var k = event.getKey();
		if(k === event.ESC){
			//return to orig:
			span.innerHTML = this.record.get('replacementContent');
			AnnotationsRenderer.resume(this.prefix);
			return handledKey();
		}
		else if(k === event.ENTER){
			this.record.set('replacementContent', span.textContent);
			this.record.save();
			AnnotationsRenderer.resume(this.prefix);
			return handledKey();
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
	},


	editableSpanBlur: function(event, span){
		var me = this;

		event.stopEvent();
		span.innerHTML = this.record.get('replacementContent');
		me.editableSpan.dom.removeAttribute('contenteditable');
		AnnotationsRenderer.resume(this.prefix);

		return false;
	},


	createBlockActionHandle: function(before){
		var masterSpan = Ext.get(this.createNonAnchorableSpan());

		masterSpan.update('&nbsp;');
		masterSpan.addCls('blockRedactionAction');
		masterSpan.insertBefore(before);
		//masterSpan.on('click', this.toggleRedaction, this);
		return masterSpan;
	},


	cleanup: function(){
		try{
			if (this.actionSpan){Ext.get(this.actionSpan).remove();}
			if (this.controlDiv){this.controlDiv.remove();}
		}
		catch(e){
			console.log(Globals.getError(e));
		}
		this.callParent(arguments);
	},


	toggleRedaction: function(){
		//toggle redaction on generated spans:
		this.compElements.toggleCls(this.cls);

		if(this.canvas){Ext.fly(this.canvas).toggle();}
		if(this.masterSpan){this.masterSpan.toggleCls(this.cls);}

		this.requestRender();
		return false;
	},


	getControl: function(){
		//We only want a control if its a block annotation:
		if (this.isInlineRedaction()){
			return undefined;
		}

		if (!this.controlDiv){
			this.controlDiv = Ext.get(this.doc.createElement('div'));
			this.controlDiv.update('<img src="'+Ext.BLANK_IMAGE_URL+'"/>');
			this.controlDiv.addCls('redaction-control');
			this.mon(this.controlDiv,{
				scope: this,
				click: this.toggleRedaction
			});
		}

		return this.controlDiv;
	}


	//no gutter widget for redactions, no need to do this
	//getGutterWidget: function(numberOfSiblings){}
});
