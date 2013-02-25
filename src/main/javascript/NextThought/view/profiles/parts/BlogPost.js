Ext.define('NextThought.view.profiles.parts.BlogPost',{
	extend: 'Ext.Component',
	alias: 'widget.profile-blog-post',


	renderTpl: Ext.DomHelper.markup(
		{ cls: 'entry', 'data-ntiid':'{NTIID}', cn: [
			{ cls: 'title', html:'{title}' },
			{ cls: 'meta', cn: [
				{ tag:'span', cls: 'comment-count', html: '{PostCount} Comments' },
				{ tag:'span', cls: 'datetime', html: '{CreatedTime:date("F j, Y")}'},
				{ tag:'span', cls: 'datetime', html: '{CreatedTime:date("g:m A")}'}
			]}
		]}
	),


	beforeRender: function(){
		this.callParent(arguments);
		var r = this.record;
		if(!r){
			this.destroy();
			return false;
		}

		r = this.renderData = Ext.apply(this.renderData||{}, r.getData());
		r.story = r.story.getData();

		return true;
	}

});
