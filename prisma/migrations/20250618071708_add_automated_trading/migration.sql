-- CreateTable
CREATE TABLE "TradingStrategy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "symbol" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "strategyType" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "maxPositionSize" REAL NOT NULL,
    "stopLossPercent" REAL,
    "takeProfitPercent" REAL,
    "maxDailyLoss" REAL,
    "brokerConnectionId" INTEGER NOT NULL,
    "autoExecute" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TradingStrategy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StrategyExecution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "strategyId" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "signal" TEXT NOT NULL,
    "price" REAL,
    "size" REAL,
    "executed" BOOLEAN NOT NULL DEFAULT false,
    "executedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StrategyExecution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StrategyExecution_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "TradingStrategy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
