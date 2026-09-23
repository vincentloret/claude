import { Icon } from "./Icon";

export function BrandMark({ size = 44 }: { size?: number }) {
  return (
    <div
      className="flex flex-none items-center justify-center rounded-2xl bg-primary"
      style={{ width: size, height: size }}
    >
      <Icon name="soup_kitchen" filled size={Math.round(size * 0.55)} className="text-on-primary" />
    </div>
  );
}
