Ext.define('NextThought.view.profiles.parts.BlogComment',{
	extend: 'Ext.Component',
	alias: 'widget.profile-blog-comment',

	cls: 'blog-comment',
	ui: 'blog-comment',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'controls', cn:[{cls:'favorite'},{cls:'like'}]},
		{ cls: 'avatar', style: { backgroundImage: 'url({avatarURL});'}},
		{ cls: 'wrap', cn:[
			{ cls: 'meta', cn: [
				{ tag: 'span', html: '{displayName}', cls: 'name link'},
				{ tag:'span', cls: 'datetime', html: '{LastModified:date("F j, Y")} at {LastModified:date("g:m A")}'},
				{ tag: 'tpl', 'if':'headline.isModifiable', cn:[
					//{ tag:'span', cls: 'edit link', html: 'Edit'},
					{ tag:'span', cls: 'delete link', html: 'Delete'}
				]}
			]},
			//flag?
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
