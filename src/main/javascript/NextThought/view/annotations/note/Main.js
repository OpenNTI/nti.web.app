Ext.define('NextThought.view.annotations.note.Main',{
	extend: 'Ext.Component',
	alias: 'widget.note-main-view',

	requires: [
		'NextThought.cache.UserRepository'
	],

	ui: 'nt',
	cls: 'main-view',

	renderTpl: [
		'<div class="meta">',
			'<div class="controls">',
				'<div class="bookmark"></div>',
				'<div class="favorite">0</div>',
			'</div>',
			'<span class="name"></span> - <span class="time"></span>',
		'</div>',
		'<div class="context"><span class="text"></span><span class="tip">&nbsp;</span></div>',
		'<div class="body"></div>',
		'<div class="respond">',
			'<div><input><span class="whiteboard">&nbsp;</span></div>',
		'</div>'
	],


	renderSelectors: {
		favorites: '.meta .controls .favorite',
		bookmarks: '.meta .controls .bookmark',
		name: '.meta .name',
		time: '.meta .time',
		context: '.context .text',
		text: '.body',
		replyBox: '.respond input',
		whiteboard: '.respond .whiteboard'
	},

	initComponent: function(){
		this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.setRecord(this.record);
	},


	setRecord: function(r){
		this.record = r;
		if(!this.rendered){return;}
		UserRepository.getUser(r.get('Creator'),this.fillInUser,this);
		this.time.update(r.getRelativeTimeString());

		this.context.update('Get from the page... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt sem eget quam tempor hendrerit. Nulla ultricies tincidunt laoreet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Nunc dictum consequat nisl eget eleifend. Duis tincidunt nibh id dui bibendum aliquam. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.');

		r.compileBodyContent(function(text){ this.text.update(text); },this);
	},


	fillInUser: function(user){
		if(Ext.isArray(user)){user = user[0];}
		this.name.update(user.getName());
	}

});
