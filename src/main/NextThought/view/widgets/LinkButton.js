Ext.define('NextThought.view.widgets.LinkButton', {
	extend: 'Ext.Component',
	alias : 'widget.link',

	renderTpl: new Ext.XTemplate( '{htmlPrefix}<a class="{cls} link-button" href="#">{text}</a>{htmlPostfix}' ),

	renderSelectors: {
        linkEl: 'a.link-button'
    },

	constructor: function(config){
		config = Ext.applyIf(config, {
			htmlPrefix: undefined,
			htmlPostfix: undefined,
			text: undefined,
			cls: 'defualt-link'
		});

		return this.callParent([config]);
	},


	initComponent: function(){
		Ext.copyTo(this.renderData, this, 'text,cls,htmlPrefix,htmlPostfix');
		delete this.cls;
		delete this.text;
		delete this.htmlPrefix;
		delete this.htmlPostfix;

		return this.callParent(arguments);
	},

	afterRender: function(){
		var me = this;
		me.callParent(arguments);
		me.linkEl.on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
			me.fireEvent('click', me, e);
		});
	}
});
