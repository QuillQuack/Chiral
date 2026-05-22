interface BioDisplayProps {
  bio: string | null;
}

export default function BioDisplay({ bio }: BioDisplayProps) {
  if (!bio) {
    return (
      <p className="text-text-secondary italic text-sm">
        This user hasn&apos;t added a bio yet. Probably too busy downloading
        definitely-not-viruses.
      </p>
    );
  }

  return (
    <div className="text-text-primary whitespace-pre-wrap break-words text-sm leading-relaxed">
      {bio}
    </div>
  );
}
