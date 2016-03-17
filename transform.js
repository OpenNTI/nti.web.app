//A list of some of the variables we are putting on window
var globals = {
	TemplatesForNotes: 'NextThought.app.annotations.note.Templates',
	ReaderPanel: 'NextThought.app.contentviewer.components.Reader',
	ContentAPIRegistry: 'NextThought.app.contentviewer.reader.ContentAPIRegistry',
	CollisionDetection: 'NextThought.app.whiteboard.CollisionDetection',
	NTMatrix: 'NextThought.app.whiteboard.Matrix',
	IdCache: 'NextThought.cache.IdCache',
	LocationMeta: 'NextThought.cache.LocationMeta',
	UserRepository: 'NextThought.cache.UserRepository',
	Toaster: 'NextThought.common.toast.Manager',
	ImageZoomView: 'NextThought.common.ux.ImageZoomView',
	SlideDeck: 'NextThought.common.ux.SlideDeck',
	FilterManager: 'NextThought.filter.FilterManager',
	DelegateFactory: 'NextThought.mixins.Delegation.Factory',
	User: 'NextThought.model.User',
	Socket: 'NextThought.proxy.Socket',
	AnalyticsUtil: 'NextThought.util.Analytics',
	Anchors: 'NextThought.util.Anchors',
	AnnotationUtils: 'NextThought.util.Annotations',
	B64: 'NextThought.util.Base64',
	Color: 'NextThought.util.Color',
	ContentUtils: 'NextThought.util.Content',
	CSSUtils: 'NextThought.util.CSS',
	DomUtils: 'NextThought.util.Dom',
	NTIFormat: 'NextThought.util.Format',
	Globals: 'NextThought.util.Globals',
	LineUtils: 'NextThought.util.Line',
	ObjectUtils: 'NextThought.util.Object',
	ParseUtils: 'NextThought.util.Parsing',
	RangeUtils: 'NextThought.util.Ranges',
	RectUtils: 'NextThought.util.Rects',
	SharingUtils: 'NextThought.util.Sharing',
	StoreUtils: 'NextThought.util.Store',
	TextRangeFinderUtils: 'NextThought.util.TextRangeFinder',
	TimeUtils: 'NextThought.util.Time',
	ContentProxy: 'NextThought.proxy.JSONP',
	JSONP: 'NextThought.proxy.JSONP',
	PageVisibility: 'NextThought.util.Visibility',
	SearchUtils: 'NextThought.util.Search'
};

var path = require('path');


function getPathToClassName(cls) {
	var parts = cls.split('.');

	return 'src/main/js/' + parts.join('/');
}


function getNameFromClassName(cls, length) {
	var parts = cls.split('.');

	length = length || 2;

	parts = parts.reverse();
	parts = parts.slice(0, length);
	parts.reverse();

	parts = parts.map(function(part) {
		return part.charAt(0).toUpperCase() + part.slice(1);
	});

	return parts.join('');
}


function isExtClassProperty(j, property) {
	var valid = true;

	//If its not even a property declaration
	if (property.value.type !== j.Property.name) {
		valid = false;
	}

	//If its not a property on an ObjectExpression
	if (property.parent.value.type !== j.ObjectExpression.name) {
		valid = false;
	}

	var callExpression = property.parent.parent.value;

	if (callExpression.type !== j.CallExpression.name) {
		valid = false;
	}

	var callee = callExpression.callee;

	if (callee.type !== j.MemberExpression.name) {
		valid = false;
	}

	if (callee.object.name !== 'Ext') {
		valid = false;
	}

	if (callee.property.name !== 'define') {
		valid = false;
	}

	return valid;
}


function getRequiresProperty(root, j) {
	var property = root.find(j.Property, {key: {name: 'requires'}, value: {type: j.ArrayExpression.name}});

	return property.filter(isExtClassProperty.bind(this, j));
}


function getMixinsProperty(root, j) {
	var property = root.find(j.Property, {key: {name: 'mixins'}, value: {type: j.ObjectExpression.name}});

	return property.filter(isExtClassProperty.bind(this, j));
}


function getExtendsProperty(root, j) {
	var property = root.find(j.Property, {key: {name: 'extend'}, value: {type: j.Literal.name}});

	return property.filter(isExtClassProperty.bind(this, j));
}


function findRequires(root, j) {
	var props = getRequiresProperty(root, j);
	var imports = [];

	if (props.__length > 0) {
		console.warn('More than one requires property being applied');
	}

	props.forEach(function(prop) {
		var elements = prop.value.value.elements;

		elements = elements || [];

		imports = imports.concat(elements.map(function(element) {
			var cls = element.value;

			return {
				name: getNameFromClassName(cls),
				cls: cls,
				path: getPathToClassName(cls)
			};
		}));
	});

	return imports;
}


function removeRequires(root, j) {
	var props = getRequiresProperty(root, j);

	if (props.__length > 0) {
		console.warn('More than one requires property being applied');
		return;
	}

	props.remove();
}


function findMixins(root, j) {
	var props = getMixinsProperty(root, j);
	var imports = [];

	props.forEach(function(prop) {
		var properties = prop.value.value.properties;

		properties = properties || [];

		imports = imports.concat(properties.map(function(p) {
			var cls = p.value.value;

			return {
				name: getNameFromClassName(cls),
				cls: cls,
				path: getPathToClassName(cls)
			};
		}));
	});

	return imports;
}


function findExtends(root, j) {
	var props = getExtendsProperty(root, j);
	var imports = [];

	props.forEach(function(prop) {
		var value = prop.value.value.value;

		if (value) {
			imports.push({
				name: getNameFromClassName(value),
				cls: value,
				path: getPathToClassName(value)
			});
		}
	});

	return imports;
}


function findGlobals(fileSource) {
	var keys = Object.keys(globals);
	var g = [];

	keys.forEach(function(key) {
		var regex = RegExp(key + '\.', 'gm');
		var	matches = fileSource.match(regex);

		if (matches && matches.length) {
			g.push({
				name: key,
				cls: globals[key],
				path: getPathToClassName(globals[key])
			});
		}
	});

	return g;
}

function findExtReference(fileSource) {
	var regex = /Ext/g;
	var matches = fileSource.match(regex);

	return matches;
}


var isExt = /^Ext/;


function isExtComponent(imp) {
	return !isExt.test(imp.cls);
}

var importTpl = 'import {name} from \'{path}\'';

function buildImportStatement(imp, clsPath) {
	return importTpl.replace('{name}', imp.name).replace('{path}', path.relative(clsPath, imp.path));
}

//Useful links:
//https://github.com/facebook/jscodeshift
//https://github.com/benjamn/recast
//http://felix-kling.de/esprima_ast_explorer/
//https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
//https://github.com/benjamn/ast-types
//https://github.com/facebook/react/blob/master/packages/react-codemod/transforms/react-to-react-dom.js
module.exports = function(fileInfo, api) {
	const j = api.jscodeshift;
	const root = j(fileInfo.source);
	var imports = [];

	imports = imports.concat(findGlobals(fileInfo.source));
	imports = imports.concat(findExtends(root, j));
	imports = imports.concat(findMixins(root, j));
	imports = imports.concat(findRequires(root, j));

	imports = imports.filter(isExtComponent);

	imports = imports.map(function(imp) {
		return buildImportStatement(imp, fileInfo.path);
	});

	if (findExtReference(fileInfo.source)) {
		imports.unshift('import Ext from \'extjs\'');
	}

	if (imports.length) {
		imports.push('\n\n');
	}

	removeRequires(root, j);

	return imports.join(';\n') + root.toSource({useTabs: true});
};
