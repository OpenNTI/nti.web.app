var Ext = require('extjs');
var DomUtils = require('../../../util/Dom');
var EditorEditor = require('../../../editor/Editor');


module.exports = exports = Ext.define('NextThought.app.contentviewer.notepad.Editor', {
	extend: 'Ext.Component',
	alias: 'widget.notepad-editor',
	ui: 'notepad-item',
	cls: 'inline-editor',

	renderTpl: Ext.DomHelper.markup({
		cls: 'body',
		id: '{id}-body',
		contentEditable: true,
		unselectable: 'off',
		tabIndex: -1,
		cn: [
			{ //inner div for IE
			//default value (U+2060 -- allow the cursor in to this placeholder div, but don't take any space)
				html: '&#8288;'
			}
		]
	}),

	childEls: ['body'],

	initComponent: function () {
		this.callParent(arguments);
		this.on({
			afterRender: 'setup',
			body: {
				click: 'stop',
				blur: 'blur',
				keydown: 'onKeyDown',
				keypress: 'stop'
			}
		});
	},

	setup: function () {
		var v;
		this.body.selectable();
		if (!Ext.isEmpty(this.value)) {
			v = Ext.Array.map(this.value, function (i) {
				if (Ext.isString(i)) {
					i = Ext.DomHelper.markup({html: i});
				}
				return i;
			});
			this.body.setHTML(v.join(''));
		}

		this[this.isEmpty() ? 'addCls' : 'removeCls']('empty');
	},

	onKeyDown: function (e) {
		this.stop(e);
		if (e.getKey() === e.ESC) {
			this.fireEvent('cancel');
			this.destroy();
			return;
		}
		this.fireEvent('keydown', e);
		Ext.defer(this.doLater, 1, this, [this.isEmpty() ? 'addCls' : 'removeCls',['empty']]);

	},

	doLater: function (fn,args) {
		if(this.isDestroyed) {return;}
		this[fn].apply(this,args);
	},

	stop: function (e) {
		e.stopPropagation();
	},

	focus: function () {
		this.body.focus();
		this.moveCursorToEnd(this.body.last());
	},

	blur: function () {
		this.fireEvent('blur', this);
	},

	isEmpty: function isEmpty () {
		return DomUtils.isEmpty(this.getValue());
	},

	getValue: function () {
		//Sanitize some new line stuff that various browsers produce.
		//See http://stackoverflow.com/a/12832455 and http://jsfiddle.net/sathyamoorthi/BmTNP/5/
		var out = [];

		function stripTrailingBreak (text) {
			var re = stripTrailingBreak.re = (stripTrailingBreak.re || /<br\/?>$/i);
			return text.replace(re, '');
		}

		function clean (o) {
			var r = [], p, i, len = o.length;
			for (i = 0; i < len; i++) {
				p = stripTrailingBreak(o[i]);
				if (r.length === 0 || !Ext.isArray(r.last())) {
					r.push([p]);
					continue;
				}
				r.last().push(p);
			}
			return r;
		}

		function join (o) {
			var i, v;
			for (i = o.length; i >= 0; i--) {
				v = o[i];
				if (v && v.join && v.join.call) {
					o[i] = v.join('<br/>');
				}
			}
			return o;
		}

		this.el.select('.body > *').each(function (div) {
			var html, tmp, dom;
			try {
				//don't let manipulations here effect the dom
				dom = Ext.getDom(div).cloneNode(true);
				div = Ext.fly(dom, '__editer-flyweight');
				html = (div.getHTML() || '').replace(/\u200B|\u2060/ig, '');
				out.push(html);
			}
			catch (er) {
				console.warn('Oops, ', er.stack || er.message || er);
			}
		});

		if (!out.length) {
			out = this.body.getHTML().split(/<br\/?>/);
		}

		return Ext.Array.filter(join(clean(out)), function (i) {
			//if we are just whitespace and html whitespace
			return i && !Ext.isEmpty(i.replace(/<br\/?>|&nbsp;/g, '').trim());
		});
	}
},function () {
	this.borrow(NextThought.editor.AbstractEditor, ['moveCursorToEnd']);
});
