"use client";

import { useRef } from "react";

type Props = {
  milestoneId: string;
  action: (formData: FormData) => Promise<void>;
  className?: string;
  buttonClassName?: string;
};

export default function AddMilestonePhotoForm({
  milestoneId,
  action,
  className = "",
  buttonClassName = "btn btn-secondary text-sm",
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputId = `add-photo-${milestoneId}`;

  return (
    <form
      ref={formRef}
      action={action}
      className={className}
    >
      <input type="hidden" name="milestoneId" value={milestoneId} />
      <input
        type="file"
        name="file"
        id={inputId}
        accept="image/*"
        required
        onChange={() => formRef.current?.requestSubmit()}
        className="absolute w-0 h-0 opacity-0 overflow-hidden"
        aria-label="Add photo"
      />
      <label
        htmlFor={inputId}
        className={`cursor-pointer inline-flex items-center justify-center ${buttonClassName}`}
      >
        Add photo
      </label>
    </form>
  );
}
