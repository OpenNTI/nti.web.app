Ext.define('NextThought.app.content.Actions', {

	requires: [
		'NextThought.util.Content',
		'NextThought.util.PageSource',
		'NextThought.model.TopicNode',
		'NextThought.app.navigation.path.Actions'
	],

	levelLabels: {
		'NaN': '&sect;',
		'0': getString('NextThought.view.content.Navigation.select-chapter'),
		'1': getString('NextThought.view.content.Navigation.select-section')
	},

	MAX_PATH_LENGTH: 2,


	getContentPath: function(ntiid, bundle, parent, rootPageId, rootRoute) {
		var me = this;

		return ContentUtils.getPageID(ntiid, bundle)
			.then(function(page) {
				if (!page) {
					return me.__getContentPathFromLineage(ntiid, bundle, parent, rootPageId, rootRoute);
				}

				return me.__getContentPathFromTOC(page, ntiid, bundle, parent, rootPageId, rootRoute);
			});
	},


	__getContentPathFromLineage: function(ntiid, bundle, parent, rootPageId, rootRoute) {
		var PathActions = NextThought.app.navigation.path.Actions.create();

		return PathActions.getBreadCrumb(ntiid)
			.then(function(path) {
				return path.map(function(part) {
					var route = part.ntiid ? ParseUtils.encodeForURI(part.ntiid) : '';

					part.route = Globals.trimRoute(rootRoute) + '/' + route;

					return part;
				});
			})
			.then(function(path) {
				if (bundle && bundle.getContentBreadCrumb) {
					return bundle.getContentBreadCrumb(path, ntiid, rootPageId, parent);
				}

				return path;
			});
	},


	__getContentPathFromTOC: function(page, ntiid, bundle, parent, rootPageId, rootRoute) {
		var me = this;

		return Promise.all([
				ContentUtils.getLocation(page, bundle),
				ContentUtils.getLineage(page, bundle),
				ContentUtils.getRootForLocation(ntiid, bundle)
			])
			.then(function(results) {
				var location = results[0] && results[0][0],
					lineage = results[1] && results[1][0],
					rootId = results[3],
					leftOvers = [],
					parentNode = lineage.last(),
					rootIdx, allowMenus = true;

				// If passed, lets get the index of the rootId so we know where in the
				// lineage to cut to Re-Root the tree.
				rootIdx = lineage.indexOf(rootId);
				if (rootId && rootIdx < 0) {
					//if there is a rootId, but we did not find it in the lineage, we're
					// out of bounds, and should return without doing anything.
					//return;
					allowMenus = false;
				}

				// If no rootId was sent, then it would return -1 in the indexOf,
				// so because of the above check, we know that if we have an index above
				// -1 we are to cut the lineage at that point.
				if (rootIdx >= 0) {
					leftOvers = lineage.slice(rootIdx);
					leftOverLabels = labels.slice(rootIdx);
					rootIdx += 1;//slice is not inclusive, so push the index one up so that our slice gets the new root.
					lineage = lineage.slice(0, rootIdx);
					labels = labels.slice(0, rootIdx);
					//From this point on the logic should be unchanged... lineage manipulation is complete.
				}

				leftOvers.pop();
				lineage.pop();

				if (!location || !location.NTIID) {
					return;
				}

				return me.buildContentPath(parentNode, location.location, lineage, leftOvers, allowMenus, bundle, rootPageId, rootRoute || '');
			})
			.then(function(path) {
				if (bundle.getContentBreadCrumb) {
					return bundle.getContentBreadCrumb(path, ntiid, rootPageId, parent);
				}

				return path;
			});
	},


	__getLevelLabel: function(level, levelName, useTocLevelName) {
		var label = Boolean(useTocLevelName) ? 'Select ' + levelName : this.levelLabels[level], i;

		if (label) { return label; }

		label = ' Section';

		for (i = 1; i < level; i++) {
			label = 'Sub ' + label;
		}

		return 'Select a ' + label;
	},


	__getFirstTopic: function(node) {
		var topic = node.querySelector('topic');

		if (!topic) {
			console.error('NO first topic');
			throw 'no topic';
		}

		return topic.getAttribute('ntiid');
	},


	buildContentPath: function(parentNode, topic, lineage, leftOvers, allowMenus, bundle, rootPageId, rootRoute) {
		var path = [],
			i = 0, pathLength = 0,
			presentation = this.__getPresentationProps(parentNode, bundle),
			MaxLevel = presentation && presentation.maxLevel || this.MAX_PATH_LENGTH,
			levelName, levelLabel;


		if ((lineage.length + leftOvers.length) <= 1) {
			if (ContentUtils.hasChildren(topic)) {
				levelName = ContentUtils.getFirstTopic(topic).getAttribute('level');
				levelLabel = this.__getLevelLabel(lineage.length, levelName, presentation.useTocLevelName);
				path.push(this.buildContentPathPart(levelLabel, this.__getFirstTopic(topic), parentNode, true, bundle, rootPageId, rootRoute));
			} else {
				path.push(this.buildContentPathPart(this.__getLevelLabel(NaN), topic.getAttribute('ntiid'), null, false, bundle, rootPageId, rootRoute));
			}
		} else if (!bundle.isCourse && ContentUtils.hasChildren(topic)) {
			levelName = ContentUtils.getFirstTopic(topic).getAttribute('level');
			levelLabel = this.__getLevelLabel(lineage.length, levelName, presentation.useTocLevelName);
			path.push(this.buildContentPathPart(levelLabel, this.__getFirstTopic(topic), parentNode, true, bundle, rootPageId, rootRoute));
		}

		for (i; i < MaxLevel && i < lineage.length; i++) {
			path.push(this.buildContentPathPart(null, lineage[i], parentNode, allowMenus, bundle, rootPageId, rootRoute));
			pathLength++;
		}

		for (i = 0; pathLength < MaxLevel && i < leftOvers.length; i++) {
			path.push(this.buildContentPathPart(null, leftOvers[i], parentNode, false, bundle, rootPageId, rootRoute));
			pathLength++;
		}

		return Promise.all(path)
			.then(function(path) {
				return path.reverse();
			});
	},


	buildContentPathPart: function(label, ntiid, parentNode, allowMenus, bundle, rootPageId, rootRoute) {
		if (!ntiid) {
			return Promise.resolve({
				label: label,
				cls: 'no-children locked'
			});
		}

		var me = this;

		return ContentUtils.getLocation(ntiid, bundle)
			.then(function(locations) {
				var l = locations[0], route,
					part = {};

				part.label = (bundle.isCourse) ? l.label || label : label || l.label;
				part.ntiid = l.NTIID;

				if (rootPageId && rootPageId !== l.NTIID) {
					route = ParseUtils.encodeForURI(l.NTIID);
				} else {
					route = '';
				}

				part.route = Globals.trimRoute(rootRoute) + '/' + route;

				if (allowMenus) {
					return me.buildContentPathPartMenu(l, parentNode, bundle, rootRoute)
							.then(function(siblings) {
								part.siblings = siblings;

								if (!siblings.length) {
									part.cls = 'locked';
								} else {
									part.cls = '';
								}

								return part;
							});
				} else {
					part.cls = 'locked';
				}

				return part;
			});
	},


	__getPresentationProps: function(ntiid, bundle) {
		var presentationProps = bundle && bundle.getPresentationProperties && bundle.getPresentationProperties(ntiid),
			numberProps = presentationProps && presentationProps.numbering || {},
			tocProps = presentationProps && presentationProps.toc,
			num = 1, type = '1', sep = '.', suppress = false,
			o = {
				start: numberProps.start || num,
				type: numberProps.type || type,
				seperator: numberProps.separator || sep,
				suppressed: numberProps.suppressed || suppress
			};

		if (tocProps) {
			o.maxLevel = tocProps['max-level'];
			o.useTocLevelName = tocProps['use-toc-level-name'];
		}

		return o;
	},


	styleList: function(num, style) {
		var me = this,
			formatters = {
				'a': me.toBase26SansNumbers,
				'A': function(num) {
					return me.toBase26SansNumbers(num).toUpperCase();
				},
				'i': function(num) {
					return me.toRomanNumeral(num).toLowerCase();
				},
				'I': me.toRomanNumeral
			};

		if (formatters[style]) {
			return formatters[style].apply(me, [num]);
		}

		return num;
	},

	//from: http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
	toRomanNumeral: function(num) {
		var digits, key, roman, i, m = [];

		digits = String(+num).split('');
		key = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
			'', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
			'', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
		roman = '';
		i = 3;
		while (i--) {
			roman = (key[+digits.pop() + (i * 10)] || '') + roman;
		}

		m.length = +digits.join('') + 1;

		return m.join('M') + roman;
	},


	toBase26SansNumbers: function(num) {
		var val = (num - 1) % 26,
			letter = String.fromCharCode(97 + val),
			num2 = Math.floor((num - 1) / 26);
		if (num2 > 0) {
			return this.toBase26SansNumbers(num2) + letter;
		}
		return letter;
	},


	buildContentPathPartMenu: function(location, parentNode, bundle, rootRoute) {
		var me = this,
			p = bundle && bundle.getOutline && bundle.getOutline(),
			currentNode = location ? location.location : null;

		p = p || Promise.resolve(null);


		return Promise.all([
				p,
				ContentUtils.getSiblings(currentNode, bundle)
			]).then(function(results) {
				var outline = results[0],
					siblings = results[1] || [],
					visible,
					presentation = me.__getPresentationProps(parentNode, bundle),
					num = presentation.start || 1;

				currentNode = currentNode.getAttribute('ntiid');

				visible = siblings.map(function(sibling) {
					if (!/topic/i.test(sibling.tagName) || sibling.getAttribute('suppressed') === 'true') {
						return Promise.resolve(null);
					}

					if (outline && false) {
						return outline.isVisible(sibling.getAttribute('ntiid'))
							.then(function(visible) {
								if (!visible) {
									return null;
								}

								return sibling;
							});

					}

					return Promise.resolve(sibling);
				});

				return Promise.all(visible)
					.then(function(results) {
						return results.filter(function(x) { return !!x; });
					})
					.then(function(visible) {
						return visible.map(function(node) {
							var label = node.getAttribute('label'), text;

							text = presentation.suppress ? (me.styleList(num, presentation.type) + presentation.separate + label) : label;

							num += 1;

							return {
								label: text,
								title: text,
								route: Globals.trimRoute(rootRoute) + '/' + ParseUtils.encodeForURI(node.getAttribute('ntiid')),
								ntiid: node.getAttribute('ntiid'),
								cls: node.getAttribute('ntiid') === currentNode ? 'current' : ''
							};
						});
					});
			});
	},


	getContentPageSource: function(ntiid, bundle, root) {
		var getRoot;

		if (root) {
			getRoot = Promise.resolve(root);
		} else {
			getRoot = ContentUtils.getRootForLocation(ntiid, bundle);
		}
		return getRoot
			.then(function(rootId) {
				return ContentUtils.getNavigationInfo(ntiid, rootId, bundle);
			})
			.then(function(navInfo) {
				return NextThought.util.PageSource.create(navInfo);
			});
	},


	getTocStore: function(bundle, root) {
		return bundle.getTocs()
			.then(function(tocs) {
				var toc = tocs[0];

				if (tocs.length > 1) {
					console.warn('Do not know how to handle multiple tocs here yet... Just use the first one');
				}

				return toc;
			})
			.then(function(toc) {
				var rec,
					store = new Ext.data.Store({
						model: NextThought.model.TopicNode,
						data: toc
					});

				store.remove(store.getRange().filter(function(_) {
					return _.get('supressed');
				}));

				if (root) {
					rec = store.getById(root);

					if (rec) {
						rec.set('isRoot', true);
					} else {
						console.warn('Strange, we set a root, but did not find it.');
					}
				}

				return store;
			});
	}
});
