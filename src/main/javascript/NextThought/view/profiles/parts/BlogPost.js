Ext.define('NextThought.view.profiles.parts.BlogPost',{
	extend: 'Ext.Component',
	alias: 'widget.profile-blog-post',

	mixins: {
		likeAndFavorateActions: 'NextThought.mixins.LikeFavoriteActions'
	},

	cls: 'entry',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'controls', cn:[{cls:'favorite'},{cls:'like'}]},
		{ cls: 'title', html:'{title}' },
		{ cls: 'meta', cn: [
			{ tag:'span', cls: 'datetime', html: '{CreatedTime:date("F j, Y")} at {CreatedTime:date("g:m A")}'},
			{ tag:'span', cls: 'state {publish-state:lowercase}', html: '{publish-state}'},
			{ tag: 'tpl', 'if':'headline.isModifiable', cn:[
				{ tag:'span', cls: 'edit link', html: 'Edit'},
				{ tag:'span', cls: 'delete link', html: 'Delete'}
			]}
		]},
		{ cls: 'body' },
		{ cls: 'foot', cn: [
			{ tag:'span', cls: 'comment-count', html: '{PostCount} Comments' },
			{ tag:'span', cls: 'tags', cn:[
				{tag:'tpl', 'for':'headline.tags', cn:[
					{tag:'span', cls:'tag', html: '{.}'}
				]}
			]}
		]}
	]),


	renderSelectors: {
		bodyEl: '.body',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		editEl: '.meta .edit',
		deleteEl: '.meta .delete'
	},


	initComponent: function(){
		this.callParent(arguments);
		this.addEvents(['delete-post','show-post']);
		this.enableBubble(['delete-post','show-post']);
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.mixins.likeAndFavorateActions.constructor.call(this);
		var r = this.record;
		if(!r || !r.getData){
			Ext.defer(this.destroy,1,this);
			return;
		}

		r = this.renderData = Ext.apply(this.renderData||{}, r.getData());
		if(!r.headline || !r.headline.getData){
			console.warn('The record does not have a story field or it does not implement getData()',r);

			Ext.defer(this.destroy,1,this);
			return;
		}
		r.headline = r.headline.getData();
	},


	afterRender: function(){
		this.callParent(arguments);
		var h = this.record.get('headline');
		if(!h){return;}

		h.compileBodyContent(this.setContent, this, this.generateClickHandler, 226 );
		this.bodyEl.selectable();

		if(this.selectedSections){
			console.debug('Do something with this/these:',this.selectedSections);
		}

		if( this.deleteEl ){
			this.mon(this.deleteEl,'click',this.onDeletePost,this);
		}

		if( this.editEl ){
			this.mon(this.editEl,'click',this.onEditPost,this);
		}
	},


	onDeletePost: function(e){
		e.stopEvent();
		this.fireEvent('delete-post',this.record, this);
	},


	onEditPost: function(e){
		e.stopEvent();
		this.fireEvent('show-post',this.record.get('ID'),'edit');
	},


	getRecord: function(){
		return this.record.get('headline');
	},


	setContent: function(html){
		this.bodyEl.update(html);
	},


	generateClickHandler: function(){}


});
