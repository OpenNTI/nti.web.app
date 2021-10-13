
import InvalidRows from './InvalidRows';
import String from './String';
import Unknown from './Unknown';

const TYPES = [String, InvalidRows, Unknown];

export default function getError(error) {
	const Cmp = TYPES.find(t => t.handles(error));

	return !Cmp ? null : <Cmp error={error} />;
}
