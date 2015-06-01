Ext.define('NextThought.app.content.Actions', {

	requires: [
		'NextThought.util.Content',
		'NextThought.util.PageSource'
	],

	levelLabels: {
		'NaN': '&sect;',
		'0': getString('NextThought.view.content.Navigation.select-chapter'),
		'1': getString('NextThought.view.content.Navigation.select-section')
	},

	MAX_PATH_LENGTH: 2,

	getContentPath: function(ntiid, bundle, parent) {
		var me = this;

		return ContentUtils.getPageID(ntiid, bundle)
			.then(function(page) {
				return Promise.all([
					ContentUtils.getLocation(page, bundle),
					ContentUtils.getLineage(page, bundle),
					ContentUtils.getRootForLocation(ntiid, bundle)
				]);
			})
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

				return me.buildContentPath(parentNode, location.location, lineage, leftOvers, allowMenus, bundle);
			})
			.then(function(path) {
				var root = path[0];

				if (parent) {
					path[0] = parent;
				}

				return path;
			});
	},


	buildContentPath: function(parentNode, topic, lineage, leftOvers, allowMenus, bundle) {
		var path = [],
			i = 0, pathLength = 0;

		if ((lineage.length + leftOvers.length) <= 1) {
			if (ContentUtils.hasChildren(topic)) {
				path.push(this.buildContentPathPart(this.levelLabels[lineage.length]), ContentUtils.getFirstTopic(topic), parentNode, true, bundle);
			} else {
				path.push(this.buildContentPathPart(this.levelLabels[NaN]), null, null, false, bundle);
			}
		}

		for (i; i < this.MAX_PATH_LENGTH && i < lineage.length; i++) {
			path.push(this.buildContentPathPart(null, lineage[i], parentNode, allowMenus, bundle));
			pathLength++;
		}

		for (i = 0; pathLength < this.MAX_PATH_LENGTH && i < leftOvers.length; i++) {
			path.push(this.buildContentPathPart(null, leftOvers[i], parentNode, false, bundle));
			pathLength++;
		}

		return Promise.all(path)
			.then(function(path) {
				return path.reverse();
			});
	},


	buildContentPathPart: function(label, ntiid, parentNode, allowMenus, bundle) {
		if (!ntiid) {
			return Promise.resolve({
				label: label,
				cls: 'no-children locked'
			});
		}

		var me = this;

		return ContentUtils.getLocation(ntiid, bundle)
			.then(function(locations) {
				var l = locations[0],
					part = {};

				part.label = label || l.label;
				part.ntiid = l.NTIID;

				if (allowMenus) {
					return me.buildContentPathPartMenu(l, parentNode, bundle)
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
			numberProps = presentationProps && presentationProps.numbering,
			num = 1, type = '1', sep = '.', suppress = false;

		if (numberProps) {
			num = numberProps.start || num;
			type = numberProps.type || type;
			sep = numberProps.separator || sep;
			suppress = numberProps.suppressed || suppress;
		}

		return {
			start: num,
			type: type,
			seperator: sep,
			suppressed: suppress
		};
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


	buildContentPathPartMenu: function(location, parentNode, bundle) {
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

					return outline.isVisible(sibling.getAttribute('ntiid'))
						.then(function(visible) {
							if (!visible) {
								return null;
							}

							return sibling;
						});
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
	}
});
