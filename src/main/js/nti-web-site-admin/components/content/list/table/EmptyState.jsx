import cx from 'classnames';

import { scoped } from '@nti/lib-locale';

const t = scoped('nti-site-admin.content.list.table.EmptyState', {
	emptyMessage: 'There is no content',
});

function EmptyStatePropMap({ className, message, ...props }) {
	return {
		...props,
		className: cx('empty-state', className),
		children: message || t('emptyMessage'),
	};
}

export const EmptyState = styled('div').attrs(EmptyStatePropMap)`
	font-size: 2rem;
	color: var(--tertiary-grey);
	text-align: center;
	margin-top: 1.75rem;
`;

export default EmptyState;
