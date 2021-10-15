import { ComponentRegistry } from './Registry';

import './EmptySet';
import './Group';

export const getCmp = type => {
	return ComponentRegistry.getInstance().getItem(type);
};
