Ext.define('NextThought.view.definition.Window', {
	extend: 'NextThought.view.Window',
	alias: 'widget.definition-window',

	cls: 'dictionary-window',
	title: 'Dictionary',
	closeAction: 'destroy',
	width: 310,
	height: 245,
	layout: 'fit',
	autoRender: true,
	hidden: true,
	modal: true,
	items: {
		xtype: 'component',
		cls: 'definition',
		autoEl: {
			tag: 'iframe',
			src: Ext.SSL_SECURE_URL,
			frameBorder: 0,
			marginWidth: 0,
			marginHeight: 0,
			seamless: true,
			transparent: true,
			allowTransparency: true,
			style: 'overflow: hidden'
		}
	},

	url: '/dictionary/',
	xslUrl: '/dictionary/static/style.xsl',

	initComponent: function(){
		var me = this;
		me.callParent(arguments);

		if(!me.term){
			Ext.Error.raise('definition term required');
		}

		me.queryDefinition(function(dom){
			me.getXSLTProcessor(function(processor){
				var o, domtree, outputtree, doc;
				if (!Ext.isIE9) { 
					domtree = new DOMParser().parseFromString(dom,"text/xml");
					outputtree = processor.transformToDocument(domtree); 
					o = new XMLSerializer().serializeToString(outputtree);
					if(o.indexOf('&lt;/a&gt;') >= 0){ o = Ext.String.htmlDecode(o); }
				}
				else {
					domtree = new ActiveXObject("Msxml2.DOMDocument");
					domtree.loadXML(dom);
					processor.input = domtree;
					processor.transform();
					o = processor.output;
					if(o.indexOf('&lt;/a&gt;') >= 0){ o = Ext.String.htmlDecode(o); }
				}
				doc = this.down('[cls=definition]').el.dom.contentDocument.open();
				doc.write(o);
				doc.close();
				me.show();
			});
		});


		//figure out xy
		var p = this.pointTo || {};
		var nib = 20;
		var top = Ext.Element.getViewportHeight() < (p.bottom + this.getHeight() + nib),
			y = Math.round(top ? p.top - nib - this.getHeight() : p.bottom + nib),
			x = Math.round((p.left + (p.width/2)) - (this.getWidth()/2));

		if(this.pointTo){
			this.setPosition(x,y);
			this.addCls(top?'south':'north');
		}
	},


	queryDefinition: function(cb, scope){
		Ext.Ajax.request({
			url: getURL(this.url + encodeURIComponent(this.term)),
			async: true,
			scope: this,
			callback: function(q,s,r){
				var dom = r.responseText;
				Ext.callback(cb, scope||this, [dom]);
			}
		});
	},


	getXSLTProcessor: function(cb, scope){
		var me = this;
		if(me.self.xsltProcessor){
			Ext.callback(cb, scope || me, [me.self.xsltProcessor ] );
			return;
		}

		Ext.Ajax.request({
			url: getURL(me.xslUrl),
			async: true,
			scope: me,
			callback: function(q,s,r){
				var xsldoc, xslt, dom, p;
				if (Ext.isIE9) {
					xsldoc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument");
					xsldoc.loadXML(r.responseText);
					xslt = new ActiveXObject("Msxml2.XSLTemplate");
					xslt.stylesheet = xsldoc;
					p = xslt.createProcessor();
				}
				else {
					dom = new DOMParser().parseFromString(r.responseText,"text/xml");
					p = new XSLTProcessor();
					p.importStylesheet(dom);
				}
				me.self.xsltProcessor = p;
				Ext.callback(cb, scope || me, [ p ]);
			}});
	}
});
