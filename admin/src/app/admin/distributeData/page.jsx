"use client"
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Search,
  ChevronRight,
  ChevronLeft,
  Database,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Filter,
  X,
  Eye,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  SortAsc,
  SortDesc
} from 'lucide-react';

const DistributeDonorDataForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Step 1: Candidate Selection
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  
  // Step 2: Donor Data Selection
  const [donorData, setDonorData] = useState([]);
  const [selectedDonorData, setSelectedDonorData] = useState([]);
  const [donorSearch, setDonorSearch] = useState('');
  const [loadingDonorData, setLoadingDonorData] = useState(false);
  const [donorFilter, setDonorFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Date field (auto-filled with today's date)
  const [distributionDate, setDistributionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  const candidateScrollRef = useRef(null);
  const donorScrollRef = useRef(null);

  // Fetch candidates on component mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  // Fetch donor data when moving to step 2
  useEffect(() => {
    if (currentStep === 2) {
      fetchDonorData();
    }
  }, [currentStep]);

  // Filter candidates based on search
  useEffect(() => {
    if (candidateSearch.trim()) {
      const filtered = candidates.filter(candidate =>
        candidate.name?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
        candidate.phone?.toLowerCase().includes(candidateSearch.toLowerCase())
      );
      setFilteredCandidates(filtered);
    } else {
      setFilteredCandidates(candidates);
    }
  }, [candidateSearch, candidates]);

  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const response = await fetch('/api/users/candidate');
      if (!response.ok) throw new Error('Failed to fetch candidates');
      const data = await response.json();
      setCandidates(data.candidates || []);
      setFilteredCandidates(data.candidates || []);
    } catch (error) {
      setMessage('Failed to load candidates: ' + error.message);
      setSuccess(false);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const fetchDonorData = async () => {
    setLoadingDonorData(true);
    try {
      const response = await fetch('/api/donorData');
      if (!response.ok) throw new Error('Failed to fetch donor data');
      const data = await response.json();
      console.log(data)
      setDonorData(data.donors || []);
    } catch (error) {
      setMessage('Failed to load donor data: ' + error.message);
      setSuccess(false);
    } finally {
      setLoadingDonorData(false);
    }
  };

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
    setMessage('');
    setSuccess(false);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!selectedCandidate) {
        setMessage('Please select a candidate to continue');
        setSuccess(false);
        return;
      }
      setCurrentStep(2);
      setMessage('');
      setSuccess(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setMessage('');
      setSuccess(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCandidate) {
      setMessage('Please select a candidate');
      setSuccess(false);
      return;
    }
    
    if (selectedDonorData.length === 0) {
      setMessage('Please select at least one donor data record');
      setSuccess(false);
      return;
    }
    
    setSubmitting(true);
    setMessage('');
    setSuccess(false);
    
    try {
      const response = await fetch('/api/distributedDonorData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate: selectedCandidate._id,
          donorData: selectedDonorData.map(d => d._id),
          date: distributionDate,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to distribute donor data');
      }
      
      const result = await response.json();
      setSuccess(true);
      setMessage(`Successfully distributed ${selectedDonorData.length} donor records to ${selectedCandidate.name}`);
      
      // Reset form
      setTimeout(() => {
        setCurrentStep(1);
        setSelectedCandidate(null);
        setSelectedDonorData([]);
        setCandidateSearch('');
        setDonorSearch('');
        setDonorFilter('all');
        setMessage('');
        setSuccess(false);
      }, 3000);
      
    } catch (error) {
      setSuccess(false);
      setMessage(error.message || 'Failed to distribute donor data');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter and sort donors
  const filteredDonorData = useMemo(() => {
    let filtered = donorData.filter(donor => {
      // Search filter
      const searchTerm = donorSearch.toLowerCase();
      const matchesSearch = !searchTerm || 
        donor.fullName.toLowerCase().includes(searchTerm) ||
        donor.email.toLowerCase().includes(searchTerm) ||
        donor.phone.includes(searchTerm) ||
        donor.address.toLowerCase().includes(searchTerm);

      // Amount filter (converted to INR ranges)
      let matchesAmount = true;
      switch (donorFilter) {
        case 'small':
          matchesAmount = donor.donationAmount <= 2000; // ≤ ₹2,000
          break;
        case 'medium':
          matchesAmount = donor.donationAmount > 2000 && donor.donationAmount <= 10000; // ₹2,000 - ₹10,000
          break;
        case 'large':
          matchesAmount = donor.donationAmount > 10000; // > ₹10,000
          break;
        default:
          matchesAmount = true;
      }

      return matchesSearch && matchesAmount;
    });

    // Sort donors
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
          break;
        case 'amount':
          aValue = a.donationAmount;
          bValue = b.donationAmount;
          break;
        case 'date':
          aValue = new Date(a.donationDate);
          bValue = new Date(b.donationDate);
          break;
        default:
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [donorData, donorSearch, donorFilter, sortBy, sortOrder]);

  const handleDonorDataToggle = (donor) => {
    setSelectedDonorData(prev => {
      const isSelected = prev.find(d => d._id === donor._id);
      if (isSelected) {
        return prev.filter(d => d._id !== donor._id);
      } else {
        return [...prev, donor];
      }
    });
  };

  const handleSelectAllDonorData = () => {
    if (selectedDonorData.length === filteredDonorData.length) {
      setSelectedDonorData([]);
    } else {
      setSelectedDonorData([...filteredDonorData]);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Log selected donors to console
  const logSelectedDonors = () => {
    console.log('Selected Donors:', selectedDonorData);
    console.log('Total Selected:', selectedDonorData.length);
    console.log('Total Amount:', selectedDonorData.reduce((sum, donor) => sum + donor.donationAmount, 0));
  };

  // Call logSelectedDonors whenever selection changes
  useEffect(() => {
    if (selectedDonorData.length > 0) {
      logSelectedDonors();
    }
  }, [selectedDonorData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Database className="h-8 w-8 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Distribute Donor Data</h1>
              <p className="text-gray-600 dark:text-gray-400">Assign donor information to candidates</p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              currentStep === 1 
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                : selectedCandidate 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Select Candidate</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              currentStep === 2 
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Select Data</span>
            </div>
          </div>
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

        {/* Distribution Date */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Distribution Date
              </label>
              <input
                type="date"
                value={distributionDate}
                onChange={(e) => setDistributionDate(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Step 1: Candidate Selection */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Candidate</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Choose a candidate to distribute donor data to
                  </p>
                </div>
                {selectedCandidate && (
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Selected: {selectedCandidate.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates by name, email, or phone..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Candidates List */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
                <div 
                  ref={candidateScrollRef}
                  className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
                >
                  {loadingCandidates ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600 dark:text-gray-400">Loading candidates...</span>
                    </div>
                  ) : filteredCandidates.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No candidates found
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-600">
                      {filteredCandidates.map((candidate) => (
                        <div
                          key={candidate._id}
                          onClick={() => handleCandidateSelect(candidate)}
                          className={`p-4 cursor-pointer transition-colors ${
                            selectedCandidate?._id === candidate._id
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {candidate.name}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                  <div className="flex items-center space-x-1">
                                    <Mail className="h-3 w-3" />
                                    <span>{candidate.email}</span>
                                  </div>
                                  {candidate.phone && (
                                    <div className="flex items-center space-x-1">
                                      <Phone className="h-3 w-3" />
                                      <span>{candidate.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            {selectedCandidate?._id === candidate._id && (
                              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Donor Data Selection */}
        {currentStep === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Donor Data</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose donor data records to distribute to {selectedCandidate?.name}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <Database className="h-4 w-4" />
            <span className="text-sm font-medium">
              {selectedDonorData.length} of {filteredDonorData.length} selected
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search donors by name, email, phone, or address..."
              value={donorSearch}
              onChange={(e) => setDonorSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={donorFilter}
              onChange={(e) => setDonorFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Amounts</option>
              <option value="small">≤ ₹2,000</option>
              <option value="medium">₹2,000 - ₹10,000</option>
              <option value="large"> ₹10,000</option>
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSort('name')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
                  sortBy === 'name' 
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>Name</span>
                {sortBy === 'name' && (
                  sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={() => handleSort('amount')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
                  sortBy === 'amount' 
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>Amount</span>
                {sortBy === 'amount' && (
                  sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={() => handleSort('date')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
                  sortBy === 'date' 
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>Date</span>
                {sortBy === 'date' && (
                  sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Select All Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSelectAllDonorData}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            {selectedDonorData.length === filteredDonorData.length ? 'Deselect All' : 'Select All'}
          </button>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Total: {filteredDonorData.length} records</span>
            {selectedDonorData.length > 0 && (
              <span className="text-green-600 dark:text-green-400 font-medium">
                Selected Amount: {formatCurrency(selectedDonorData.reduce((sum, donor) => sum + donor.donationAmount, 0))}
              </span>
            )}
          </div>
        </div>
        
        {/* Donor Data List */}
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
          <div 
            ref={donorScrollRef}
            className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
          >
            {loadingDonorData ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading donor data...</span>
              </div>
            ) : filteredDonorData.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No donor data found matching your criteria
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredDonorData.map((donor) => {
                  const isSelected = selectedDonorData.find(d => d._id === donor._id);
                  return (
                    <div
                      key={donor._id}
                      onClick={() => handleDonorDataToggle(donor)}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {donor.fullName}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{donor.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span>{donor.phone}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="font-medium text-green-600 dark:text-green-400">
                                  {formatCurrency(donor.donationAmount)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                <span>{formatDate(donor.donationDate)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{donor.address}</span>
                            </div>
                            {donor.notes && (
                              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 italic">
                                "{donor.notes}"
                              </div>
                            )}
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Payment: {donor.paymentMethod}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {selectedDonorData.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Selection Summary</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedDonorData.length} donors selected with total donations of{' '}
                  <span className="font-semibold">
                    {formatCurrency(selectedDonorData.reduce((sum, donor) => sum + donor.donationAmount, 0))}
                  </span>
                </p>
              </div>
              <button
                onClick={logSelectedDonors}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Log Selection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
        )}

        {/* Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              {currentStep === 2 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {currentStep === 1 && (
                <button
                  onClick={handleNext}
                  disabled={!selectedCandidate}
                  className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors focus:ring-2 focus:ring-blue-500"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
              
              {currentStep === 2 && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || selectedDonorData.length === 0}
                  className="flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors focus:ring-2 focus:ring-green-500"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Distributing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Distribute Data</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributeDonorDataForm;