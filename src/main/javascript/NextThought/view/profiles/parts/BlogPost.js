Ext.define('NextThought.view.profiles.parts.BlogPost',{
	extend: 'Ext.Component',
	alias: 'widget.profile-blog-post',

	cls: 'entry',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'controls', cn:[{cls:'favorite'},{cls:'like'}]},
		{ cls: 'title', html:'{title}' },
		{ cls: 'meta', cn: [
			{ tag:'span', cls: 'datetime', html: '{CreatedTime:date("F j, Y")} at {CreatedTime:date("g:m A")}'},
			{ tag:'span', cls: 'state', html: 'Private'}
		]},
		{ cls: 'body' },
		{ cls: 'foot', cn: [
			{ tag:'span', cls: 'comment-count', html: '{PostCount} Comments' },
			{ tag:'span', cls: 'tags', cn:[
				{tag:'tpl', 'for':'story.tags', cn:[
					{tag:'span', cls:'tag', html: '{.}'}
				]}
			]}
		]}
	]),


	moreTpl: Ext.DomHelper.createTemplate([' ',{tag:'a', cls:'more', html:'See More', href:'#'}]),


	renderSelectors: {
		bodyEl: '.body'
	},


	beforeRender: function(){
		this.callParent(arguments);
		var r = this.record;
		if(!r){
			this.destroy();
			return false;
		}

		r = this.renderData = Ext.apply(this.renderData||{}, r.getData());
		r.story = r.story.getData();
		console.log(r.story);
		return true;
	},


	afterRender: function(){
		this.callParent(arguments);
		this.record.get('story').compileBodyContent(this.setContent, this, this.generateClickHandler, 226 );
	},


	setContent: function(html){
		var snip = ContentUtils.getHTMLSnippet(html,300);
		this.bodyEl.update(snip||html);
		if(snip){
			this.moreEl = this.moreTpl.append(this.bodyEl,null,true);
			this.mon(this.moreEl,'click', this.showMore,this);
		}
	},


	generateClickHandler: function(){},


	showMore: function(e){
		e.stopEvent();
		console.log('Clicked More');
	}
});
