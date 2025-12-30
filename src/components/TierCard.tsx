import type { TierResponse } from "@/lib/varchive";

type TierCardProps = {
  button: number;
  tier: TierResponse | null | undefined;
  simple?: boolean;
};

export default function TierCard({ button, tier, simple = false }: TierCardProps) {
  if (!tier) {
    return (
      <div className={simple ? "flex items-center gap-2" : "card flex items-center gap-4"}>
        <div className="h-2 w-2 rounded-full bg-grey-300" />
        <p className="text-sm text-grey-400">정보 없음</p>
      </div>
    );
  }

  return (
    <div className={simple ? "flex items-center justify-between" : "card flex items-center gap-4"}>
      {!simple && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-grey-100 text-sm font-bold text-grey-900">
          {button}B
        </div>
      )}

      <div className="flex-1">
        {!simple && <p className="text-xs font-semibold text-grey-400">버튼 {button}</p>}
        <div className="flex items-baseline gap-2">
          <h4 className={`font-bold ${simple ? "text-lg text-grey-900" : "text-lg text-grey-900"}`}>
            {tier.tier.name}
          </h4>
        </div>
        {!simple && (
          <p className="text-sm text-grey-500">
            {tier.tierPoint.toFixed(0)} P
          </p>
        )}
      </div>

      {simple && (
        <span className="text-sm font-semibold text-brand">
          {Math.round(tier.tierPoint)} P
        </span>
      )}
    </div>
  );
}
