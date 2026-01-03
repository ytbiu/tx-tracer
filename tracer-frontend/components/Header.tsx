"use client";

import React from "react";

export const Header = () => {
  return (
    <header className="border-b pb-4 border-gray-200 dark:border-gray-700 flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold">Transaction Tracer</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Trace, simulate, and analyze blockchain transactions to understand
          execution flow and errors.
        </p>
      </div>
    </header>
  );
};
