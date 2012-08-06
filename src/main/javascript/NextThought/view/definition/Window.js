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
			//src: url, expected now
            src: 'javascript:',
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

                var out = processor.transformToDocument(dom);

                var o = new XMLSerializer().serializeToString(out);
                if(o.indexOf('&lt;/a&gt;') >= 0){
                    o = Ext.String.htmlDecode(o);
                }

                console.log(o);

                var doc = this.down('[cls=definition]').el.dom.contentDocument.open();
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
            url: $AppConfig.server.host + this.url + encodeURIComponent(this.term),
            async: true,
            scope: this,
            callback: function(q,s,r){
                var dom = new DOMParser().parseFromString(r.responseText,"text/xml");
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
            url: $AppConfig.server.host + me.xslUrl,
            async: true,
            scope: me,
            callback: function(q,s,r){
                var dom = new DOMParser().parseFromString(r.responseText,"text/xml");
                var p = new XSLTProcessor();
                me.self.xsltProcessor = p;
                p.importStylesheet(dom);
                Ext.callback(cb, scope || me, [ p ]);
            }});
    }
});
