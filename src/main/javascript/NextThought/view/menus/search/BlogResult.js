Ext.define('NextThought.view.menus.search.BlogResult', {
	extend: 'NextThought.view.menus.search.Result',
	alias: ['widget.search-result-forums-personalblogentrypost', 'widget.search-result-forums-personalblogcomment'],
	cls: 'search-result search-result-post',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'tpl', 'if': 'isPost', cn: [
			{cls: 'title', cn: [
				{tag: 'span', html: "{title}"},
				{tag: 'tpl', 'if': 'name', cn: [
					{cls: 'by', html: 'By {name}'}
				]},
				{tag: 'tpl', 'if': 'tags', cn: [
					{cls: 'tags', html: '{tags}'}
				]}
			]},
			{
				cls: 'wrap',
				cn: [
					{cls: 'fragments', cn: [
						{tag: 'tpl', 'for': 'fragments', cn: [
							{cls: 'fragment', ordinal: '{#}', html: '{.}'}
						]}
					]}
				]
			}
		]},
		{tag: 'tpl', 'if': 'isComment', cn: [
			{cls: 'title', cn: [
				{cls: 'commenter', html: "{name} commented on:"},
				{tag: 'span', html: "{title}"}
			]},
			{cls: 'wrap', cn: [
				{cls: 'fragments', cn: [
					{tag: 'tpl', 'for': 'fragments', cn: [
						{cls: 'fragment', ordinal: '{#}', html: '{.}'}
					]}
				]}
			]}
		]}
	]),


	isComment: function (hit) {
		return (/.*?personalblogcomment$/).test(hit.get('MimeType'));
	},


	fillInData: function () {
		var me = this,
			hit = me.hit,
			containerId = hit.get('ContainerId'),
			name = hit.get('Creator'),
			comment = this.isComment(hit);
		me.comment = comment;

		me.renderData = Ext.apply(me.renderData || {}, {
			title: 'Resolving...',
			name: name,
			isComment: comment,
			isPost: !comment,
			fragments: Ext.pluck(hit.get('Fragments'), 'text')
		});

		function finish(r) {
			var tags = r.get('headline').get('tags'), tagMsg;
			me.renderData = Ext.apply(me.renderData, r.getData());

			//check how many tags there are and display accordingly
			if (Ext.isEmpty(tags)) {
				//no tags display nothing
				tagMsg = false;
			} else {
				//comma seperate the tags
				tagMsg = ((tags.length > 2) ? "Tags" : "Tag") + ": " + tags.join(", ");
			}

			me.renderData.tags = tagMsg;

			me.record = r;
			if (isMe(name)) {
				me.renderData.name = (comment) ? 'I' : 'me';
				me.user = $AppConfig.userObject;
			}
			if (!isMe(name) && name) {
				UserRepository.getUser(name, function (user) {
					var n = user.getName();
					me.user = user;

					me.renderData.name = n;
					if (me.rendered) {
						me.renderTpl.overwrite(me.el, me.renderData);
					}
				});
			}
			else if (me.rendered) {
				me.renderTpl.overwrite(me.el, me.renderData);
			}
		}

		function fail() {
			console.log('there was an error retrieving the object.', arguments);
		}

		$AppConfig.service.getObject(containerId, finish, fail, me);
	},

	doClicked: function (fragIdx) {
		this.fireEvent('click-blog-result', this, fragIdx, this.comment);
	}
});
