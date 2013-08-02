Ext.define('NextThought.view.course.dashboard.tiles.TopDiscussions',{
	extend: 'NextThought.view.course.dashboard.tiles.Tile',
	alias: 'widget.course-dashboard-top-discussions',

	statics: {

		getTileFor: function(effectiveDate, course, locationInfo, courseNodeRecord){
			var DQ = Ext.DomQuery,
				items = this.getChildrenNodes(courseNodeRecord),
				refs = DQ.filter(items||[],'[mimeType$=discussion]'),
				i, id, k, m = {};

			if(Ext.isEmpty(refs)){
				return null;
			}

			//lets figure out how many forums we have...
			for(i in refs){
				if(refs.hasOwnProperty(i)){

				i = refs[i];
				id = i.getAttribute('ntiid');

				//normalize the fake-parent id so we can bin. (this key is not a real id!)
				k = ParseUtils.parseNtiid(id);
				if(!k){return;}
				k.specific.typeSpecific = k.specific.typeSpecific.split('.')[0];
				k = k.toString();

				if(!m[k]){
					m[k] = this.create({locationInfo: locationInfo, topicNtiid: id, lastModified: courseNodeRecord.get('date')});
				}

				}
			}

			return Ext.Object.getValues(m);
		}

	},

	cls: 'course-dashboard-discussion-item-list',

	config: {
		topicNtiid: '',
		weight:1.01
	},

	constructor: function(config){

		config.items = [
			{xtype: 'tile-title', heading:'Top Discussions' }
		];

		this.callParent([config]);

		this.view = this.add({
			xtype: 'dataview',
			cls:'scrollbody topics-list',
			ui: 'tile',

			preserveScrollOnRefresh: true,
			selModel: {
				allowDeselect: false,
				deselectOnContainerClick: false
			},
			itemSelector:'.row',
			tpl: Ext.DomHelper.markup({ tag: 'tpl', 'for':'.', cn: [{
				cls: 'row',
				cn: [
					{ cls: 'title', html: '{title}' },
					{ tag: 'span', cls: 'byline', cn: [
						'Posted by ',{tag: 'span', cls: 'name link', html: '{Creator}'}
					]}
				]
			}]}),
			listeners: {
				scope: this,
				select: function(selModel,record){ selModel.deselect(record); },
				itemclick: 'onItemClicked'
			}
		});

		$AppConfig.service.getObject(this.getTopicNtiid(),
				this.onTopicResolved,
				this.onResolveFailure,
				this,
				true
		);
	},


	onItemClicked: function(view, rec /*, dom, index, event, eOpts*/){
		if(!this.topic){
			alert('An error occurred showing this discussion.');
		}
		else{
			this.fireEvent('navigate-to-course-discussion', this.locationInfo.ContentNTIID, this.topic.get('ContainerId'), this.topic.getId());
		}
	},


	onForumResolved: function(forum){
		var sId = 'dashboard-'+forum.getContentsStoreId(),
			store = Ext.getStore(sId) || forum.buildContentsStore({storeId:sId,pageSize: 4});


		this.view.bindStore(store);
		if(!store.loaded){
			store.load();
		}
	},


	onTopicResolved: function(topic){
		if(!/topic$/i.test(topic.get('Class'))){
			if(!/forum$/i.test(topic.get('Class'))){
				console.warn('Got something other than what we were expecting. Was expecting a Topic, got:', topic);
				return;
			}
			this.onForumResolved(topic);
			return;
		}
		this.topic = topic;

		$AppConfig.service.getObject(
				topic.get('ContainerId'),
				this.onForumResolved,
				this.onResolveFailure,
				this,
				true );
	},


	onResolveFailure: function(){
		console.warn('Could not load the object');
	}

});
