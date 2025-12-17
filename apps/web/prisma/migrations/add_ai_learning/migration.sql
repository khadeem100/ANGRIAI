-- Add AI learning consent fields to EmailAccount
ALTER TABLE "EmailAccount" ADD COLUMN "aiLearningConsent" BOOLEAN DEFAULT false;
ALTER TABLE "EmailAccount" ADD COLUMN "aiLearningConsentAt" TIMESTAMP(3);

-- Create table for AI training data
CREATE TABLE "AiTrainingData" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailAccountId" TEXT NOT NULL,
    "chatId" TEXT,
    "conversationType" TEXT NOT NULL,
    "userMessage" TEXT NOT NULL,
    "assistantResponse" TEXT NOT NULL,
    "toolCalls" JSONB,
    "context" JSONB,
    "feedback" TEXT,
    "quality" TEXT,

    CONSTRAINT "AiTrainingData_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AiTrainingData_emailAccountId_idx" ON "AiTrainingData"("emailAccountId");
CREATE INDEX "AiTrainingData_chatId_idx" ON "AiTrainingData"("chatId");
CREATE INDEX "AiTrainingData_createdAt_idx" ON "AiTrainingData"("createdAt");

ALTER TABLE "AiTrainingData" ADD CONSTRAINT "AiTrainingData_emailAccountId_fkey" FOREIGN KEY ("emailAccountId") REFERENCES "EmailAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiTrainingData" ADD CONSTRAINT "AiTrainingData_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
