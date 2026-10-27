function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "";
}

export function isAISpendLimitError(error: unknown): boolean {
    return /(?:spend(?:ing)?[ -](?:cap|limit)|monthly spending cap)/i.test(getErrorMessage(error));
}

export function isAIPaymentRequiredError(error: unknown): boolean {
    const status = typeof error === "object" && error !== null && "status" in error
        ? error.status : undefined;
    return status === 402 || /\b402\b|prepay(?:ment)? credits? (?:are )?depleted/i.test(getErrorMessage(error));
}

export function getAIErrorResponse(error: unknown) {
    if (isAIPaymentRequiredError(error)) {
        return {
            code: "AI_PAYMENT_REQUIRED",
            message: "AI features are temporarily unavailable. Please contact support or try again once service is restored.",
            status: 503,
        };
    }
    if (isAISpendLimitError(error)) {
        return {
            code: "AI_SPEND_LIMIT_REACHED",
            message: "AI features are unavailable because the service has reached its monthly spending limit. Please contact support or try again once service is restored.",
            status: 503,
        };
    }

    const status = typeof error === "object" && error !== null && "status" in error
        ? error.status : undefined;
    if (status === 429 || /\b429\b/.test(getErrorMessage(error))) {
        return {
            code: "AI_RATE_LIMITED",
            message: "The AI service is receiving too many requests. Please wait a moment and try again.",
            status: 429,
        };
    }

    return {
        code: "AI_UNAVAILABLE",
        message: "The AI service could not complete your request. Please try again later or contact support.",
        status: 503,
    };
}
