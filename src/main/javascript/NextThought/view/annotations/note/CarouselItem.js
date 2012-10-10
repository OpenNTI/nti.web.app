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
			{cls: 'count', cn:[{tag:'span'}]}
		]
	}),

	renderSelectors: {
		image: 'img',
		count: '.count span'
	},

	isCarouselItem: true,

	initComponent: function(){
		this.callParent(arguments);
		var m = this.record;
		UserRepository.getUser(m.get('Creator'),this.fillInUser,this);
		this.mon(m,'count-updated',this.updateCount,this);
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
		this.el.on('click', this.clicked, this);

		this.updateCount();
	},


	updateCount: function(){
		this.count.update(this.record.getReplyCount()||'');
	},

	clicked: function(e){
		this.up('note-carousel').setRecord(this.record, this);
	}
});
