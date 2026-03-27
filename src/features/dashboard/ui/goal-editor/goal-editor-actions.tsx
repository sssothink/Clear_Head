import { Button } from "@/shared/ui/button";

type GoalActionsProps = {
	isEdit: boolean;
	onSubmit: () => void;
	onDelete?: () => void;
};

export function GoalActions({ isEdit, onSubmit, onDelete }: GoalActionsProps) {
	return (
		<div className="goal-actions">
			<Button type="button" onClick={onSubmit}>
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
