"use client";

import { motion } from "framer-motion";
import { Upload01Icon, Search01Icon, FlashIcon, CheckListIcon } from "hugeicons-react";

interface StepIndicatorProps {
    currentStep: number;
}

const steps = [
    { icon: Upload01Icon, label: "Upload" },
    { icon: Search01Icon, label: "Analyze" },
    { icon: FlashIcon, label: "Amplify" },
    { icon: CheckListIcon, label: "Review" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                    <div key={step.label} className="flex items-center gap-2 md:gap-4">
                        <motion.div
                            initial={false}
                            animate={{
                                scale: isActive ? 1.05 : 1,
                                backgroundColor: isCompleted
                                    ? "var(--primary)"
                                    : isActive
                                        ? "var(--primary-ultra-light)"
                                        : "var(--surface-sunken)",
                            }}
                            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 md:px-4 md:py-2"
                        >
                            <Icon
                                className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isCompleted
                                    ? "text-white"
                                    : isActive
                                        ? "text-primary"
                                        : "text-muted-light"
                                    }`}
                            />
                            <span
                                className={`text-[11px] md:text-sm font-medium ${isCompleted
                                    ? "text-white"
                                    : isActive
                                        ? "text-primary"
                                        : "text-muted-light"
                                    }`}
                            >
                                {step.label}
                            </span>
                        </motion.div>

                        {index < steps.length - 1 && (
                            <div
                                className={`hidden sm:block h-px w-4 md:w-8 ${index < currentStep ? "bg-primary" : "bg-border/60"
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
