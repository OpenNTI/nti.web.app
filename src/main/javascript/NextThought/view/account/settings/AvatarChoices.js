Ext.define('NextThought.view.account.settings.AvatarChoices',{
	extend: 'Ext.Component',
	alias: 'widget.avatar-choices',

	requires: [
		'NextThought.view.account.settings.RandomGravatarPicker',
		'NextThought.view.whiteboard.Utils'
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
		customChoiceImage: 'li.custom img',
		editCustomChoice: 'li.custom span.editCustom',
		randomChoice: 'li.random',
		randomChoiceImage: 'li.random img',
		gravatarChoice: 'li.gravatar',
		moreOptions: 'a.more-random-choices'

	},


	initComponent: function(){
		var me = this,
			u = (me.user || $AppConfig.userObject),
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


		me.renderData = Ext.apply(me.renderData||{},{
			customAvatarUrl: url || NextThought.model.User.getUnresolved().get('avatarURL'),
			randomAvatarUrl: url? c.last() : u.get('avatarURL'),
			gravatarUrl: gravatar
		});

		me.hasGravatar = Boolean(gravatar);

		me.moreOptionsMenu = Ext.widget('menu',{
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

		me.mon(me.moreOptionsMenu.down('random-gravatar-picker'),'new-avatar',this.updateRandromSelection,this);
		me.callParent(arguments);

		me.on('destroy', me.moreOptionsMenu.destroy, me.moreOptionsMenu);
	},


	afterRender: function(){
		this.callParent(arguments);
		if(!this.hasGravatar){
			this.gravatarChoice.remove();
			delete this.gravatarChoice;
			this.updateLayout();
		}

		var me = this,
			u = $AppConfig.userObject,
			url = u.get('avatarURL'),
			selection = me.gravatarChoice || me.randomChoice;

		if(/^data:/i.test(url) || /@@view$/i.test(url)){
			selection = me.customChoice;
		}
		else {
			me.editCustomChoice.setVisibilityMode(Ext.dom.Element.DISPLAY);
			me.editCustomChoice.hide();
		}

		me.select(selection);

		me.mon( me.list, 'click', me.clickHandler, me);

		me.mon(me.up('window').down('picture-editor'),'saved',function(url){
			me.select(me.customChoice);
			me.customChoiceImage.set({src:url});
			me.editCustomChoice.show();
		});
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

		if(item) {
			changing = !item.hasCls('selected');
			this.select(item);
		}

		if(changing) {
			url = item.down('img').getAttribute('src');
			if(item === this.customChoice && !/^data/i.test(url)){
				//If we jump back and forth between choices, why can't this be set back to the @@view it was?
				// UPDATE: if its a new @@view from the response of setting, it couldn't be set back (if the user
				// toggled back&forth between random and uploaded)
				// oh, well...regenerate the dataurl
				url = this.imgToDataUrl(item.down('img'));
			}
			//set basic choice (take the value of the image in the choice)
			// console.log(url);
			this.makeAChoice(url);
		}

		return false;
	},


	makeAChoice: function(url){
		var el = this.getEl(),
			u = $AppConfig.userObject;
		if(Ext.Array.indexOf(u.get('AvatarURLChoices'), url) >= 0 || /^data/i.test(url) || /@@view$/i.test(url)){
			el.mask('Saving...');
			u.saveField('avatarURL', url,
				function good(){ el.unmask(); },
				function bad(){ el.unmask(); alert({title:'Oops!',msg:'Something went wrong.'}); });
		}
	},


	updateRandromSelection: function(url){
		this.randomChoiceImage.set({src:url});
		this.select(this.randomChoice);
	},


	select: function(li){
		this.el.select('.selected').removeCls('selected');
		li.addCls('selected');
	},


	edit: function(){
		var w = this.up('account-window');
		w.down('picture-editor').editMode(this.customChoiceImage.getAttribute('src'));
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
}, function(){
	this.prototype.imgToDataUrl = WBUtils.imgToDataUrl;
});
