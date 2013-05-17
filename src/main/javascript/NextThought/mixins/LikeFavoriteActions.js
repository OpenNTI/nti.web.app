Ext.define('NextThought.mixins.LikeFavoriteActions',{

	constructor: function(){
		var me = this;

		function onAfterRender(){
			me.updateLikeAndFavoriteFromRecord();

			if( me.liked ){  me.mon(me.liked, 'click', me.likeClicked, me); }
			if( me.favorites ){ me.mon(me.favorites,'click', me.favoriteClicked, me); }

			me.reflectLikeAndFavorite(this.getRecord());
			me.listenForLikeAndFavoriteChanges(this.getRecord());
		}

		this.on('afterrender',onAfterRender,this,{single:true});
		this.on('destroy',this.tearDownLikeAndFavorite,this);
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


	updateLikeAndFavoriteFromRecord: function(record){
		var rec = record || this.getRecord(), fnName,
			me = this;

		if(!rec){return;}

		if( rec.parent ){
			if( me.favorites ){
				me.favorites.setVisibilityMode(Ext.dom.Element.DISPLAY);
				me.favorites.hide();
			}
			if( me.favoritesSpacer ){
				me.favoritesSpacer.show();
			}
		}

		if( me.liked ){
			fnName = rec.isLikeable() ? 'show' :  'hide';
			me.liked.setVisibilityMode(Ext.dom.Element.DISPLAY)[fnName]();
		}

		if( me.favorites ){
			fnName = rec.isFavoritable() ? 'show' :  'hide';
			me.favorites.setVisibilityMode(Ext.dom.Element.DISPLAY)[fnName]();
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

		//Cleanup
		delete this.liked;
		delete this.favorites;
		this.stopListeningForLikeAndFavoriteChanges(this.record);
	},


	getRecord: function(){
		return this.record;
	},


	listenForLikeAndFavoriteChanges: function(record){
		if(!record){return;}
		record.addObserverForField(this, 'favorited', this.markAsFavorited, this);
		record.addObserverForField(this, 'liked', this.markAsLiked, this);
		record.addObserverForField(this, 'LikeCount', this.updateLikeCount, this);
	},

	stopListeningForLikeAndFavoriteChanges: function(record){
		if(!record){return;}
		record.removeObserverForField(this, 'favorited', this.markAsFavorited, this);
		record.removeObserverForField(this, 'liked', this.markAsLiked, this);
		record.removeObserverForField(this, 'LikeCount', this.updateLikeCount, this);
	},


	reflectLikeAndFavorite: function(record){
		this.updateLikeAndFavoriteFromRecord(record);
		if (this.liked){
			this.updateLikeCount(record);
            this.markAsLiked(record && record.isLiked());
        }

        if(this.favorites){
			this.markAsFavorited(record && record.isFavorited());
        }
	},


	updateLikeCount: function(record){
		if(this.liked){
			record = record&&record.isModel? record : this.getRecord();
			if(record){
				this.liked.update(record.getFriendlyLikeCount());
			}
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
