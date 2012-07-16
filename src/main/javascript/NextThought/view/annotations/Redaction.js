Ext.define('NextThought.view.annotations.Redaction', {
	extend:'NextThought.view.annotations.Highlight',
	alias: 'widget.redaction',
	requires:[
		'NextThought.cache.IdCache'
	],

	redactionCls: 'redaction',
	cls: 'redacted',

	//Nibs and controls for reference later:
	actionSpan: null,
	controlDiv: null,
	editableSpan: null,

	buildMenu: function(items){
		var me = this;

		items.push({
			text : 'Toggle Redaction',
			handler: function(){
				me.toggleRedaction();
			}
		});

		//allow edit of content only if this is inline and it's not currently expanded:
		if (this.isInlineRedaction() && this.actionSpan.hasCls(this.cls)){
			items.push({
				text : 'Edit Redaction Content',
				handler: function(menuitem, event){
					me.makeEditableSpanEditable();
				}
			});
		}

		return this.callParent([items]);
	},


	makeEditableSpanEditable: function(){
		//make the replacement content editable if it belongs to me.
		if (this.editableSpan && this.record.isModifiable()){
			this.editableSpan.dom.setAttribute('contenteditable', 'true');
			this.editableSpan.on('keydown', this.editableSpanEditorKeyDown, this);
			this.editableSpan.focus();
		}
	},


	render: function(){
		var y = this.callParent(arguments);

		if (this.actionSpan){return y;}

		//Add the redaction action span so the user has something to click on
		if (this.isInlineRedaction()) {
			this.actionSpan = this.createActionHandle(this.rendered[0]);
		}
		else {
			this.actionSpan = this.createBlockActionHandle(this.rendered[0]);
		}

		//add the redaction class and the click handlers for redacted spans:
		this.compElements.addCls(this.redactionCls);

		this.compElements.add([this.actionSpan]);
		this.toggleRedaction();
		return y;
	},


	isInlineRedaction: function(){
		var replacementText = this.record.get('replacementContent');
		if (replacementText){return true;}
		return false;
	},


	createActionHandle: function(before){
		var masterSpan = Ext.get(this.createNonAnchorableSpan()),
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

		//set up any events:
		this.mon(masterSpan, {
			scope: this,
			mouseup: this.inlineClick
		});

		return masterSpan;
	},


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


	editableSpanEditorKeyDown: function(event, span){
		var me = this;
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
			return handledKey();
		}
		else if(k === event.ENTER){
			this.record.set('replacementContent', span.innerText);//just the text, not the formatting
			this.record.save();
			return handledKey();
		}
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
			if (this.actionSpan){this.actionSpan.remove();}
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
		Ext.fly(this.canvas).toggle();
		if (this.controlDiv){this.controlDiv.toggleCls(this.cls);}
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
