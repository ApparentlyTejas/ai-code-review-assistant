import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "./Icons";

export function BackButton({ to, label = "Back" }: { to?: string; label?: string }) {
  const navigate = useNavigate();

  return (
    <button
      className="back-btn"
      onClick={() => (to ? navigate(to) : navigate(-1))}
    >
      <ChevronLeftIcon size={15} />
      {label}
    </button>
  );
}
