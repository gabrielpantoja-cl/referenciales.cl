// components/ui/common/TimeStamp.tsx
export default function TimeStamp({ date }: { date: string }) {
  return (
    <div className="timestampComment mb-6 text-sm">
      Última actualización: {date}
    </div>
  );
}