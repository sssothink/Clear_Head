import { Textarea } from "@/shared/ui";
import { Input } from "@/shared/ui/input";

type GoalTextFieldsProps = {
	defaultTitle?: string;
	defaultDescription?: string;
	onTitleChange: (v: string) => void;
	onDescriptionChange: (v: string) => void;
};

export function GoalTextFields({
	defaultTitle,
	defaultDescription,
	onTitleChange,
	onDescriptionChange,
}: GoalTextFieldsProps) {
	return (
		<div className="goal-body">
			<Input
				id="goal-title"
				placeholder="Task title"
				defaultValue={defaultTitle}
				onChange={(e) => onTitleChange(e.target.value)}
				autoComplete="off"
				spellCheck={false}
				autoCorrect="off"
				autoCapitalize="off"
			/>
			<Textarea
				id="goal-description"
				placeholder="Description"
				defaultValue={defaultDescription}
				onChange={(e) => onDescriptionChange(e.target.value)}
				rows={6}
			/>
		</div>
	);
}
