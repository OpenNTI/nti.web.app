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
		this.actionSpan = this.createActionHandle(this.rendered[0], this.record.get('replacementText'));

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
		masterSpan.on('click', this.toggleRedaction, this);
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
