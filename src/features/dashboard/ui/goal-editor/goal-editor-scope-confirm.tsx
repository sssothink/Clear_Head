"use client";
import { createPortal } from "react-dom";

type GoalScopeConfirmProps = {
	scopePrompt: "update" | "delete";
	handleSubmitClick: (scope?: "single" | "future") => void;
	setScopePrompt: (prompt: "update" | "delete" | null) => void;
	onDeleteOnly?: () => void;
	onDeleteAll?: () => void;
	modalRef: React.RefObject<HTMLDivElement | null>;
};

export default function GoalScopeConfirm({
	scopePrompt,
	handleSubmitClick,
	onDeleteOnly,
	onDeleteAll,
	setScopePrompt,
	modalRef,
}: GoalScopeConfirmProps) {
	const title =
		scopePrompt === "update"
			? "Update only this task or this and following?"
			: "Delete only this task or this and following?";

	return createPortal(
		<div
			className="scope-modal-overlay"
			onClick={() => setScopePrompt(null)}
			role="dialog"
			aria-modal="true"
			aria-label="Choose recurring action scope"
		>
			<div
				ref={modalRef}
				className="scope-modal"
				onClick={(e) => e.stopPropagation()}
			>
				<p className="scope-modal-title">{title}</p>
				<p className="scope-modal-subtitle">
					This action affects a recurring task.
				</p>

				<div className="scope-modal-actions">
					<button
						type="button"
						className="scope-modal-btn"
						onClick={() => {
							if (scopePrompt === "update") {
								handleSubmitClick("single");
							} else {
								onDeleteOnly?.();
							}
							setScopePrompt(null);
						}}
					>
						Only this
					</button>

					<button
						type="button"
						className="scope-modal-btn"
						onClick={() => {
							if (scopePrompt === "update") {
								handleSubmitClick("future");
							} else {
								onDeleteAll?.();
							}
							setScopePrompt(null);
						}}
					>
						This and following
					</button>
				</div>

				<button
					type="button"
					className="scope-modal-cancel"
					onClick={() => setScopePrompt(null)}
				>
					Cancel
				</button>
			</div>
		</div>,
		document.body,
	);
}
