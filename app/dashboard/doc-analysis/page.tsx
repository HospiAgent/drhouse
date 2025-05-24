import React from "react";
import { Upload, FileText, ClipboardCheck, FileEdit } from "lucide-react";

const DocAnalysis = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
          <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Medical Document Analysis</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload medical records and documents for AI analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Medical Records Section */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-3">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-medium mb-1 text-gray-900 dark:text-gray-100">Medical Records</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Patient histories, diagnoses, and treatment plans
          </p>
        </div>

        {/* Test Results Section */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-3">
            <ClipboardCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-medium mb-1 text-gray-900 dark:text-gray-100">Test Results</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Lab reports, imaging results, and vital measurements
          </p>
        </div>

        {/* Clinical Notes Section */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="h-8 w-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center mb-3">
            <FileEdit className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-lg font-medium mb-1 text-gray-900 dark:text-gray-100">Clinical Notes</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Physician notes, observations, and recommendations
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
            <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
            Upload your medical documents
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Drag and drop your files, or click to browse
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors">
            Select Files
          </button>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Accepted format: PDF (max 10MB)
          </p>
        </div>
      </div>

      {/* Additional Context */}
      <div className="space-y-2">
        <label
          htmlFor="context"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Additional Context
        </label>
        <textarea
          id="context"
          rows={4}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Add any specific concerns or areas to focus on during the analysis..."
        />
      </div>

      {/* Action Button */}
      <div className="flex justify-between items-center">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
        >
          Analyze Documents
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">0 of 10 files selected</span>
      </div>
    </div>
  );
};

export default DocAnalysis;
