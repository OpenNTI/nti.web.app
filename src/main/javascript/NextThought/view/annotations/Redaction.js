Ext.define('NextThought.view.annotations.Redaction', {
	extend:'NextThought.view.annotations.Highlight',
	alias: 'widget.redaction',
	requires:[
		'NextThought.cache.IdCache'
	],

	redactionCls: 'redaction',
	cls: 'redacted',

	constructor: function(){
		//TODO - this is a temporary measure to prevent anyone other than nextthought employees or the 2 law professors access to share a redaction,
		//       until permissioning of actions can be accomplished.
		this.allowShare = /(@nextthought\.com$)|(^stephen\.henderson@aya\.yale\.edu$)|(^thai@post\.harvard\.edu$)/.test($AppConfig.username);
		return this.callParent(arguments);
	},


	//Nibs and controls for reference later:
	/*
	actionSpan: null,
	controlDiv: null,
	editableSpan: null,
	*/

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
			this.editableSpan.on('keydown', this.editableSpanEditorKeyDown, this);
			this.doc.parentWindow.getSelection().removeAllRanges();
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

		//Make this look like the template structure instead...
		var me = this,
			masterSpan = Ext.get(this.createNonAnchorableSpan()),
			startDelimiter = Ext.get(this.createNonAnchorableSpan()),
			endDelimiter = Ext.get(this.createNonAnchorableSpan()),
			replacementTextNode = this.doc.createTextNode(this.record.get('replacementContent')),
			openingEllipsesSpan = Ext.get(this.doc.createElement('span')),
			openingEllipsesTextNode = this.doc.createTextNode('...'),
			endingEllipsesSpan = Ext.get(this.doc.createElement('span')),
			endingEllipsesTextNode = this.doc.createTextNode('...');

		this.editableSpan = Ext.get(this.doc.createElement('span'));

		//add texts:
		startDelimiter.update('&nbsp');
		endDelimiter.update('&nbsp');
		openingEllipsesSpan.dom.appendChild(openingEllipsesTextNode);
		endingEllipsesSpan.dom.appendChild(endingEllipsesTextNode);
		this.editableSpan.dom.appendChild(replacementTextNode);

		//create the tree:
		masterSpan.insertFirst(openingEllipsesSpan);
		masterSpan.insertFirst(endDelimiter);
		masterSpan.insertFirst(this.editableSpan);
		masterSpan.insertFirst(startDelimiter);
		masterSpan.insertFirst(endingEllipsesSpan);

		masterSpan.addCls('redactionAction');
		openingEllipsesSpan.addCls('redactionEllipses');
		endingEllipsesSpan.addCls('redactionEllipses');
		endDelimiter.addCls('redactionDelimiter');
		startDelimiter.addCls('redactionDelimiter');
		this.editableSpan.addCls('redactionReplacementText');
		masterSpan.insertBefore(before);

		this.mon(this.editableSpan, {
			scope: this,
			blur: this.editableSpanBlur
		});

		return masterSpan;
	},

	setupInlineSpanEvents: function() {
		var me = this;

		//set up any events:
		me.attachEvent('click', this.actionSpan,
			function(e){
				if (me.clickTimer){clearTimeout(me.clickTimer);}
				console.log(this.actionSpan.ownerDocument.activeElement, this.actionSpan);
				if (this.actionSpan.ownerDocument.activeElement !== this.actionSpan.querySelector('.redactionReplacementText')) {
					console.log('400ms to go!');
					me.clickTimer = setTimeout(function(){
						me.onClick(e);
					}, 400);
				}
			},
			me);

		this.attachEvent('dblclick', this.actionSpan, this.makeEditableSpanEditable, this);
		me.mon(Ext.get(this.actionSpan), {
			scope: this,
			mouseup: function(e){
				e.stopEvent();
				return false;
			}
		});
	},

	/*
	inlineClick: function(event, cmp, opts){
		if (this.editableSpan.getAttribute('contenteditable')) {
			console.log('inline redaction currently being edited, ignoring clicks');
			return;
		}

		event.stopEvent();
		if (event.button === 0){
			//left mouse button
			this.toggleRedaction();
		}
		else if (event.button === 2){
			this.onClick(event);
		}

		return false;
	},
	*/

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
			console.log(selection);
			range = selection.getRangeAt(0);
			cursorStart = range.startOffset;
			if (!(range.collapsed)) {
				range.deleteContents();
			}
			else {
				console.log(range);
				span.firstChild.data = span.firstChild.data.substring(0,cursorStart - 1) + span.firstChild.data.substring(cursorStart);
				console.log(range);
				range.setEnd(range.startContainer,cursorStart - 1);
				range.setStart(range.startContainer,cursorStart - 1);
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}
	},


	editableSpanBlur: function(event, span){
		var me = this;

		event.stopEvent();
		this.record.set('replacementContent', span.innerHTML.replace(/<.*?>/,''));//just the text, not the formatting
		this.record.save();
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
		Ext.get(this.actionSpan).toggleCls(this.cls);
		if (this.canvas){Ext.fly(this.canvas).toggle();}
		if (this.controlDiv){this.controlDiv.toggleCls(this.cls);}

		this.requestRender();
		//if action span is toggled back on and it's inline, make sure it has events:
		/*
		var actionSpan = Ext.fly(this.actionSpan);
		if(actionSpan.hasCls(this.cls) && actionSpan.hasCls('redactionAction')) {
			this.setupInlineSpanEvents(actionSpan);
		}
		else {
			this.on('click', this.onClick, this);
		}
*/
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
