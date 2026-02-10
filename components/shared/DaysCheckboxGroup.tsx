'use client'

import { DayOfWeek } from '@/types/mentorship'

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
    { value: DayOfWeek.MONDAY, label: 'Mon' },
    { value: DayOfWeek.TUESDAY, label: 'Tue' },
    { value: DayOfWeek.WEDNESDAY, label: 'Wed' },
    { value: DayOfWeek.THURSDAY, label: 'Thu' },
    { value: DayOfWeek.FRIDAY, label: 'Fri' },
    { value: DayOfWeek.SATURDAY, label: 'Sat' },
    { value: DayOfWeek.SUNDAY, label: 'Sun' },
]

interface DaysCheckboxGroupProps {
    value: DayOfWeek[]
    onChange: (value: DayOfWeek[]) => void
    error?: string
    disabled?: boolean
}

export function DaysCheckboxGroup({
    value = [],
    onChange,
    error,
    disabled = false
}: DaysCheckboxGroupProps) {
    const toggleDay = (day: DayOfWeek) => {
        if (disabled) return

        if (value.includes(day)) {
            onChange(value.filter(d => d !== day))
        } else {
            onChange([...value, day])
        }
    }

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
                Available Days <span className="text-destructive">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(({ value: day, label }) => (
                    <label
                        key={day}
                        className={`
              px-4 py-2 rounded-lg border cursor-pointer transition-all
              ${value.includes(day)
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-background border-input hover:border-primary/50 hover:bg-accent'
                            }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
                    >
                        <input
                            type="checkbox"
                            checked={value.includes(day)}
                            onChange={() => toggleDay(day)}
                            disabled={disabled}
                            className="sr-only"
                        />
                        <span className="text-sm font-medium">{label}</span>
                    </label>
                ))}
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            {value.length === 0 && !error && (
                <p className="text-xs text-muted-foreground">Select at least one day</p>
            )}
        </div>
    )
}
