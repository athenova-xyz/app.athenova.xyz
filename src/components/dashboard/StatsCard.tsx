import { ReactNode } from 'react';

export type StatsCardProps = {
  label: string;
  value: number | string;
  icon?: ReactNode;
};

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className='rounded-lg border bg-background p-4'>
      <div className='flex items-start justify-between'>
        <div>
          <div className='text-xs text-muted-foreground'>{label}</div>
          <div className='mt-2 text-2xl font-semibold leading-none tracking-tight'>{value}</div>
        </div>
        {icon ? <div className='text-muted-foreground'>{icon}</div> : null}
      </div>
    </div>
  );
}
