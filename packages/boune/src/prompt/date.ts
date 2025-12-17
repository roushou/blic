import { PromptCancelledError, ansi, keyPrompt, linePrompt, runPrompt } from "./core/index.ts";
import { color } from "../output/color.ts";

export interface DateOptions {
  message: string;
  /** Default date (defaults to today) */
  default?: Date;
  /** Minimum allowed date */
  min?: Date;
  /** Maximum allowed date */
  max?: Date;
  /** Date format for display (default: "YYYY-MM-DD") */
  format?: "YYYY-MM-DD" | "MM/DD/YYYY" | "DD/MM/YYYY";
}

/**
 * State for date prompt
 */
type DateState = {
  year: number;
  month: number; // 0-11
  day: number;
  min?: Date;
  max?: Date;
  format: string;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Get number of days in a month
 */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the day of week for the first day of a month (0 = Sunday)
 */
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Format a date according to the format string
 */
export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  switch (format) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "YYYY-MM-DD":
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * Parse a date string
 */
export function parseDate(str: string, format: string): Date | null {
  const parts = str.split(/[-/]/);
  if (parts.length !== 3) return null;

  let year: number, month: number, day: number;

  switch (format) {
    case "MM/DD/YYYY":
      [month, day, year] = parts.map(Number) as [number, number, number];
      break;
    case "DD/MM/YYYY":
      [day, month, year] = parts.map(Number) as [number, number, number];
      break;
    case "YYYY-MM-DD":
    default:
      [year, month, day] = parts.map(Number) as [number, number, number];
      break;
  }

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > getDaysInMonth(year, month - 1)) return null;

  return new Date(year, month - 1, day);
}

/**
 * Check if a date is within bounds
 */
function isDateInBounds(date: Date, min?: Date, max?: Date): boolean {
  if (min && date < min) return false;
  if (max && date > max) return false;
  return true;
}

/**
 * Render the calendar
 */
function renderCalendar(state: DateState, isInitial: boolean): void {
  const { year, month, day, min, max } = state;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Calculate lines to clear (header + weekdays + up to 6 weeks)
  const weeks = Math.ceil((firstDay + daysInMonth) / 7);
  const totalLines = 2 + weeks; // month header + weekday header + weeks

  if (!isInitial) {
    process.stdout.write(ansi.moveUp(totalLines) + ansi.moveToColumn0);
  }

  // Month and year header
  process.stdout.write(ansi.clearLine);
  const monthYear = `${MONTHS[month]} ${year}`;
  console.log(color.bold(`  ${monthYear}`) + color.dim("  (←→ day, ↑↓ week, +/- month)"));

  // Weekday header
  process.stdout.write(ansi.clearLine);
  console.log(color.dim(`  ${WEEKDAYS.join(" ")}`));

  // Days grid
  let currentDay = 1;
  for (let week = 0; week < weeks; week++) {
    process.stdout.write(ansi.clearLine);
    let line = "  ";

    for (let dow = 0; dow < 7; dow++) {
      if ((week === 0 && dow < firstDay) || currentDay > daysInMonth) {
        line += "   ";
      } else {
        const dateToCheck = new Date(year, month, currentDay);
        const isSelected = currentDay === day;
        const isDisabled = !isDateInBounds(dateToCheck, min, max);
        const dayStr = String(currentDay).padStart(2, " ");

        if (isSelected) {
          // Use underline for selected day to maintain 3-char alignment
          line += color.cyan(color.bold(color.underline(dayStr))) + " ";
        } else if (isDisabled) {
          line += color.dim(dayStr) + " ";
        } else {
          line += dayStr + " ";
        }
        currentDay++;
      }
    }

    console.log(line);
  }
}

/**
 * Create a date prompt schema (key-based)
 */
export function createDateSchema(options: DateOptions) {
  const { message, default: defaultDate = new Date(), min, max, format = "YYYY-MM-DD" } = options;

  return keyPrompt<Date>({
    message,
    default: defaultDate,

    initialState: (): DateState => ({
      year: defaultDate.getFullYear(),
      month: defaultDate.getMonth(),
      day: defaultDate.getDate(),
      min,
      max,
      format,
    }),

    render: (rawState, isInitial) => {
      const state = rawState as DateState;

      if (isInitial) {
        console.log(color.cyan("? ") + color.bold(message));
        process.stdout.write(ansi.hideCursor);
      }

      renderCalendar(state, isInitial);
    },

    handleKey: (key, rawState) => {
      const state = rawState as DateState;
      let { year, month, day } = state;
      const { min, max, format } = state;

      // Navigate days
      if (key.name === "left" || key.name === "h") {
        day--;
        if (day < 1) {
          month--;
          if (month < 0) {
            month = 11;
            year--;
          }
          day = getDaysInMonth(year, month);
        }
      } else if (key.name === "right" || key.name === "l") {
        day++;
        const daysInMonth = getDaysInMonth(year, month);
        if (day > daysInMonth) {
          day = 1;
          month++;
          if (month > 11) {
            month = 0;
            year++;
          }
        }
      }
      // Navigate weeks
      else if (key.name === "up" || key.name === "k") {
        day -= 7;
        if (day < 1) {
          month--;
          if (month < 0) {
            month = 11;
            year--;
          }
          day += getDaysInMonth(year, month);
        }
      } else if (key.name === "down" || key.name === "j") {
        day += 7;
        const daysInMonth = getDaysInMonth(year, month);
        if (day > daysInMonth) {
          day -= daysInMonth;
          month++;
          if (month > 11) {
            month = 0;
            year++;
          }
        }
      }
      // Navigate months
      else if (key.name === "pageup" || (key.name === "-" && !key.ctrl)) {
        month--;
        if (month < 0) {
          month = 11;
          year--;
        }
        const daysInMonth = getDaysInMonth(year, month);
        if (day > daysInMonth) day = daysInMonth;
      } else if (key.name === "pagedown" || (key.name === "=" && !key.ctrl) || key.name === "+") {
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
        const daysInMonth = getDaysInMonth(year, month);
        if (day > daysInMonth) day = daysInMonth;
      }
      // Confirm
      else if (key.name === "return") {
        const selectedDate = new Date(year, month, day);

        if (!isDateInBounds(selectedDate, min, max)) {
          // Can't select disabled date
          return { done: false, state };
        }

        process.stdout.write(ansi.showCursor);
        // Clear calendar
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const weeks = Math.ceil((firstDay + daysInMonth) / 7);
        const totalLines = 2 + weeks;

        for (let i = 0; i < totalLines; i++) {
          process.stdout.write(ansi.moveUp(1) + ansi.clearLine);
        }

        console.log(color.dim("  ✓ ") + color.cyan(formatDate(selectedDate, format)));
        return { done: true, value: selectedDate };
      }
      // Cancel
      else if (key.name === "escape" || (key.ctrl && key.name === "c")) {
        process.stdout.write(ansi.showCursor);
        throw new PromptCancelledError();
      }
      // Ignore other keys
      else {
        return { done: false, state };
      }

      // Check bounds for new date
      const newDate = new Date(year, month, day);
      if (min && newDate < min) {
        return { done: false, state }; // Don't allow navigation before min
      }
      if (max && newDate > max) {
        return { done: false, state }; // Don't allow navigation after max
      }

      return { done: false, state: { ...state, year, month, day } };
    },

    cleanup: () => {
      process.stdout.write(ansi.showCursor);
    },

    fallback: async () => dateFallback(options),
  });
}

/**
 * Fallback for non-TTY environments
 */
async function dateFallback(options: DateOptions): Promise<Date> {
  const { message, default: defaultDate = new Date(), min, max, format = "YYYY-MM-DD" } = options;

  const schema = linePrompt<Date>({
    message,
    default: defaultDate,

    hint: () => format,

    parse: (raw, isEmpty) => {
      if (isEmpty) {
        return { ok: true, value: defaultDate };
      }

      const parsed = parseDate(raw, format);
      if (!parsed) {
        return { ok: false, error: `Invalid date format. Use ${format}` };
      }

      if (min && parsed < min) {
        return { ok: false, error: `Date must be on or after ${formatDate(min, format)}` };
      }

      if (max && parsed > max) {
        return { ok: false, error: `Date must be on or before ${formatDate(max, format)}` };
      }

      return { ok: true, value: parsed };
    },
  });

  return runPrompt(schema);
}

/**
 * Prompt for a date selection with an interactive calendar
 *
 * Use arrow keys to navigate, enter to select.
 * - Left/Right or h/l: Navigate days
 * - Up/Down or j/k: Navigate weeks
 * - +/- or PageUp/PageDown: Navigate months
 *
 * @example
 * ```typescript
 * const deadline = await date({
 *   message: "Select deadline:",
 *   min: new Date(), // Can't select past dates
 * });
 *
 * const birthday = await date({
 *   message: "Enter birthday:",
 *   format: "MM/DD/YYYY",
 * });
 * ```
 */
export async function date(options: DateOptions): Promise<Date> {
  const schema = createDateSchema(options);
  return runPrompt(schema);
}
