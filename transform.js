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


function findRequires(root, j) {
	var identifier = root.find(j.Identifier, {name: 'requires'});
	var	imports = [];

	identifier.forEach(function(i) {
		var property = i.parent;
		var elements = property && property.value.value.elements;

		elements = elements || [];

		imports = imports.concat(elements.map(function(element) {
			var cls = element.raw;

			cls = cls.replace(/\'/g, '');

			return {
				name: getNameFromClassName(cls),
				cls: cls,
				path: getPathToClassName(cls)
			};
		}));

		//TODO figure out how to remove the requires property...
	});

	return imports;
}


function removeRequires(fileSource) {

}


function findMixins(root, j) {
	var identifier = root.find(j.Identifier, {name: 'mixins'});
	var	imports = [];

	identifier.forEach(function(i) {
		var property = i.parent;
		var properties = property && property.value.value && property.value.value.properties;

		properties = properties || [];

		imports = imports.concat(properties.map(function(prop) {
			var cls = prop.value.value;

			return {
				name: getNameFromClassName(cls),
				cls: cls,
				path: getPathToClassName(cls)
			};
		}));
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

var importTpl = 'import {name} from "{path}"';

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
	imports = imports.concat(findMixins(root, j));
	imports = imports.concat(findRequires(root, j));

	imports = imports.map(function(imp) {
		return buildImportStatement(imp, fileInfo.path);
	});

	console.log(imports);
};
