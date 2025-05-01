/* Utility Functions */

/**
 * Calculates the Average of 5 (Ao5) for cubing results.
 * Removes the best and worst times, then averages the remaining three.
 * Handles DNF (Did Not Finish) values.
 *
 * @param {Array<string|number>} solves - An array of 5 solve times (strings or numbers). DNF should be represented as 'DNF'.
 * @returns {string|number} The calculated Ao5, or 'DNF' if more than one solve is DNF.
 */
function calculateAo5(solves) {
    if (!solves || solves.length !== 5) {
        return 'Invalid Input'; // Or handle error appropriately
    }

    let numericSolves = [];
    let dnfCount = 0;

    for (const solve of solves) {
        if (typeof solve === 'string' && solve.toUpperCase() === 'DNF') {
            dnfCount++;
            numericSolves.push(Infinity); // Treat DNF as worst possible time
        } else {
            const time = parseFloat(solve);
            if (isNaN(time) || time <= 0) {
                // Handle invalid time format if necessary, maybe return an error
                // For now, treat as DNF for calculation robustness
                dnfCount++;
                numericSolves.push(Infinity);
            } else {
                numericSolves.push(time);
            }
        }
    }

    // If more than one DNF, the average is DNF
    if (dnfCount > 1) {
        return 'DNF';
    }

    // Sort times numerically
    numericSolves.sort((a, b) => a - b);

    // Remove the best (first) and worst (last) times
    const middleThree = numericSolves.slice(1, 4);

    // Calculate the average of the middle three
    // Check if any of the middle three is Infinity (a DNF)
    if (middleThree.includes(Infinity)) {
        return 'DNF'; // If one DNF remains after removing fastest/slowest
    }

    const sum = middleThree.reduce((acc, time) => acc + time, 0);
    const average = sum / 3;

    // Format to 2 decimal places
    return average.toFixed(2);
}

/**
 * Formats a time in seconds into MM:SS.ss or SS.ss format.
 * @param {number} timeInSeconds - The time in seconds.
 * @returns {string} Formatted time string.
 */
function formatTime(timeInSeconds) {
    if (timeInSeconds === Infinity || timeInSeconds === 'DNF' || isNaN(timeInSeconds)) {
        return 'DNF';
    }
    const seconds = parseFloat(timeInSeconds);
    if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = (seconds % 60).toFixed(2);
        return `${minutes}:${remainingSeconds.padStart(5, '0')}`; // MM:SS.ss
    } else {
        return seconds.toFixed(2); // SS.ss
    }
}

/**
 * Parses a time string (like 1:23.45 or 45.67 or DNF) into seconds.
 * @param {string} timeString - The time string to parse.
 * @returns {number|string} Time in seconds or 'DNF'.
 */
function parseTime(timeString) {
    if (typeof timeString !== 'string') return NaN;
    const upperCaseString = timeString.trim().toUpperCase();
    if (upperCaseString === 'DNF') {
        return 'DNF';
    }
    if (upperCaseString.includes(':')) {
        const parts = upperCaseString.split(':');
        if (parts.length === 2) {
            const minutes = parseFloat(parts[0]);
            const seconds = parseFloat(parts[1]);
            if (!isNaN(minutes) && !isNaN(seconds)) {
                return minutes * 60 + seconds;
            }
        }
    } else {
        const seconds = parseFloat(upperCaseString);
        if (!isNaN(seconds)) {
            return seconds;
        }
    }
    return NaN; // Invalid format
}

