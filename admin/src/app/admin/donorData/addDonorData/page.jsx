"use client"
import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Users,
  Info,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';

const AddDonorDataPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadResults, setUploadResults] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setMessage('');
        setSuccess(false);
        setUploadResults(null);
      } else {
        setMessage('Please select a valid CSV file');
        setSuccess(false);
        setSelectedFile(null);
      }
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setMessage('');
        setSuccess(false);
        setUploadResults(null);
      } else {
        setMessage('Please select a valid CSV file');
        setSuccess(false);
        setSelectedFile(null);
      }
    }
  };

  // Remove selected file
  const removeSelectedFile = () => {
    setSelectedFile(null);
    setMessage('');
    setSuccess(false);
    setUploadResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download sample CSV template
  const downloadSampleCSV = () => {
    const sampleData = [
      ['full_name', 'email', 'phone', 'address', 'donation_amount', 'donation_date', 'payment_method', 'notes'],
      ['John Doe', 'john.doe@example.com', '+1-234-567-8900', '123 Main St, City, State 12345', '500.00', '2024-01-15', 'Credit Card', 'Monthly donor'],
      ['Jane Smith', 'jane.smith@example.com', '+1-234-567-8901', '456 Oak Ave, City, State 12346', '250.00', '2024-01-20', 'Bank Transfer', 'First time donor'],
      ['Robert Johnson', 'robert.j@example.com', '+1-234-567-8902', '789 Pine Rd, City, State 12347', '1000.00', '2024-01-25', 'Check', 'Corporate sponsor']
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'donor_data_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast('Sample CSV template downloaded successfully!');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage('Please select a CSV file to upload');
      setSuccess(false);
      return;
    }
    
    setLoading(true);
    setSuccess(false);
    setMessage('');
    setUploadProgress(0);
    setUploadResults(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      
      const response = await fetch('/api/donorData', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload donor data');
      }
      
      setSuccess(true);
      setUploadResults(data);
      toast('Donor data uploaded successfully!');
      
      // Reset form after successful upload
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (err) {
      setSuccess(false);
      setMessage(err.message || 'Failed to upload donor data');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedFile(null);
    setMessage('');
    setSuccess(false);
    setUploadResults(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Users className="h-8 w-8 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Donor Data</h1>
              <p className="text-gray-600 dark:text-gray-400">Upload donor information using CSV file</p>
            </div>
          </div>
          <button
            onClick={downloadSampleCSV}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:ring-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4" />
            <span>Download Template</span>
          </button>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`rounded-lg p-4 border ${
            success 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {success ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              <p className={`font-medium ${
                success 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {message}
              </p>
            </div>
          </div>
        )}

        {/* Upload Results */}
        {uploadResults && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Upload Complete</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <p className="text-gray-600 dark:text-gray-400">Total Records</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{uploadResults.totalRecords || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <p className="text-gray-600 dark:text-gray-400">Successfully Added</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{uploadResults.successCount || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <p className="text-gray-600 dark:text-gray-400">Failed Records</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{uploadResults.failureCount || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload CSV File</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select a CSV file containing donor information to upload to the system
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* File Upload Area */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>CSV File</span>
                  <span className="text-red-500">*</span>
                </div>
              </label>
              
              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Choose a CSV file or drag it here
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Upload your donor data in CSV format
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    Select File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(selectedFile.size)} • CSV File
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {loading && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload Donor Data</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Instructions Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                CSV Upload Instructions
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Required Columns:</strong> full_name, email, phone, address, donation_amount, donation_date, payment_method</li>
                  <li><strong>Optional Columns:</strong> notes (additional information about the donor)</li>
                  <li><strong>Date Format:</strong> Use YYYY-MM-DD format for donation_date (e.g., 2024-01-15)</li>
                  <li><strong>Amount Format:</strong> Use decimal format for donation_amount (e.g., 500.00)</li>
                  <li><strong>File Size:</strong> Maximum file size is 10MB</li>
                  <li><strong>Encoding:</strong> Ensure your CSV file is UTF-8 encoded</li>
                  <li><strong>Email Validation:</strong> All email addresses will be validated during upload</li>
                  <li><strong>Duplicates:</strong> Duplicate email addresses will be skipped automatically</li>
                </ul>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Sample CSV Format:</p>
                <div className="mt-2 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700 p-3 text-xs font-mono overflow-x-auto">
                  full_name,email,phone,address,donation_amount,donation_date,payment_method,notes<br/>
                  John Doe,john.doe@example.com,+1-234-567-8900,"123 Main St, City",500.00,2024-01-15,Credit Card,Monthly donor
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDonorDataPage;