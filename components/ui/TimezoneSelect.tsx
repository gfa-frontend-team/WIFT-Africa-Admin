import React, { useMemo } from 'react';
import { NativeSelect } from './NativeSelect'; // assuming NativeSelect is in this folder

interface TimezoneSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

export const TimezoneSelect = React.forwardRef<HTMLSelectElement, TimezoneSelectProps>(
    ({ label, error, className, ...props }, ref) => {
        // Generate standard IANA timezones natively
        const timezones = useMemo(() => {
            try {
                return Intl.supportedValuesOf('timeZone');
            } catch (e) {
                // Fallback for older environments if needed, though modern browsers support it
                return ['UTC', 'Africa/Lagos', 'Africa/Nairobi', 'Africa/Johannesburg', 'Europe/London', 'America/New_York'];
            }
        }, []);

        return (
            <div className="space-y-2 w-full">
                {label && <label className="text-sm font-medium text-foreground">{label}</label>}
                <NativeSelect ref={ref} className={className} {...props}>
                    <option value="">Select a Timezone</option>
                    {timezones.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                    ))}
                </NativeSelect>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
        );
    }
);

TimezoneSelect.displayName = 'TimezoneSelect';
