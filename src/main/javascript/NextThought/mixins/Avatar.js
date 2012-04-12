Ext.define('NextThought.mixins.Avatar',{
	requires:[
		'NextThought.util.Globals'
	],

	statics: {
		avatarTemplate: new Ext.XTemplate(
			'<div class="avatar" id="{[this.getAvatar(values)]}" {[this.getSize(values.size)]}>',
				'<img class="icon" {[this.getSize(values.size,true)]}/>',
				'<img src="{[Ext.BLANK_IMAGE_URL]}" alt="Offline" class="presence offline" {[this.getPresenceSize(values.size)]}>',
				'<img src="{[Ext.BLANK_IMAGE_URL]}" alt="Online" class="presence online" {[this.getPresenceSize(values.size)]}>',
			'</div>',
			{
				getAvatar: function(values){
					var me = this,
						id = 'avatar-'+guidGenerator(),
						cmp = values.ownerCt,
						initialRun = setTimeout(function(){
							console.log(id, 'did not fillIn', values);
						},3000);

					if(!cmp){
						console.log(values);
					}

					function fillIn(user){
						var el = Ext.get(id),
							u = Ext.isArray(user) ? user[0]: user,
							name,
							presence;

						if(!el){
							if(initialRun){
								setTimeout(function(){fillIn.call(me,user);},50);
							}
							return;
						}

						if(initialRun){
							clearTimeout(initialRun);
							initialRun = undefined;
						}

						presence = u.get('Presence')||'';
						name = u.getName();

						el.removeCls(['offline','online']);
						el.addCls(presence.toLowerCase());
						el.down('img.icon').set({
							src: u.get('avatarURL'),
							alt: name,
							title: name
						});

						//handle changes
						u.on('changed', fillIn, me, {single: true});
					}

					UserRepository.prefetchUser(values.user,fillIn,me);

					return id;
				},

				getSize: function(size, useAttributes){
					return Ext.String.format( useAttributes
							? 'width="{0}" height="{0}"'
							: 'style="width: {0}px; height: {0}px;"', +size);
				},

				getPresenceSize: function(size){
					return Ext.String.format( 'width={0} height={0}', 16 );
				}
			})
	},


	initAvatar: function(user, size){
		this.renderSelectors = Ext.applyIf(this.renderSelectors||{},{
			avatar: 'div.avatar',
			icon: 'div img.icon',
			offline: 'img.offline',
			online: 'img.online'
		});
		this.renderData.ownerCt = this;
		this.renderData.size = size||16;
		this.renderData.user = user;
	},


	removeAvatar: function(){
		this.avatar.remove();
	},


	getAvatarComponent: function(size,user){
		size = size || 16;
		var c = Ext.widget('component', {
			renderTpl: NextThought.mixins.Avatar.avatarTemplate,
			renderData: {
				user: user,
				size: size
			},
			margin: '0 5px 5px 0',
			style: {
				display: 'inline-block'
			},
			width: size,
			height: size,
			renderSelectors: this.renderSelectors
		});

		c.renderData.ownerCt = c;
		return c;

	}



},function(){
	Ext.XTemplate.registerSubtemplate('Avatar',this.avatarTemplate);
});
