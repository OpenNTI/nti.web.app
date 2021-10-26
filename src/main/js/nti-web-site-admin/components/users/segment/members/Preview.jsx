import { ErrorMessage, Box } from '@nti/web-core';
import { DataContext } from '@nti/web-core/data';

import { MembersPreviewStore } from './Store';
import { MembersCount, MembersCountPlaceholder } from './parts/Count';
import { MembersList } from './parts/List';
import { MembersExport } from './parts/Export';

const HeaderContainer = styled(Box).attrs({ p: 'sm' })`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--border-grey-light);
`;

const Placeholder = () => (
	<>
		<HeaderContainer>
			<MembersCountPlaceholder />
		</HeaderContainer>
	</>
);

function PreviewHeader() {
	const { href } = MembersPreviewStore.useProperties();

	return (
		<HeaderContainer>
			<MembersCount />
			<MembersExport href={href} />
		</HeaderContainer>
	);
}

export function MembersPreview({ segment, filterSet }) {
	const store = MembersPreviewStore.useStore({ segment, filterSet });

	return (
		<DataContext
			store={store}
			fallback={Placeholder}
			error={<ErrorMessage />}
		>
			<PreviewHeader />
			<MembersList />
		</DataContext>
	);
}
