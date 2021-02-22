module.exports = exports = function getCssPropertyValue(
	domNode,
	propName,
	fallback
) {
	try {
		return (
			global.getComputedStyle(domNode).getPropertyValue(propName) ||
			fallback
		);
	} catch (e) {
		return fallback;
	}
};
