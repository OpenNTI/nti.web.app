Ext.define('NextThought.view.account.settings.AvatarChoices',{
	extend: 'Ext.Component',
	alias: 'widget.avatar-choices',

	requires: [
		'NextThought.view.account.settings.RandomGravatarPicker'
	],

	renderTpl: Ext.DomHelper.markup({
		tag: 'ul',
		cls: 'avatar-choices',
		cn: [
			{tag: 'li', cls: 'custom', cn: [
				{tag: 'img', src: '{customAvatarUrl}'},
				{
					cls: 'wrapper',
					cn: [
						{tag: 'h3', cls: 'title', html:'Custom Photo'},
						{cn:[
							{tag: 'span', cls: 'editCustom', cn:[
								{tag: 'a', cls: 'editCustom', href: '#edit', html: 'Edit'},
								' | ']},
							{tag: 'a', cls: 'uploadCustom', href: '#upload', html: 'Upload New Photo'}
						]}
					]
				}
			]},
			{tag: 'li', cls: 'random', cn: [
				{tag: 'img', src: '{randomAvatarUrl}'},
				{
					cls: 'wrapper',
					cn: [
						{tag: 'h3', cls: 'title', html:'Randomly Generated'},
						{cn:[
							{tag: 'a', cls: 'more-random-choices', href: '#moreRandom', html: 'Show More'}
						]}
					]
				}
			]},

			{tag: 'li', cls: 'gravatar hidden', cn: [
				{tag: 'img', src: '{gravatarUrl}'},
				{
					cls: 'wrapper',
					cn: [
						{tag: 'h3', cls: 'title', html:'My Gravatar'},
						{cn:[
							{tag: 'a', cls: 'change gravatar', href: 'http://gravatar.com', html: 'Change', target: '_blank'}
						]}
					]
				}
			]}

		]

	}),

	renderSelectors: {
		list: 'ul.avatar-choices',
		customChoice: 'li.custom',
		editCustomChoice: 'li.custom span.editCustom',
		randomChoice: 'li.random',
		gravatarChoice: 'li.gravatar',
		moreOptions: 'a.more-random-choices'

	},


	initComponent: function(){
		var u = (this.user || $AppConfig.userObject),
			c = u.get('AvatarURLChoices'),
			url = u.get('avatarURL'),
			gravatar;

		Ext.each(c,function(url){
			if(/#gravatar/i.test(url)){gravatar = url;}
			return !gravatar;
		});

		if(!/^data:/i.test(url) && !/@@view$/i.test(url)){
			url = null;
		}


		this.renderData = Ext.apply(this.renderData||{},{
			customAvatarUrl: url || NextThought.model.User.getUnresolved().get('avatarURL'),
			randomAvatarUrl: url? c.last() : u.get('avatarURL'),
			gravatarUrl: gravatar
		});

		this.hasGravatar = Boolean(gravatar);

		this.moreOptionsMenu = Ext.widget('menu',{
			ui: 'nt',
			plain: true,
			showSeparator: false,
			shadow: false,
			frame: false,
			border: false,
			hideMode: 'display',
			defaults: { plain: true },
			layout: 'auto',
			width: 350,
			items: [
				{ xtype:'random-gravatar-picker', cls: 'random-gravatar-picker mini' }
			]
		});

		this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);
		if(!this.hasGravatar){
			this.gravatarChoice.remove();
			delete this.gravatarChoice;
			this.updateLayout();
		}

		var u = $AppConfig.userObject,
			url = u.get('avatarURL'),
			selection = this.gravatarChoice || this.randomChoice;

		if(/^data:/i.test(url) || /@@view$/i.test(url)){
			selection = this.customChoice;
		}
		else {
			this.editCustomChoice.setVisibilityMode(Ext.dom.Element.DISPLAY);
			this.editCustomChoice.hide();
		}

		this.select(selection);

		this.mon( this.list, 'click', this.clickHandler, this);
	},


	clickHandler: function(e){
		e.stopEvent();
		var item = e.getTarget('li', null, true),
			action = e.getTarget('a', null, true),
			url,
			changing = false;


		if(action){
			action = action.getAttribute('href');
			if(action && this[action.substring(1)]){
				this[action.substring(1)]();
				return false;
			}
		}

		if(item === this.customChoice && !this.editCustomChoice.isVisible()){
			this.upload();
			return false;
		}

		if(item) {
			changing = !item.hasCls('selected');
			this.select(item);
		}

		if(changing) {
			url = item.down('img').getAttribute('src');
			if(item === this.customChoice){
				//If we jump back and forth between choices, why can't this be set back to the @@view it was?
				// oh, well...regenerate the data,url
				url = this.imgToDataUrl(item.down('img'));
			}
			//set basic choice (take the value of the image in the choice)
			console.log(url);
			this.makeAChoice(url);
		}

		return false;
	},


	imgToDataUrl: function(img){
		img = Ext.getDom(img);
		var c = document.createElement('canvas');
		c.width = img.naturlWidth || img.width;
		c.height = img.naturlHeight || img.height;
		c.getContext('2d').drawImage(img,0,0);
		return c.toDataURL('imge/png');
	},


	makeAChoice: function(url){
		$AppConfig.userObject.saveField('avatarURL', url,
				function good(){/*no op*/},
				function bad(){ alert({title:'Oops!',msg:'Something went wrong.'}); });
	},


	select: function(li){
		this.el.select('.selected').removeCls('selected');
		li.addCls('selected');
	},


	edit: function(){
		var w = this.up('account-window');
		w.down('picture-editor').editMode();
		w.changeView({
			associatedPanel: 'picture-editor',
			pressed: true
		});

	},

	upload: function(){
		var w = this.up('account-window');
		w.down('picture-editor').reset();
		w.changeView({
			associatedPanel: 'picture-editor',
			pressed: true
		});
	},

	moreRandom: function(){

		this.moreOptionsMenu.showBy(this.moreOptions);

	}


});
