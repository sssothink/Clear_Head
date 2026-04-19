import { Button } from "@/shared/ui/button";

type GoalActionsProps = {
	isEdit: boolean;
	onSubmit: () => void;
	onDelete?: () => void;
	disableSubmit?: boolean;
};

export function GoalActions({
	isEdit,
	onSubmit,
	onDelete,
	disableSubmit = false,
}: GoalActionsProps) {
	return (
		<div className="goal-actions">
			<Button type="button" onClick={onSubmit} disabled={disableSubmit}>
				{isEdit ? "Update" : "Create"}
			</Button>

			{onDelete && (
				<Button variant="destructive" type="button" onClick={onDelete}>
					Delete
				</Button>
			)}
		</div>
	);
}
