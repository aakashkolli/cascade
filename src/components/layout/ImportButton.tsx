interface ImportButtonProps {
  onClick: () => void;
}

export function ImportButton({ onClick }: ImportButtonProps) {
  return (
    <button className="btn btn-ghost" onClick={onClick} data-testid="import-button">
      Import
    </button>
  );
}
