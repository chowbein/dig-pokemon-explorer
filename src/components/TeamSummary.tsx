/**
 * Team Summary Component
 * Displays contextual summary message about team's defensive balance.
 */

interface TeamSummaryProps {
  /** Object mapping type names to count of team members weak to that type */
  weaknesses: Record<string, number>;
  /** Object mapping type names to count of team members resistant to that type */
  resistances: Record<string, number>;
}

/**
 * Team status types for summary display.
 */
type TeamStatus = 'critical' | 'warning' | 'good' | 'neutral';

/**
 * Summary object with status and message.
 */
interface TeamSummaryResult {
  status: TeamStatus;
  message: string;
}

/**
 * Team summary component displaying contextual message about team balance.
 * 
 * - Analyzes weaknesses and resistances to determine team status
 * - Displays appropriate message based on defensive balance
 * - Uses color-coded styling based on status severity
 * 
 * @param weaknesses - Object mapping type names to weakness counts
 * @param resistances - Object mapping type names to resistance counts
 */
export function TeamSummary({ weaknesses, resistances }: TeamSummaryProps) {
  /**
   * Processes weaknesses and resistances to determine team status.
   * 
   * Complex Logic: Checks rules in priority order to determine team balance:
   * 1. Critical Flaw: Weakness count >= 3 with 0 resistances
   * 2. Uncovered Weakness: Weakness count >= 2 with 0 resistances
   * 3. Well Balanced: No critical weaknesses and all major weaknesses covered
   * 4. Default: Neutral status for teams still in development
   * 
   * @returns Summary object with status and message
   */
  const getTeamSummary = (): TeamSummaryResult => {
    const weaknessEntries = Object.entries(weaknesses);
    const resistanceTypes = new Set(Object.keys(resistances));

    // Rule 1: Critical Flaw - weakness count >= 3 with 0 resistances
    for (const [typeName, count] of weaknessEntries) {
      const resistanceCount = resistances[typeName] || 0;
      if (count >= 3 && resistanceCount === 0) {
        const capitalizedType = typeName.charAt(0).toUpperCase() + typeName.slice(1);
        return {
          status: 'critical',
          message: `Critically Weak: Your team has a major, uncovered weakness to ${capitalizedType} attacks. You should immediately add a Pokémon that resists this type.`,
        };
      }
    }

    // Rule 2: Uncovered Weakness - weakness count >= 2 with 0 resistances
    for (const [typeName, count] of weaknessEntries) {
      const resistanceCount = resistances[typeName] || 0;
      if (count >= 2 && resistanceCount === 0) {
        const capitalizedType = typeName.charAt(0).toUpperCase() + typeName.slice(1);
        return {
          status: 'warning',
          message: `Unbalanced: Your team is vulnerable to ${capitalizedType} attacks and lacks a solid counter. Adding a Pokémon that resists ${capitalizedType} is highly recommended.`,
        };
      }
    }

    // Rule 3: Well Balanced - no weaknesses >= 3 AND all weaknesses >= 2 are covered
    const hasCriticalWeakness = weaknessEntries.some(([, count]) => count >= 3);
    if (!hasCriticalWeakness) {
      const majorWeaknesses = weaknessEntries.filter(([, count]) => count >= 2);
      const allCovered = majorWeaknesses.every(([typeName]) => resistanceTypes.has(typeName));
      
      if (allCovered && majorWeaknesses.length > 0) {
        return {
          status: 'good',
          message: 'Well Balanced: Your team has its key weaknesses covered. This is a solid and synergistic defensive composition.',
        };
      }
    }

    // Rule 4: Default/Neutral
    return {
      status: 'neutral',
      message: 'This team is still in development. Try to cover your most common weaknesses to improve its defensive synergy.',
    };
  };

  const summary = getTeamSummary();

  /**
   * Gets styling classes based on status.
   */
  const getStatusClasses = (status: TeamStatus): string => {
    switch (status) {
      case 'critical':
        return 'text-red-600 dark:text-red-400 border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 border-yellow-500 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'good':
        return 'text-green-600 dark:text-green-400 border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20';
      case 'neutral':
        return 'text-gray-600 dark:text-gray-400 border-gray-500 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 border-gray-500 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  /**
   * Gets icon based on status.
   */
  const getStatusIcon = (status: TeamStatus): string => {
    switch (status) {
      case 'critical':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'good':
        return '✓';
      case 'neutral':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 mb-4 ${getStatusClasses(summary.status)}`}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg flex-shrink-0" role="img" aria-label={summary.status}>
          {getStatusIcon(summary.status)}
        </span>
        <p className="text-sm font-medium leading-relaxed">{summary.message}</p>
      </div>
    </div>
  );
}

