interface Props {
  items: string[];
}

export function FeatureList({ items }: Props) {
  return (
    <ul className="space-y-2 text-sm text-muted-foreground">
      {items.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <span className="mt-1 h-2 w-2 rounded-full bg-teal-500" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

