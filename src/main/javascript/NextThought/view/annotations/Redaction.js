Ext.define('NextThought.view.annotations.Redaction', {
	extend:'NextThought.view.annotations.Highlight',
	alias: 'widget.redaction',
	requires:[
		'NextThought.cache.IdCache'
	],

	redactionCls: 'redaction',
	cls: 'redacted',


	buildMenu: function(items){
		var me = this;

		items.push({
			text : 'Redact',
			handler: function(){
				me.toggleRedaction();
			}
		});

		return this.callParent([items]);
	},


	render: function(){
		this.callParent(arguments);

		if (this.actionSpan){return;}

		//Add the redaction action span so the user has something to click on
		var replacementText = this.record.get('replacementContent');
		if (replacementText) {
			this.actionSpan = this.createActionHandle(this.rendered[0], replacementText);
		}
		else {
			this.actionSpan = this.createBlockActionHandle(this.rendered[0], replacementText);
		}

		//add the redaction class and the click handlers for redacted spans:
		this.compElements.addCls(this.redactionCls);

		this.compElements.add([this.actionSpan]);
		this.toggleRedaction();
	},


	createActionHandle: function(before, text){
		var masterSpan = Ext.get(this.createNonAnchorableSpan()),
			startDelimiter = Ext.get(this.createNonAnchorableSpan()),
			endDelimiter = Ext.get(this.createNonAnchorableSpan()),
			replacementTextSpan = Ext.get(this.doc.createElement('span')),
			replacementTextNode = this.doc.createTextNode(text),
			openingEllipsesSpan = Ext.get(this.doc.createElement('span')),
			openingEllipsesTextNode = this.doc.createTextNode('...'),
			endingEllipsesSpan = Ext.get(this.doc.createElement('span')),
			endingEllipsesTextNode = this.doc.createTextNode('...');

		//add texts:
		startDelimiter.update('&nbsp');
		endDelimiter.update('&nbsp');
		openingEllipsesSpan.dom.appendChild(openingEllipsesTextNode);
		endingEllipsesSpan.dom.appendChild(endingEllipsesTextNode);
		replacementTextSpan.dom.appendChild(replacementTextNode);

		//create the tree:
		masterSpan.insertFirst(openingEllipsesSpan);
		masterSpan.insertFirst(endDelimiter);
		masterSpan.insertFirst(replacementTextSpan);
		masterSpan.insertFirst(startDelimiter);
		masterSpan.insertFirst(endingEllipsesSpan);

		masterSpan.addCls('redactionAction');
		openingEllipsesSpan.addCls('redactionEllipses');
		endingEllipsesSpan.addCls('redactionEllipses');
		endDelimiter.addCls('redactionDelimiter');
		startDelimiter.addCls('redactionDelimiter');
		replacementTextSpan.addCls('redactionReplacementText');
		masterSpan.insertBefore(before);
		//masterSpan.on('click', this.toggleRedaction, this);

		//make the replacement content editable if it belongs to me.
		if (this.record.isModifiable()){
			replacementTextSpan.dom.setAttribute('contenteditable', 'true');
			replacementTextSpan.on('keydown', this.editableSpanEditorKeyDown, this);
		}

		return masterSpan;
	},


	editableSpanEditorKeyDown: function(event, span){
		event.stopPropagation();
		var k = event.getKey();
		if(k === event.ESC){
			//return to orig:
			span.innerHTML = this.record.get('replacementContent');
			Ext.fly(span).blur();
			return false;
		}
		else if(k === event.ENTER){
			this.record.set('replacementContent', span.innerHTML);
			this.record.save();
			Ext.fly(span).blur();
			event.stopEvent();
			return false;
		}
	},


	createBlockActionHandle: function(before, text){
		var masterSpan = Ext.get(this.createNonAnchorableSpan());

		masterSpan.update('&nbsp;');
		masterSpan.addCls('blockRedactionAction');
		masterSpan.insertBefore(before);
		//masterSpan.on('click', this.toggleRedaction, this);
		return masterSpan;
	},


	cleanup: function(){
		if (this.actionSpan){this.actionSpan.remove();}
		this.callParent(arguments);
	},


	toggleRedaction: function(){
		//toggle redaction on generated spans:
		this.compElements.toggleCls(this.cls);
		Ext.fly(this.canvas).toggle();
	}
});
