Ext.define('NextThought.view.account.activity.Preview',{
	extend: 'Ext.container.Container',

	requires: [
        'NextThought.cache.LocationMeta',
		'NextThought.editor.Editor'
	],


	onClassExtended: function(cls, data) {
		//Allow subclasses to override render selectors, but don't drop all of them if they just want to add.
		data.renderSelectors = Ext.applyIf(data.renderSelectors||{},cls.superclass.renderSelectors);


		//allow a toolbar template to be defined
		data.toolbarTpl = data.toolbarTpl || cls.superclass.toolbarTpl || false;

		//merge in subclass's templates
		var tpl = this.prototype.renderTpl
				.replace('{toolbar}',data.toolbarTpl||'');

		if(!data.renderTpl){
			data.renderTpl = tpl;
		}
		//Allow the subclass to redefine the template and include the super's template
		else {
			data.renderTpl = data.renderTpl.replace('{super}',tpl);
		}
	},

	mixins: {
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions'
	},

	childEls: ['body'],
	getTargetEl: function () { return this.body; },

	cls: 'activity-preview',

	renderSelectors: {
		avatar: '.avatar',
		name: '.name',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		subjectEl: '.subject',
		itemEl: '.item',
		footEl: '.foot',
		commentsEl: '.comments',
		messageBodyEl: '.body',
		replyEl: '.reply',
		replyBoxEl: '.respond > div',
		respondEl: '.respond'
	},

	renderTpl: Ext.DomHelper.markup([
		{
			cls: '{type} activity-preview-body',
			cn:[
				'{toolbar}',
				{ cls:'item', cn:[
					{ cls: 'avatar', style:{backgroundImage:'url({avatarURL})'} },
					{ cls: 'controls', cn: [
						{ cls: 'favorite' },
						{ cls: 'like' }
					]},
					{ cls: 'meta', cn: [
						{ cls: 'subject {[values.title? "":"no-subject"]}', html: '{title}' },
						{ cls: 'stamp', cn: [
							{tag: 'span', cls: 'name link {[values.title? "":"no-subject"]}', html: 'By {name}'},
							{tag: 'span', cls: 'time', html:'{relativeTime}'}
						]}
					]},
					{ cls: 'body' }
				]},
				{
					cls: 'foot',
					cn: [
						{ cls: 'comments', 'data-label': ' Comments',
							html: '{CommentCount} Comment{[values.CommentCount===1?"":"s"]}' }
					]
				}
			]
		},{
			id: '{id}-body',
			cls: 'replies',
			tpl: new Ext.XTemplate('{%this.renderContainer(out,values)%}')
		},{
			cls: 'respond', cn: {
			cn: [
				{
					cls: 'reply-options',
					cn: [
						{ cls: 'reply', html: 'Add a comment' }
					]
				}
			]}
		}
	]),


	setBody: function(body){
		if(!this.rendered){
			this.on('afterrender',Ext.bind(this.setBody,this,arguments),this);
			return;
		}
		this.messageBodyEl.update(body);
	},


	/**
	 * Maps the records 'reply/comment/post' counts to a single value.
	 *
	 * @param record
	 * @returns Number
	 */
	getCommentCount: function(record){
		throw 'Do not use the base class directly. Subclass and implement this';
	},


	/**
	 * Place to derive fields that should be put into the template.
	 *
	 * @param record
	 * @returns Object
	 */
	getDerivedData: function(record){
		return {
			relativeTime: record.getRelativeTimeString()
		};
	},


	/** @private */
	prepareRenderData: function(record){
		var me = this,
			o = record.getData();
		o.type = o.Class.toLowerCase();
		o.CommentCount = this.getCommentCount(record);
		Ext.apply(o,this.getDerivedData(record));

		me.ownerCt.addCls(o.type);

		UserRepository.getUser(o.Creator,function(u){
			o.avatarURL = u.get('avatarURL');
			o.name = u.getName();
			if(me.rendered){
				me.avatar.setStyle({backgroundImage: 'url('+ o.avatarURL + ');'});
				me.name.update(me.name.getHTML()+o.name);
			}
		});

		return Ext.apply(this.renderData||{}, o);
	},


	getRefItems: function(){
		var ret = this.callParent(arguments)||[];
		if( this.editor ){
			ret.push(this.editor);
		}
		return ret;
	},


	beforeRender: function(){
		this.mixins.likeAndFavoriteActions.constructor.call(this);
		this.callParent(arguments);
		this.renderData = this.prepareRenderData(this.record);
	},


	saveCallback: function(editor, cmp, replyRecord){
		editor.deactivate();
		editor.setValue('');
		editor.reset();
		cmp.add({record: replyRecord});
	},


	afterRender: function(){
		this.callParent(arguments);

		var box = this.replyBoxEl;
		this.editor = Ext.widget('nti-editor',{ownerCt: this, renderTo:this.respondEl, 'saveCallback': this.saveCallback});
		this.mon(this.replyEl, 'click', this.showEditor, this);
		box.setVisibilityMode(Ext.dom.Element.DISPLAY);

		this.mon(this.editor,{
			scope: this.editor,
			'activated-editor':Ext.bind(box.hide,box,[false]),
			'deactivated-editor':Ext.bind(box.show,box,[false]),
			'no-body-content': function(editor,bodyEl){
				editor.markError(bodyEl,'You need to type something');
				return false;
			}
		});

		this.on('beforedeactivate', this.handleBeforeDeactivate, this);
	},


	handleBeforeDeactivate: function(){
		return !(this.editor && this.editor.isActive());
	},


	showEditor: function(){
		this.editor.reset();
		this.editor.activate();
		this.editor.focus(true);
	},


	getPointerStyle: function(x,y){
		return y >= this.footEl.getTop() ? 'grey' : '';
	}

});
