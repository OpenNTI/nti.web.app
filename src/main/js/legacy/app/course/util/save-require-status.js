const DEFAULT = 'Default';
const REQUIRED = 'Required';
const OPTIONAL = 'Optional';

module.exports = exports = async function saveRequireStatus (course, targetId, value) {
	const completionPolicy = course.get('CompletionPolicy');

	const requirementLink = completionPolicy.getLink('Required');
	const nonRequirementLink = completionPolicy.getLink('NotRequired');

	const encodedID = encodeURIComponent(targetId);

	if(value === REQUIRED) {
		await Service.put(requirementLink, {
			ntiid: targetId
		});

		await Service.requestDelete(nonRequirementLink + '/' + encodedID);
	}
	else if(value === OPTIONAL) {
		await Service.put(nonRequirementLink, {
			ntiid: targetId
		});

		await Service.requestDelete(requirementLink + '/' + encodedID);
	}
	else if(value === DEFAULT) {
		await Service.requestDelete(requirementLink + '/' + encodedID);
		await Service.requestDelete(nonRequirementLink + '/' + encodedID);
	}

	course.get('CompletionPolicy').fireEvent('requiredValueChanged', { ntiid: targetId, value });
};
