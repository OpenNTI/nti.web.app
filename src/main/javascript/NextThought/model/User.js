Ext.define(	'NextThought.model.User', {
	extend: 'NextThought.model.Base',
	idProperty: 'Username',
	resolveUsers: true,
	fields: [
		{ name: 'lastLoginTime', type: 'date', dateFormat: 'timestamp' },
		{ name: 'NotificationCount', type: 'int' },
		{ name: 'Username', type: 'string' },
		{ name: 'Presence', type: 'string' },
		{ name: 'alias', type: 'string' },
		{ name: 'email', type: 'string' },
		{ name: 'realname', type: 'string' },
		{ name: 'avatarURL', type: 'AvatarURL' },
		{ name: 'AvatarURLChoices', type: 'AvatarURLList' },
		{ name: 'accepting', type: 'UserList' },
		{ name: 'ignoring', type: 'UserList' },
		{ name: 'status', type: 'string' },
        { name: 'opt_in_email_communication', type: 'boolean' },
		{ name: 'following', type: 'UserList' },
		{ name: 'Communities', type: 'UserList' },
		{ name: 'displayName', convert: function(v,r){return r.getName();}},
		//We don't want to be turning null into empty strings so we must set useNull
		//Failure to do so creates havok with server side validation and also
		//results in us potentially unexpectedly changing fields.
		//TODO should probably do this for all fields of any type (create our own type maybe?), trying to minimize the impact
		//of this change right now so only tweaking a few fields
		{ name: 'affiliation', type: 'string', useNull: true},
		{ name: 'role', type: 'string', useNull: true},
		{ name: 'location', type: 'string', useNull: true},
		{ name: 'home_page', type: 'string', useNull: true}
	],

	summaryObject: true,

	constructor: function() {
		var r = this.callParent(arguments);
		//romeconsole.error('User created', this);
		UserRepository.updateUser(this);
		return r;
	},


	getCommunities: function(){
		var r = [], u;

		Ext.each($AppConfig.userObject.get('Communities'),function(c){
			var field = 'Username';

			if(/^everyone$/i.test(c)){ return; }

			//DFLs come back in communities but there usernames are ntiids.
			if(ParseUtils.parseNtiid(c)){
				field = 'NTIID';
			}

			u = UserRepository.store.findRecord(field,c,0,false,true,true);
			if(u){
				r.push(u);
			}
			else{
				console.warn('Dropping unresolvable community: '+Ext.encode(c));
			}

		});
		return r;
	},


	getName: function(){
		return this.get('alias') || this.get('realname') || this.get('Username');
	},


	getProfileUrl: function(){
		var u = encodeURIComponent( this.get('Username') );
		return '#!profile/'+u;
	},


	goToProfile: function(){
		window.location.hash = this.getProfileUrl();
	},


    save: function(ops){
        Ext.Ajax.request(Ext.apply({
            url: this.getLink('edit'),
            method: 'PUT',
            jsonData: this.getData()
        },ops));
    },

	isUnresolved: function(){
		return this.get('status') === 'Unresolved';
	},


	statics: {

		getUnresolved: function(username){
			return new NextThought.model.User({
				Username: username,
				avatarURL: 'resources/images/icons/unresolved-user.png',
				affiliation: 'Unknown',
				status: 'Unresolved',
				Presence: 'Offline'
			},username);
		},


		getProfileIdFromHash: function(hash){
			var re = /^#!profile\/([^\/]*)$/i, o = re.exec(hash);
			return o ? decodeURIComponent(o[1]) : null;
		}

	}

},function(){
	window.User = this;
});
