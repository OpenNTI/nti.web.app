import { DiscretePages, Placeholder } from '@nti/web-core';
import { List } from '@nti/web-commons';

import Card from '../../../common/Card';

import { Store } from './Store';

export const ListItem = styled.li`
	&:not(:last-of-type) {
		box-shadow: 0 1px 0 0 var(--border-grey-light);
	}

	a {
		text-decoration: none;
	}
`;

export function Pager() {
	const { totalPages, currentPage, loadPage } = Store.useProperties();

	return totalPages <= 1 ? null : (
		<DiscretePages
			mv="xl"
			total={totalPages}
			selected={currentPage}
			load={loadPage}
		/>
	);
}

export const PlaceholderCourse = () => (
	<div
		css={css`
			padding: 1.25rem;
			display: flex;
			flex-direction: row;
		`}
	>
		<Placeholder.Image
			css={css`
				width: 140px;
				height: 103px;
				flex: 0 0 auto;
			`}
		/>
		<div
			css={css`
				flex: 1 1 auto;
				display: flex;
				flex-direction: column;
				padding: 0 1.25rem;
			`}
		>
			<Placeholder.Text
				css={css`
					width: 20%;
					font: normal 600 0.625rem/2 var(--body-font-family);
					margin: 3px 0;
				`}
			/>
			<Placeholder.Text
				css={css`
					font: normal 600 1rem/1.2 var(--legacy-header-font-family);
					max-width: 450px;
				`}
			/>
		</div>
	</div>
);

export const PlaceholderCourses = ({ pageSize: length = 3 } = {}) => (
	<Card>
		<List.Unadorned>
			{Array.from({ length }, (_, index) => (
				<ListItem key={index}>
					<PlaceholderCourse />
				</ListItem>
			))}
		</List.Unadorned>
	</Card>
);
