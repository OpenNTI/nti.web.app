Ext.define('NextThought.view.content.notepad.Editor',{
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
			//default value (allow the cursor in to this placeholder div, but don't take any space)
				html: '&#8203;'
			}
		]
	}),


	childEls:['body'],


	initComponent: function(){
		var me = this;
		me.callParent(arguments);
		me.on({
			afterRender: function(){ me.body.selectable(); },
			body: {
				click: 'stop',
				blur: 'blur'
			}
		});
	},


	stop: function(e){
		e.stopPropagation();
	},


	focus: function(){
		this.body.focus();
	},


	blur: function(){
		this.fireEvent('blur', this);
	},


	getValue: function(){
		//Sanitize some new line stuff that various browsers produce.
		//See http://stackoverflow.com/a/12832455 and http://jsfiddle.net/sathyamoorthi/BmTNP/5/
		var out = [];

		function stripTrailingBreak(text) {
			var re = stripTrailingBreak.re = (stripTrailingBreak.re||/<br\/?>$/i);
			return text.replace(re, '');
		}

		function clean(o){
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

		function join(o){
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
				html = (div.getHTML() || '').replace(/\u200B/g, '');
				out.push(html);
			}
			catch (er) {
				console.warn('Oops, ', er.stack || er.message || er);
			}
		});

		return Ext.Array.filter(join(clean(out)), function (i) {
			//if we are just whitespace and html whitespace
			return i && !Ext.isEmpty(i.replace(/<br\/?>|&nbsp;/g, '').trim());
		});
	}
});
