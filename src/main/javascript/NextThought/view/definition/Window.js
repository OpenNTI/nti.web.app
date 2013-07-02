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
			style: {
				overflowX: 'hidden',
				overflowY: 'scroll'
			}
		}
	},

	fallbackURL: '/dictionary/',
	xslUrl: '/dictionary/static/style.xsl',

	initComponent: function(){
		var me = this, p, nib = 20, top, y, x;

		if(!me.pageInfo || !Ext.isFunction(me.pageInfo.getLink)){
			Ext.Error.raise('Need a PageInfo');
		}

		if(!me.term){
			Ext.Error.raise('definition term required');
		}

		//figure out xy
		p = this.pointTo;
		if(p){
			top = Ext.Element.getViewportHeight() < (p.bottom + this.getHeight() + nib);
			y = Math.round(top ? p.top - nib - this.getHeight() : p.bottom + nib);
			x = Math.round((p.left + (p.width/2)) - (this.getWidth()/2));

			Ext.apply(me,{x:x,y:y});
			me.addCls(top?'south':'north');
		}

		me.callParent(arguments);
		me.on({
			scope: me,
			close:function(){ me.dragMaskOff(); },
			show: me.fixMask,
			destroy: me.unfixMask,
			afterrender: Ext.bind(me.loadDefinition, me, [me.term])
		});
	},


	fixMask: function(){
		var m = this.maskEl = this.zIndexManager.mask;
		m.addCls('nti-clear');
	},

	unfixMask: function(){
		try { this.maskEl.removeCls('nti-clear'); }
		catch(e){swallow(e);}
	},


	loadDefinition: function(term){
		var me = this;
		me.term = term;

		me.queryDefinition(function(dom){
			me.getXSLTProcessor(function(processor){
				if(!processor){
					me.close();
					alert('You do not have a dictionary installed');
					return;
				}

				var o, domtree, outputtree, doc;
				if (window.hasOwnProperty('XSLTProcessor') && window.XMLSerializer && window.DOMParser) {
					domtree = new DOMParser().parseFromString(dom,"text/xml");
					outputtree = processor.transformToDocument(domtree);
					o = new XMLSerializer().serializeToString(outputtree);
				}
				else {
					domtree = new ActiveXObject("Msxml2.DOMDocument");
					domtree.loadXML(dom);
					processor.input = domtree;
					processor.transform();
					o = processor.output;
				}

				if( o.indexOf('&lt;/a&gt;') >= 0 ){
					o = Ext.String.htmlDecode(o);
				}

				doc = this.getDocumentElement().open();

				doc.write(o);
				doc.close();
				doc.onclick = function(e){
					e = Ext.EventObject.setEvent(e||event);
					e.stopEvent();
					var t = e.getTarget('a[href]',null,true);

					if(t){
						me.loadDefinition( decodeURIComponent(t.getAttribute('href')) );
					}

					return false;
				};
				me.show();
			});
		});
	},


	getDocumentElement: function(){
		var iframe = this.down('[cls=definition]').el.dom;
		return iframe.contentDocument
				|| (iframe.contentWindow || window.frames[iframe.name]).document;
	},


	queryDefinition: function(cb, scope){
        var u = this.pageInfo.getLink('Glossary'), req;

        if (!u){u=this.fallbackURL;}
        else{u+='/';}

		req = {
			url: getURL(u + encodeURIComponent(this.term)),
			async: true,
			scope: this,
			callback: function(q,s,r){
				var dom = r.responseText;
				Ext.callback(cb, scope||this, [dom]);
			}
		};

		Ext.Ajax.request(req);
	},


	getXSLTProcessor: function(cb, scope){
		var me = this, req;
		if(me.self.xsltProcessor){
			Ext.callback(cb, scope || me, [me.self.xsltProcessor ] );
			return;
		}

		req = {
			url: getURL(me.xslUrl),
			async: true,
			scope: me,
			callback: function(q,s,r){
				var xsldoc, xslt, dom, p;
				if (!window.hasOwnProperty('XSLTProcessor')) {
					try {
					xsldoc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument");
					xsldoc.loadXML(r.responseText);
					xslt = new ActiveXObject("Msxml2.XSLTemplate");
					xslt.stylesheet = xsldoc;
					p = xslt.createProcessor();
					} catch( e ){
						console.error('Dictionary may not be installed, or not configured properly.', e.message);
					}
				}
				else {
					dom = new DOMParser().parseFromString(r.responseText,"text/xml");
					p = new XSLTProcessor();
					p.importStylesheet(dom);
				}
				me.self.xsltProcessor = p;
				Ext.callback(cb, scope || me, [ p ]);
			}
		};

		Ext.Ajax.request(req);
	}
});
