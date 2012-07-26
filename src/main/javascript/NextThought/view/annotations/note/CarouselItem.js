Ext.define('NextThought.view.annotations.note.CarouselItem',{
	extend: 'Ext.Component',
	alias: 'widget.note-carousel-item',

	requires: [
		'NextThought.cache.IdCache',
		'NextThought.cache.UserRepository'
	],

	cls: 'carousel-item',

	renderTpl: Ext.DomHelper.markup({
		cls: 'item-body',
		cn: [
			{tag: 'img', src: Ext.BLANK_IMAGE_URL},
			{cls: 'count', html: '{count}'}
		]
	}),

	renderSelectors: {
		image: 'img'
	},

	initComponent: function(){
		var m = this.record;
		this.id = IdCache.getComponentId(m,null, 'carousel-item');
		this.callParent(arguments);

		this.renderData = {count:m.getReplyCount()};
		UserRepository.getUser(m.get('Creator'),this.fillInUser,this);
	},


	markSelected: function(state){
		this[state?'addCls':'removeCls'].call(this,['selected']);
	},


	fillInUser: function(user){
		if(Ext.isArray(user)){user = user[0];}

		this.avatarImage = 'url('+user.get('avatarURL')+')';
		if(this.rendered){
			this.image.setStyle({ backgroundImage: this.avatarImage });
			delete this.avatarImage;
		}
	},

	afterRender: function(){
		this.callParent(arguments);
		if(this.avatarImage){
			this.image.setStyle({ backgroundImage: this.avatarImage });
		}

		this.el.on('click', this.clicked, this);
	},


	clicked: function(e){
		this.up('note-carousel').setRecord(this.record);
	}
});
