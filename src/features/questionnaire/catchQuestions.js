import CQs from "../../questions/catchQs.json";

/**
 * Attention-check ("catch") question system shared by both questionnaires.
 * Identical in the two forks; the current step and the answer state stay in
 * the page component and are passed in.
 */

/** Steps that receive a random catch question (same list in both forks). */
export const CATCH_QUESTION_STEPS = [2, 3, 6];

export function injectCatchQuestion({ step, setCatchAnswers, setCatchQuestions }) {
    // Only inject catch questions for the configured steps
    if (!CATCH_QUESTION_STEPS.includes(step)) return;

    // Select a random catch question
    const randomIndex = Math.floor(Math.random() * CQs.length);
    const selectedCatchQuestion = { ...CQs[randomIndex] };

    // Handle special case for catchSum question type
    if (selectedCatchQuestion.useName === "catchSum") {
        const num1 = Math.floor(Math.random() * 10) + 1; // Random number between 1-10
        const num2 = Math.floor(Math.random() * 10) + 1; // Random number between 1-10
        const sum = num1 + num2;

        // Update the question with the random numbers
        selectedCatchQuestion.inpName = `${num1} + ${num2} = ?`;
        selectedCatchQuestion.correctAnswer = sum; // Store the correct answer

        // Update state to track this specific catch question's answer
        setCatchAnswers(prev => ({
            ...prev,
            [`catchSum_${step}`]: sum
        }));
    } else if (selectedCatchQuestion.ans !== undefined) {
        // For other questions, store the correct answer
        setCatchAnswers(prev => ({
            ...prev,
            [selectedCatchQuestion.useName]: selectedCatchQuestion.ans
        }));
    }

    // Store the catch question for the current step
    setCatchQuestions(prev => ({
        ...prev,
        [step]: selectedCatchQuestion
    }));
}

export function validateCatchAnswer({ catchQuestions, catchAnswers, stepNum }) {
    if (!catchQuestions[stepNum]) return true; // No catch question for this step

    const catchQ = catchQuestions[stepNum];
    const userAnswer = catchAnswers[`catch_${catchQ.useName}`];

    if (catchQ.useName === "catchSum") {
        // Special handling for catchSum - compare with calculated sum
        const correctAnswer = catchAnswers[`catchSum_${stepNum}`];
        return userAnswer !== undefined && parseInt(userAnswer) === correctAnswer;
    } else {
        // For other questions, compare with the stored answer
        const correctAnswer = catchQ.ans;
        return userAnswer !== undefined && userAnswer === correctAnswer;
    }
}

/** Required-map lookup used by the step validators in both forks. */
export function getRequiredValue(obj, st, name) {
    return obj[st]?.[name];
}
