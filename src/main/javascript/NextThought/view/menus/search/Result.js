Ext.define('NextThought.view.menus.search.Result',{
	extend: 'Ext.Component',
	alias: 'widget.search-result',
	cls: 'search-result',

	renderTpl: Ext.DomHelper.markup([
		{cls:'title',html:'{title}'},
		{tag:'tpl', 'if':'section',cn:[{cls:'section', html:'{section}'}]},
		{cls:'snippet',html:'{snippet}'}
	]),

	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.copyTo({},this,'title,section,snippet');
	},

	beforeRender: function() {
		var re = new RegExp([
			'(.*)\\b(',
			RegExp.escape(this.term),
			')(.*)'
		].join(''), 'igm');

		function fn(original,before,group,after){
			var context = 15;
			return [
				before.length > context ? '...'+before.substring(before.length-context) : before,
				'<span>',group,'</span>',
				Ext.String.ellipsis(after,context,true)
			].join('');
		}

		this.renderData.snippet = this.snippet.replace(re, fn);
		return this.callParent(arguments);
	},

	afterRender: function() {
		this.callParent(arguments);
		this.getEl().on({
			scope: this,
			animationend: this.animationEnd,
			webkitAnimationEnd: this.animationEnd,
			click: this.clicked
		});
	},


	animationEnd: function(){
		this.getEl().removeCls('pulse');
	},

	clicked: function(){
		this.getEl().addCls('pulse');
		this.fireEvent('click', this);
	}
});
