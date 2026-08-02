/**
 * RevenueBarChart — weekly revenue bar chart (Mon–Sun).
 *
 * Figma design (VERIFIED):
 *   - VERTICAL bars (bars going UP) ✅
 *   - Light teal for most bars, dark teal for highlighted day
 *   - X-axis: day names (Mon, Tue, ...)
 *   - Y-axis: revenue values (5k, 10k, ...)
 *
 * Features:
 *   - Click any bar to select/highlight it (defaults to today)
 *   - Hover shows custom tooltip with EGP value
 *   - RTL-aware: layout reverses in Arabic
 *   - Bilingual: day names + EGP label + numbers switch to Arabic when lang=ar
 */
import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DAY_TRANSLATIONS = {
  Sun: 'الأحد',
  Mon: 'الإثنين',
  Tue: 'الثلاثاء',
  Wed: 'الأربعاء',
  Thu: 'الخميس',
  Fri: 'الجمعة',
  Sat: 'السبت',
};

const COLORS = {
  default: '#A8D8D8',
  selected: '#0D4D47',
  grid: '#F3F4F6',
  axis: '#9CA3AF',
};

function CustomTooltip({ active, payload, label, isArabic }) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value;
  const locale = isArabic ? 'ar-EG' : 'en-US';
  const formatted = new Intl.NumberFormat(locale).format(value);
  const currencyLabel = isArabic ? 'ج.م' : 'EGP';

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-gray-900">{label}</p>
      <p className="text-primary mt-1 text-sm font-semibold">
        {currencyLabel} {formatted}
      </p>
    </div>
  );
}

function formatYAxis(value, isArabic) {
  const locale = isArabic ? 'ar-EG' : 'en-US';

  if (value >= 1000) {
    const kValue = value / 1000;
    const formatted = kValue.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
    return isArabic ? `${formatted}الأف` : `${formatted}k`;
  }

  const rounded = Math.round(value);
  return new Intl.NumberFormat(locale).format(rounded);
}

export function RevenueBarChart({ data = [], title, currentDay, onSelect }) {
  const { isRTL, lang } = useLanguage();
  const isArabic = lang === 'ar';

  const chartTitle = title || (isArabic ? 'إيرادات الأسبوع' : 'Revenue this week');
  const hint = isArabic ? 'اضغط على عمود لرؤية التفاصيل' : 'Tap a bar to see details';

  const today = currentDay || DAY_NAMES_EN[new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState(today);

  const selectedEntry = data.find((d) => d.day === selectedDay);
  const selectedValue = selectedEntry?.current ?? 0;

  const handleClick = (entry) => {
    setSelectedDay(entry.day);
    onSelect?.(entry.day, entry);
  };

  // Localize the day names for the X-axis
  const localizedData = data.map((entry) => ({
    ...entry,
    displayDay: isArabic ? DAY_TRANSLATIONS[entry.day] || entry.day : entry.day,
  }));

  // For RTL: reverse the data array so Mon appears on the right
  const chartData = isRTL ? [...localizedData].reverse() : localizedData;

  const selectedValueFormatted = new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US').format(
    selectedValue
  );
  const currencyLabel = isArabic ? 'ج.م' : 'EGP';
  const selectedDayDisplay = isArabic ? DAY_TRANSLATIONS[selectedDay] || selectedDay : selectedDay;

  return (
    <div className="card p-6">
      {/* Header row */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{chartTitle}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
        </div>
        {selectedEntry && (
          <div className="text-end">
            <p className="text-xs font-medium text-gray-500">{selectedDayDisplay}</p>
            <p className="text-primary text-lg font-bold">
              {currencyLabel} {selectedValueFormatted}
            </p>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        {/* ✅ VERTICAL chart — removed `layout="vertical"` */}
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
          {/* X-axis = category (days) */}
          <XAxis
            dataKey="displayDay"
            tick={{ fontSize: 12, fill: COLORS.axis }}
            axisLine={false}
            tickLine={false}
            reversed={isRTL}
          />
          {/* Y-axis = numbers (revenue) */}
          <YAxis
            tickFormatter={(v) => formatYAxis(v, isArabic)}
            tick={{ fontSize: 12, fill: COLORS.axis }}
            axisLine={false}
            tickLine={false}
            width={40}
            orientation={isRTL ? 'right' : 'left'}
          />
          <Tooltip
            content={<CustomTooltip isArabic={isArabic} />}
            cursor={{ fill: 'rgba(13, 77, 71, 0.05)' }}
          />
          <Bar
            dataKey="current"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
            onClick={(_, index) => handleClick(chartData[index])}
            cursor="pointer"
            animationBegin={0}
            animationDuration={600}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.day === selectedDay ? COLORS.selected : COLORS.default}
                className="transition-colors duration-200 hover:opacity-80"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Selected day indicator dot row */}
      <div className="mt-2 flex justify-center">
        {(isRTL ? [...data].reverse() : data).map((entry) => (
          <div
            key={`dot-${entry.day}`}
            className={`mx-1 h-1.5 w-1.5 rounded-full transition-all duration-200 ${
              entry.day === selectedDay ? 'bg-primary scale-150' : 'bg-transparent'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default RevenueBarChart;
