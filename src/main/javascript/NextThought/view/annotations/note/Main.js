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
				'<div class="favorite"></div>',
				'<div class="bookmark"></div>',
			'</div>',
			'<span class="name"></span> - <span class="time"></span>',
		'</div>',
		'<div class="context"></div>',
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
		context: '.context',
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

		this.context.update(r.get('SelectedText'));

		r.compileBodyContent(function(text){ this.text.update(text); },this);
	},


	fillInUser: function(user){
		if(Ext.isArray(user)){user = user[0];}
		this.name.update(user.getName());
	}

});
