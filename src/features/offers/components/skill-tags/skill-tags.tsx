import type { OfferCard } from "@/features/offers/queries";

type SkillTagsProps = {
  skills: OfferCard["skills"];
  /** Show only the first few, e.g. on a card. */
  limit?: number;
};

export function SkillTags({ skills, limit }: SkillTagsProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {skills.slice(0, limit).map(({ skill }) => (
        <li
          key={skill.slug}
          className="rounded-sm bg-primary-subtle px-4 py-1 text-sm text-primary"
        >
          {skill.name}
        </li>
      ))}
    </ul>
  );
}
