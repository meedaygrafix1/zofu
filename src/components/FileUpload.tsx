"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload01Icon, File01Icon, Cancel01Icon, CheckmarkCircle01Icon } from "hugeicons-react";

interface FileUploadProps {
    onFileProcessed: (text: string, fileName: string) => void;
    isProcessing: boolean;
}

export default function FileUpload({
    onFileProcessed,
    isProcessing,
}: FileUploadProps) {
    const [fileName, setFileName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploaded, setIsUploaded] = useState(false);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            if (file.type !== "application/pdf") {
                setError("Please upload a PDF file");
                return;
            }

            setError(null);
            setFileName(file.name);
            setUploadProgress(0);
            setIsUploaded(false);

            // Simulate progress
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 15;
                });
            }, 100);

            try {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/parse-resume", {
                    method: "POST",
                    body: formData,
                });

                clearInterval(interval);

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || "Failed to parse PDF");
                }

                const data = await response.json();
                setUploadProgress(100);
                setIsUploaded(true);
                onFileProcessed(data.text, file.name);
            } catch (err) {
                clearInterval(interval);
                setUploadProgress(0);
                setError(err instanceof Error ? err.message : "Failed to process file");
                setFileName(null);
            }
        },
        [onFileProcessed]
    );

    const removeFile = () => {
        setFileName(null);
        setIsUploaded(false);
        setUploadProgress(0);
        setError(null);
        onFileProcessed("", "");
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 1,
        disabled: isProcessing,
    });

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
                Resume (PDF)
            </label>

            <AnimatePresence mode="wait">
                {isUploaded && fileName ? (
                    <motion.div
                        key="uploaded"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-between rounded-xl border border-success/30 bg-success-light/50 p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                                <CheckmarkCircle01Icon className="h-5 w-5 text-success" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    {fileName}
                                </p>
                                <p className="text-xs text-muted">Successfully parsed</p>
                            </div>
                        </div>
                        <button
                            onClick={removeFile}
                            className="rounded-lg p-1.5 text-muted hover:bg-white/80 hover:text-foreground transition-colors"
                            disabled={isProcessing}
                        >
                            <Cancel01Icon className="h-4 w-4" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div
                            {...getRootProps()}
                            className={`
                relative cursor-pointer rounded-xl border-2 border-dashed p-8
                text-center transition-all duration-200
                ${isDragActive
                                    ? "border-primary bg-primary-ultra-light scale-[1.02]"
                                    : "border-border hover:border-primary/50 hover:bg-primary-ultra-light/50"
                                }
                ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
              `}
                        >
                            <input {...getInputProps()} />

                            <motion.div
                                animate={isDragActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <div
                                    className={`
                  flex h-12 w-12 items-center justify-center rounded-xl
                  ${isDragActive ? "bg-primary/10" : "bg-surface-sunken"}
                  transition-colors
                `}
                                >
                                    {uploadProgress > 0 && !isUploaded ? (
                                        <File01Icon className="h-6 w-6 text-primary animate-pulse" />
                                    ) : (
                                        <Upload01Icon
                                            className={`h-6 w-6 ${isDragActive ? "text-primary" : "text-muted"
                                                }`}
                                        />
                                    )}
                                </div>

                                {uploadProgress > 0 && !isUploaded ? (
                                    <div className="w-full max-w-[200px]">
                                        <div className="mb-1 text-sm font-medium text-primary">
                                            Parsing resume...
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-surface-sunken overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full bg-primary"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${uploadProgress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-foreground">
                                            {isDragActive
                                                ? "Drop your resume here"
                                                : "Drag & drop your resume"}
                                        </p>
                                        <p className="text-xs text-muted">
                                            or click to browse • PDF only
                                        </p>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-sm text-danger"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
