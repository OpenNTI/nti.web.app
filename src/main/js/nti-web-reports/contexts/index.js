import ContextRegistry from './ContextRegistry';
import './course-instance';

export function getContext (object) {
	const Context = ContextRegistry.getInstance().getItemFor(object.MimeType);

	return new Context(object);
}
