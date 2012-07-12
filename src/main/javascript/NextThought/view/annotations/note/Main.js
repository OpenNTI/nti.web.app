Ext.define('NextThought.view.annotations.note.Main',{
	extend: 'Ext.Component',
	alias: 'widget.note-main-view',

	requires: [
		'NextThought.cache.UserRepository',
		'NextThought.view.annotations.note.Templates'
	],

	ui: 'nt',
	cls: 'main-view',

	renderTpl: Ext.DomHelper.createTemplate([
		{
			cls: 'meta',
			cn: [{
				cls: 'controls',
				cn: [{ cls: 'bookmark' },{ cls: 'favorite' }]
			},{
				tag: 'span',
				cls: 'name'
			},' - ',{
				tag: 'span', cls: 'time'
			}]
		},{
			cls: 'context',
			cn: [{tag: 'span', cls: 'text'}]
		},{ cls: 'body' },{
			cls: 'respond',
			cn: [
				TemplatesForNotes.getNoteEditorTpl()
			]
		}
	]).compile(),

	renderSelectors: {
		favorites: '.meta .controls .favorite',
		bookmarks: '.meta .controls .bookmark',
		name: '.meta .name',
		time: '.meta .time',
		context: '.context .text',
		text: '.body',
		responseBox: '.respond'
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

		this.context.update('Get from the page... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tincidunt sem eget quam tempor hendrerit. <span class="highlight">Nulla ultricies tincidunt laoreet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Nunc dictum consequat nisl eget eleifend. Duis tincidunt nibh id dui bibendum aliquam.<span class="tip">&nbsp;</span></span> Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.');

		r.compileBodyContent(function(text){ this.text.update(text); },this);
	},


	fillInUser: function(user){
		if(Ext.isArray(user)){user = user[0];}
		this.name.update(user.getName());
	}

});
