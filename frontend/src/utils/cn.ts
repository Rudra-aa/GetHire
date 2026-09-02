/**
 * cn — classname merger utility.
 * Thin wrapper so we can easily swap to clsx or tailwind-merge in the future.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
