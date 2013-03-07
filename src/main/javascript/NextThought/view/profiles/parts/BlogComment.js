Ext.define('NextThought.view.profiles.parts.BlogComment',{
	extend: 'Ext.Component',
	alias: 'widget.profile-blog-comment',

	cls: 'blog-comment',
	ui: 'blog-comment',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'avatar', style: { backgroundImage: 'url({avatarURL});'}},
		{ cls: 'wrap', cn:[
			{ cls: 'meta', html: '{displayName} {CreatedTime:date("F j, Y")} at {CreatedTime:date("g:m A")}'},
			{ cls: 'body' }
		] }
	]),


	renderSelectors: {
		bodyEl: '.body'
	},


	beforeRender: function(){
		var me = this, r = me.record, rd;
		me.callParent(arguments);
		rd = me.renderData = Ext.apply(me.renderData||{},r.getData());
		UserRepository.getUser(r.get('Creator'),function(u){
			Ext.applyIf(rd, u.getData());
			if(this.rendered){
				console.warn('Rendered late');
				me.renderTpl.overwrite(me.el,rd);
			}
		});
	},


	afterRender: function(){
		this.callParent(arguments);
		this.record.compileBodyContent(this.setContent,this);
	},


	setContent: function(html){
		try{
			this.bodyEl.update(html);
		}catch(e){}
	}
});
