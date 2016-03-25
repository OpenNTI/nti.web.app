var Ext = require('extjs');
var Globals = require('../../util/Globals');
var AnnotationsHighlight = require('./Highlight');
var CacheIdCache = require('../../cache/IdCache');


module.exports = exports = Ext.define('NextThought.app.annotations.Redaction', {
	extend: 'NextThought.app.annotations.Highlight',
	alias: 'widget.redaction',
	redactionCls: 'redaction',
	cls: 'redacted',

	constructor: function (config) {
		var r = config && config.record;
		if (r && r.phantom) {
			this.record = r;
			return;
		}

		this.callParent(arguments);


		this.allowShare = Service.canShareRedaction();
		if (!this.allowShare) {
			this.record.set('sharedWith', []);
		}
	},

	buildMenu: function (items) {
		var me = this;

		items.push({
			text: getString('NextThought.view.annotations.Redaction.toggle'),
			handler: function () {
				me.toggleRedaction();
			}
		});
		return this.callParent([items]);
	},

	makeEditableSpanEditable: function (e) {
		e.stopEvent();
		var s = this.editableSpan, range, save = this.masterSpan.down('.edit'),
			sel = this.doc.parentWindow.getSelection();

		if (!s || !this.record.isModifiable()) {
			return false;
		}

		this.masterSpan.addCls('editing');
		save.addCls('save');

		s.clearListeners();
		s.set({'contenteditable': 'true'}).on('keydown', this.editableSpanEditorKeyDown, this);
		s.focus();

		if (s.getHTML() === NextThought.model.Redaction.DEFAULT_TEXT) {
			s.update('***');
		}

		//select content in editable span
		range = this.doc.createRange();
		range.selectNodeContents(s.dom);
		sel.removeAllRanges();
		sel.addRange(range);

		this.manager.suspend(this.prefix);
		return false;
	},

	makeEditableSpanNotEditable: function () {
		var s = this.editableSpan, save = this.masterSpan.down('.edit');
		if (!s || !this.record.isModifiable()) {
			return;
		}

		this.masterSpan.removeCls('editing');
		save.removeCls('save');

		s.clearListeners();
		s.set({'contenteditable': undefined});
	},

	render: function () {
		var y = this.callParent(arguments),
			isBlock = this.isBlockRedaction();

		console.debug('render', this.record.phantom);

		if (!this.innerFootnotes) {
	  	this.innerFootnotes = this.containedFootnotes();
		this.assureRedactedFootnoteText(this.innerFootnotes);
	}

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
			if (this.compElements) {
				this.compElements.addCls(this.redactionCls);
				//Sigh, I hate this, but if we don't get this onto the next event loop
				//it seems to crash IE in certain cases.  Seems to be the perfect combination
				//of location, overlap with other redactions, and timing...
				Ext.defer(this.toggleRedaction, 1, this);
			}
		}

		return y;
	},

	getRestrictedRange: function (annotationOffsets) {
		var rect, t, rtop, rr;
		if (this.masterSpan.hasCls(this.cls)) {
			t = this.actionSpan.getBoundingClientRect();
			rect = { top: t.top, bottom: t.bottom, left: t.left, right: t.right, height: t.height, width: t.width };
			rr = annotationOffsets || this.manager.getReader().getAnnotationOffsets();
			rtop = rr.scrollTop + rr.top;
			rect.top = rect.top + rtop;
			rect.bottom = rect.bottom + rtop;
			return rect;
		}
		return null;
	},

	visibilityChanged: function (show) {
		if (this.actionSpan) {
			Ext.fly(this.actionSpan).setVisibilityMode(Ext.dom.Element.DISPLAY);
			Ext.fly(this.actionSpan)[show ? 'show' : 'hide']();
		}
		return this.callParent(arguments);
	},

	isBlockRedaction: function () {
		return this.record && Boolean(this.record.get('redactionExplanation'));
		//kind of hacky... as soon as you blank out this field, the redaction will become "inline" and there is no way
		// to go back, nor is this obvious. TODO: expose a "style" much like highlights/notes. (I'm actually surprised
		// style wasn't accepted already)
	},

	createActionHandle: function (before, block) {

		if (!before) {return null;}

		this.masterSpan = this.actionTpl.insertBefore(before, {
			replacementContent: this.record.get('replacementContent'),
			block: Boolean(block),
			style: block ? 'block' : 'inline'
		}, true);

		this.mon(this.masterSpan, {
			scope: this,
			'click': this.onControlClick,
			'mouseup': function (e) {e.stopEvent();return false;}
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

	insertFooter: function (after) {

	},

	onClick: function () {},

	onControlClick: function (e) {
		//stop event
		e.stopEvent();

		//handle click
		if (e.getTarget('.edit')) {
			if (!e.getTarget('.save')) {
				this.makeEditableSpanEditable(e);
			}
			else {
				this.saveEditorContent();
			}
		}
		else if (e.getTarget('.share')) {
			if (this.allowShare) {
				this.ownerCmp.fireEvent('share-with', this.record);
			}
		}
		else if (e.getTarget('.delete')) {
			this.remove();
		}
		else if (!this.editableSpan.dom.hasAttribute('contenteditable')) {
			this.toggleRedaction(e);
		}

		return false; //for ie
	},

	saveEditorContent: function () {
		this.makeEditableSpanNotEditable();
		this.record.set('replacementContent', this.editableSpan.dom.textContent);
		this.record.save();
		this.manager.resume(this.prefix);
	},

	resetEditorContent: function () {
		this.makeEditableSpanNotEditable();
		this.editableSpan.update(this.record.get('replacementContent'));
		this.manager.resume(this.prefix);
	},

	editableSpanEditorKeyDown: function (e, span) {
		var k = e.getKey();


		e.stopPropagation();


		if (k === e.ESC) {
			this.resetEditorContent();
		}
		else if (k === e.ENTER) {
			this.saveEditorContent();
		}
		else if (k === e.BACKSPACE) {

			if (this.editableSpan.dom.innerHTML === '') {
				e.stopEvent();
				return false;
			}
		}

		return true;
	},

	cleanup: function () {
		console.debug('cleanup', this.record.phantom);
		try {
			if (this.actionSpan) {Ext.fly(this.actionSpan).remove();}
		}
		catch (e) {
			console.warn(Globals.getError(e));
		}
		this.callParent(arguments);
	},

	toggleRedaction: function (e) {
		var redactionCollapsed = !this.compElements.first().hasCls(this.cls),
			me = this;

		console.debug('toggle', this.record.phantom);

		//toggle redaction on generated spans:
		this.compElements.toggleCls(this.cls);

		if (this.canvas) {Ext.fly(this.canvas).toggle();}
		if (this.masterSpan) {
			//Sometimes we run into cases where the redaction span in null.
			if (!this.masterSpan.dom) { this.masterSpan.dom = this.actionSpan; }
			this.masterSpan.toggleCls(this.cls);
		}

		this.requestRender();

		if (e) {
			e.stopEvent();
		}

		//If there are any innerFootnotes we need to toggle them also
		if (this.innerFootnotes) {
		this.innerFootnotes.each(function (footnote) {
				var redactedText = footnote.down('.redacted-text'),
					count = footnote ? footnote.getAttribute('data-redactedCount') : undefined,
					clsMnpFn;
				count = Ext.isEmpty(count) ? 0 : parseInt(count, 10);
				count = Ext.isNumber(count) ? count : 0;
				if (footnote && count !== undefined) {
					//adjust the count
					count += (redactionCollapsed ? 1 : -1);
					footnote.set({'data-redactedCount': count});
					clsMnpFn = count > 0 ? 'addCls' : 'removeCls';
					footnote[clsMnpFn]('footnote');
					footnote[clsMnpFn](me.cls);
				}
			});
	}


		return false;
	},

	assureRedactedFootnoteText: function (footnotes) {
		var me = this;

		if (!footnotes) {
			return;
		}

		footnotes.each(function (footnote) {
			var toAdd;
			if (!footnote.down('.redacted-text')) {
				me.footnoteRedactedTpl.append(footnote);
			}
		});
	},

	containedFootnotes: function () {
	  	var me = this,
			 footnotes = [];

		  if (!this.compElements) {
			  return null;
		  }

	  	this.compElements.each(function (e) {
		var fns = e.query('a.footnote');
		Ext.each(fns, function (fn) {
		  	footnotes.push(Ext.DomQuery.select(fn.getAttribute('href'), me.doc)[0]);
		});
	  });
	  	return new Ext.dom.CompositeElement(footnotes);
	}
}, function () {

	var p = this.prototype,
		tpl = {tag: 'span', 'data-non-anchorable': 'true', 'data-no-anchors-within': 'true', cls: 'redactionAction {style}', cn: [
					{tag: 'span', 'data-non-anchorable': 'true', cls: 'editableSpan', html: '{replacementContent}'},
					{tag: 'span', 'data-non-anchorable': 'true', cls: 'controls', cn: [
						{tag: 'span', 'data-non-anchorable': 'true', cls: 'edit', 'data-qtip': '{{{NextThought.view.annotations.Redaction.edit}}}'},
						{tag: 'span', 'data-non-anchorable': 'true', cls: 'share', 'data-qtip': '{{{NextThought.view.annotations.Redaction.share}}}'},
						{tag: 'span', 'data-non-anchorable': 'true', cls: 'delete', 'data-qtip': '{{{NextThought.view.annotations.Redaction.delete}}}'}
					]}
	]};

	p.actionTpl = new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'tpl', 'if': 'block', cn: [
			{tag: 'span', cls: 'block-redaction head', 'data-non-anchorable': true, cn: [Ext.clone(tpl)]}
		]},
		{tag: 'tpl', 'if': '!block', cn: [tpl]}
	]));


	p.footnoteRedactedTpl = new Ext.XTemplate(Ext.DomHelper.markup([
		{tag: 'span',
		 cls: 'redacted-text',
		 html: '{{{NextThought.view.annotations.Redaction.footnote-message}}}',
		 'data-non-anchorable': 'true',
		 'data-no-anchors-within': 'true'
		}
	]));

});
