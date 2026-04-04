export const FUSE_SLUGS = [
  { slug: "double-down", label: "DOUBLE DOWN" },
  { slug: "2x-assist", label: "2X ASSIST" },
  { slug: "freestyle", label: "FREESTYLE" },
  { slug: "sidekick", label: "SIDEKICK" },
  { slug: "sidekick-alt", label: "SIDEKICK" },
] as const;

export interface FusePathProps {
  fuseSlug: string | null;
  fuseLabel: string | null;
}

export function buildFuseStaticEntries() {
  return [
    { params: { fuse: undefined }, props: { fuseSlug: null, fuseLabel: null } },
    ...FUSE_SLUGS.map((fuse) => ({
      params: { fuse: fuse.slug },
      props: { fuseSlug: fuse.slug, fuseLabel: fuse.label },
    })),
  ];
}

export function resolveFuseFilter(fuseSlug: string | null): string | null {
  if (!fuseSlug) return null;
  if (fuseSlug === "double-down") return "Double Down";
  if (fuseSlug === "2x-assist") return "2X Assist";
  if (fuseSlug === "freestyle") return "Freestyle";
  if (fuseSlug === "sidekick" || fuseSlug === "sidekick-alt") return "Sidekick";
  return null;
}

export function sidekickPointLabel(fuseSlug: string, pointName: string, assistName: string): string {
  if (fuseSlug === "sidekick") return `${pointName} ポイント`;
  if (fuseSlug === "sidekick-alt") return `${assistName} ポイント`;
  return "";
}

export function scaleCrop(crop: { bgSize: string; bgPosition: string }) {
  const size = parseInt(crop.bgSize, 10);
  const parts = crop.bgPosition.match(/-?\d+/g)?.map(Number) || [0, 0];
  return { size, posX: parts[0], posY: parts[1] };
}
