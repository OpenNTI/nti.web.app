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
			{cls: 'count', cn:[{tag:'span', html: '{count}'}]}
		]
	}),

	renderSelectors: {
		image: 'img'
	},

	initComponent: function(){
		this.callParent(arguments);
		var m = this.record;

		this.renderData = {count:m.getReplyCount()|| false};
		UserRepository.getUser(m.get('Creator'),this.fillInUser,this);
	},


	markSelected: function(state){
		this.selected = Boolean(state);
		this[this.selected?'addCls':'removeCls'].call(this,['selected']);
	},


	fillInUser: function(user){
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
		if(!this.renderData.count){
			this.el.down('.count').update('&nbsp;');
		}
		this.el.on('click', this.clicked, this);
	},


	clicked: function(e){
		this.up('note-carousel').setRecord(this.record);
	}
});
