Ext.define('NextThought.mixins.LikeFavoriteActions',{

	constructor: function(){
		function onAfterRender(){
			var me = this;

			me.updateLikeAndFavoriteFromRecord();

			if( me.liked ){  me.mon(me.liked, 'click', me.likeClicked, me); }
			if( me.favorites ){ me.mon(me.favorites,'click', me.favoriteClicked, me); }
		}

		this.on('afterrender',onAfterRender,this,{single:true});
	},


	likeClicked: function(){
		var rec = this.getRecord();
		if(!rec){
			console.warn('No record to like', this);
			return;
		}
		rec.like(this);
	},


	favoriteClicked: function(){
		var rec = this.getRecord();
		if(!rec){
			console.warn('No record to favorite', this);
			return;
		}
		rec.favorite(this);
	},


	updateLikeAndFavoriteFromRecord: function(){
		var rec = this.getRecord(),
			me = this;
		if( rec.parent ){
			if( me.favorites ){
				me.favorites.setVisibilityMode(Ext.dom.Element.DISPLAY);
				me.favorites.hide();
			}
			if( me.favoritesSpacer ){
				me.favoritesSpacer.show();
			}
		}

		if( !rec.isLikeable() ){
			me.liked.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
		}
		if( !rec.isFavoritable() ){
			me.favorites.setVisibilityMode(Ext.dom.Element.DISPLAY).hide();
		}

	},


	tearDownLikeAndFavorite: function(){
		if( this.liked ){
			this.mun(this.liked, 'click', function(){ rec.like(this); }, this);
			this.liked.remove();
		}
		if( this.favorites ){
			this.mon(this.favorites,'click', function(){ rec.favorite(this); },this);
			this.favorites.remove();
		}

		this.stopListeningForLikeAndFavoriteChanges(this.record);
	},


	getRecord: function(){
		return this.record;
	},


	listenForLikeAndFavoriteChanges: function(record){
		record.addObserverForField(this, 'favorited', this.markAsFavorited, this);
		record.addObserverForField(this, 'liked', this.markAsLiked, this);
		record.addObserverForField(this, 'LikeCount', this.updateLikeCount, this);
	},

	stopListeningForLikeAndFavoriteChanges: function(record){
		record.removeObserverForField(this, 'favorited', this.markAsFavorited, this);
		record.removeObserverForField(this, 'liked', this.markAsLiked, this);
		record.removeObserverForField(this, 'LikeCount', this.updateLikeCount, this);
	},


	reflectLikeAndFavorite: function(record){
		if (this.liked){
			this.updateLikeCount(record);
            this.markAsLiked(record.isLiked());
        }

        if(this.favorites){
			this.markAsFavorited(record.isFavorited());
        }
	},


	updateLikeCount: function(record){
		if(this.liked){
			record = record&&record.isModel? record : this.getRecord();
			this.liked.update(record.getFriendlyLikeCount());
		}
	},


	markAsLiked: function(field, value){
		var liked = value === undefined ? field : value,
			method = liked ? 'addCls' : 'removeCls';
		if(!this.liked){
			return;
		}
		this.liked[method]('on');
		this.liked.set({'title': liked ? 'Liked' : 'Like'});
	},


	markAsFavorited: function(field, value){
		var favorited = value === undefined ? field : value,
			method = favorited ? 'addCls' : 'removeCls';
		if(!this.favorites){
			return;
		}
		this.favorites[method]('on');
		this.favorites.set({'title': favorited ? 'Bookmarked' : 'Add to bookmarks'});
	}
});
