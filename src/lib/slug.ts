export function generateSlug(title: string, existingSlugs?: string[]): string {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  if (!slug) slug = "post";

  if (!existingSlugs || !existingSlugs.includes(slug)) return slug;

  let n = 2;
  while (existingSlugs.includes(`${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}
