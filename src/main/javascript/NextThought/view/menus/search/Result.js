Ext.define('NextThought.view.menus.search.Result',{
	extend: 'Ext.Component',
	alias: 'widget.search-result',
	cls: 'search-result',

	requires: ['NextThought.util.Search'],

	renderTpl: Ext.DomHelper.markup([
		{cls:'title',html:'{title}',cn:[
			{tag:'tpl', 'if':'chapter',cn:[' / ',{cls:'chapter', html:'{chapter}'}]},
			{tag:'tpl', 'if':'section',cn:[{cls:'section', html:'{section}'}]}
		]},
		{
			cls:'wrap',
			cn:[
				{tag:'tpl', 'if':'name',cn:[{cls:'name',html:'{name}'}]},
				{cls:'snippet',html:'{snippet}'}
			]
		}
	]),

	renderSelectors: {
		name: '.name'
	},

	initComponent: function(){
		var me = this;
		me.callParent(arguments);
		me.renderData = Ext.copyTo({},me,'title,chapter,name,section,snippet');

		if(isMe(this.name)){
			me.renderData.name = 'me';
			return;
		}

		if(me.name){
			UserRepository.getUser(me.name,function(users){
				var n = users[0]? users[0].getName() : '';
				if(me.rendered && me.name){
					me.name.update(n);
					return;
				}

				me.renderData.name = n;
			});
		}
	},

	beforeRender: function() {
		var re = SearchUtils.searchRe(this.term);
		this.renderData.snippet = this.snippet.replace(re,  '<span>$1</span>');

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
