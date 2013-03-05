Ext.define('NextThought.view.profiles.parts.BlogPost',{
	extend: 'Ext.Component',
	alias: 'widget.profile-blog-post',

	mixins: {
		likeAndFavorateActions: 'NextThought.mixins.LikeFavoriteActions'
	},

	requires:[
		'NextThought.view.menus.BlogTogglePublish'
	],

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
		deleteEl: '.meta .delete',
		publishStateEl: '.meta .state'
	},


	initComponent: function(){
		this.callParent(arguments);
		this.addEvents(['delete-post','show-post']);
		this.enableBubble(['delete-post','show-post']);
		this.mon(this.record, 'destroy', this.destroy, this);
	},

	beforeRender: function(){
		this.callParent(arguments);
		this.mixins.likeAndFavorateActions.constructor.call(this);
		var r = this.record;
		if(!r || !r.getData){
			Ext.defer(this.destroy,1,this);
			return;
		}

		this.renderData = Ext.apply(this.renderData||{}, r.getData());
		this.renderData = Ext.apply(this.renderData, {'publish-state': r.getPublishState()});
		r = this.renderData;
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

		h.addObserverForField(this, 'title', this.updateField, this);
		h.addObserverForField(this, 'tags', this.updateField, this);
		h.addObserverForField(this, 'body', this.updateContent, this);
		this.setPublishState();
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

		this.reflectLikeAndFavorite(this.record);
		this.listenForLikeAndFavoriteChanges(this.record);
	},


	updateField: function(key, value){
		var el = this.el.down('.'+key);
		if(el){ el.update(value); }
	},


	updateContent: function(key, value){
		var h = this.record.get('headline');
		h.compileBodyContent(this.setContent, this, this.mapWhiteboardData, 226 );
	},


	onDestroy: function(){
		var h = this.record.get('headline');
		h.removeObserverForField(this, 'title', this.updateField, this);
		h.removeObserverForField(this, 'body', this.updateField, this);
		h.removeObserverForField(this, 'tags', this.updateField, this);
		this.record.removeObserverForField(this, 'published', this.markAsPublished, this);
		this.callParent(arguments);
	},


	onDeletePost: function(e){
		e.stopEvent();
		var me = this;
		Ext.Msg.show({
			msg: 'Deleting your thought will permanently remove it and any comments.',
			buttons: 9, // bitwise result of: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: me,
			icon: 'warning-red',
			buttonText: {'ok': 'Delete'},
			title: 'Are you sure?',
			fn: function(str){
				if(str === 'ok'){
					me.fireEvent('delete-post',me.record, me);
				}
			}
		});
	},


	onEditPost: function(e){
		e.stopEvent();
		this.fireEvent('show-post',this.record.get('ID'),'edit');
	},


	getRecord: function(){
		return this.record;
	},


	showPublishMenu: function(){
		this.publishMenu.updateFromRecord(this.record);
		this.publishMenu.showBy(this.publishStateEl,'tl-bl',[0,0]);
	},


	setPublishState: function(){
		if(!this.record.isModifiable()){
			this.publishStateEl.remove();
			return;
		}

		this.publishMenu = Ext.widget('blog-toggle-publish', {record: this.record});
		this.mon(this.publishStateEl, 'click', this.showPublishMenu, this);
		this.record.addObserverForField(this, 'published', this.markAsPublished, this);
	},


	markAsPublished: function(key, value){
		var val = value ? 'public' : 'only me',
			removeCls = value ? 'only me' : 'public';
		this.publishStateEl.addCls(val);
		this.publishStateEl.update(Ext.Array.map(val.split(' '),Ext.String.capitalize).join(' '));
		this.publishStateEl.removeCls(removeCls);
	},


	setContent: function(html){
		this.bodyEl.update(html);
		//TODO this may need to be tweaked if/when we have internal links
		this.bodyEl.select('a[href]', true).set({target: '_blank'});
	},


	generateClickHandler: function(){}


});
