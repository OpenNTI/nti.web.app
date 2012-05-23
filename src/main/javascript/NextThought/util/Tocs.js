Ext.define('NextThought.util.Tocs',{
	singleton: true,


	selectNodeParent: function(query, dom){
		var node = Ext.dom.Query.selectNode(query,dom);
		return node? node.parentNode : null;
	},


	toJSONTreeData: function(tocXML){
/*
		root: {
		    expanded: true,
		    text: "My Root",
		    children: [
		        { text: "Child 1", leaf: true },
		        { text: "Child 2", expanded: true, children: [
		            { text: "GrandChild", leaf: true }
		        ] }
		    ]
		}
*/

		var root = tocXML.documentElement, tree = { children: [] };

		this.renderBranch(tree.children,root);

		if(tree.children.length < 2){
			tree.children.first().expanded = true;
		}

		tree.children.unshift({
			text: 'Title Page',
			ntiid: root.getAttribute('ntiid'),
			leaf: true
		});

		return tree;
	},


	/** @private */
	renderBranch: function(leafs, node, selectedNode) {
		if(!node) {
			return;
		}
		Ext.each(node.childNodes,function(v){
			try {
				var leaf;
				if(v.nodeName==="#text" || v.nodeName==='xml' || !v.getAttribute('ntiid') ) {
					return;
				}
				leaf = this.renderLeafFromTopic(v, v===selectedNode);
				if(leaf){
					leafs.push(leaf);
				}
			}
			catch(e){
				console.warn('TocUtils: ',v, e.message);
			}
		}, this);
	},


	/** @private */
	renderLeafFromTopic: function(topicNode, selected) {

		var label = topicNode.getAttribute("label"),
				href = topicNode.getAttribute("href"),
				ntiid = topicNode.getAttribute('ntiid'),
				leaf = this.renderLeaf(label, href, ntiid, selected),
				list;

		if(leaf && topicNode.childNodes.length > 0){
			list = [];
			leaf.children = list;
			this.renderBranch(list,topicNode);
			if(list.length===0){
				delete leaf.children;
			}
			else {
				leaf.children.unshift({
					text: 'Index',
					ntiid: ntiid,
					leaf: true
				});
			}
		}

		if(leaf.children === undefined){
			leaf.leaf=true;
		}

		return leaf;
	},


	/** @private */
	renderLeaf: function(labelText, href, ntiid, selected) {
		if(!href || !labelText){
			return null;
		}

		var leaf = {
			text: labelText,
			ntiid: ntiid,
//			expanded: true,
			singleClickExpand: true
		};

		if(selected){
			leaf.checked = true;
		}

		return leaf;
	}


},function(){
	window.TocUtils = this;
});
