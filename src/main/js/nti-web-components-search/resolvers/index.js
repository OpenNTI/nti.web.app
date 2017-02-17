import Base from './Base';
// import Note from './Note';
// import Video from './Video';
// import Reading from './Reading';
// import Highlight from './Highlight';
// import Blog from './Blog';
// import Chat from './Chat';
// import Forum from './Forum';
// import RelatedWorkRef from './RelatedWorkRef';
// import Timeline from './Timeline';
// import TranscriptResult from './TranscriptResult';

const OBJECT = new WeakMap();

const HANDLERS = [];

function getTargetForHit (hit) {
	const {TargetMimeType:targetMimeType} = hit;
	let target;

	for (let h of HANDLERS) {
		if (h.handles[targetMimeType]) {
			target = h;
			break;
		}
	}

	return target;
}

function getObject (hit) {
	const target = getTargetForHit(hit);

	if (!OBJECT[hit]) {
		OBJECT[hit] = target && target.resolveObject ? target.resolveObject(hit) : Base.resolveObject(hit);
	}

	return OBJECT[hit];
}

export function resolveTitle (hit) {
	const target = getTargetForHit(hit);

	return getObject(hit).then((obj) => {
		return target && target.resolveTitle ? target.resolveTitle(obj, hit) : Base.resolveTitle(obj, hit);
	});
}

export function resolveFragments (hit) {
	const target = getTargetForHit(hit);

	return getObject(hit).then((obj) => {
		return target && target.resolveFragments ? target.resolveFragments(obj, hit) : Base.resolveFragments(obj, hit);
	});
}

export function resolvePath (hit, getBreadCrumb) {
	const target = getTargetForHit(hit);

	return getObject(hit).then((obj) => {
		return target && target.resolvePath ? target.resolvePath(obj, hit, getBreadCrumb) : Base.resolvePath(obj, hit, getBreadCrumb);
	});
}

export function resolveContainerID (hit) {
	const target = getTargetForHit(hit);

	return getObject(hit).then((obj) => {
		return target && target.resolveContainerID ? target.resolveContainerID(obj, hit) : Base.resolveContainerID(obj, hit);
	});
}

export function resolveNavigateToSearchHit (hit, fragment) {
	const target = getTargetForHit(hit);

	return getObject(hit).then((obj) => {
		return target && target.navigateToSearchHit ? target.resolveNavigateToSearchHit(obj, hit) : Base.resolveNavigateToSearchHit(obj, hit, fragment);
	});
}
