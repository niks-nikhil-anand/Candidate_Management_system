"use client"
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  IndianRupee,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  Trash2,
  AlertTriangle,
  TrendingUp,
  History,
  CheckCircle
} from 'lucide-react';

const DonorDetailsPage = () => {
  const [donorId, setDonorId] = useState(null);
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    donationAmount: '',
    donationDate: '',
    paymentMethod: '',
    notes: '',
    isActive: true
  });
  
  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch donor details
  const fetchDonor = async () => {
    if (!donorId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/donorData/${donorId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch donor details');
      }

      const data = await response.json();
      console.log(data);

      setDonor(data.data);
      setFormData({
        fullName: data.data.fullName,
        email: data.data.email,
        phone: data.data.phone,
        address: data.data.address,
        donationAmount: data.data.donationAmount.toString(),
        donationDate: new Date(data.data.donationDate).toISOString().split('T')[0],
        paymentMethod: data.data.paymentMethod,
        notes: data.data.notes || '',
        isActive: data.data.isActive
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch donor details');
      console.error('Error fetching donor:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update donor
  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        donationAmount: parseFloat(formData.donationAmount),
        donationDate: new Date(formData.donationDate),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        isActive: formData.isActive
      };
      
      const response = await fetch(`/api/donorData/${donorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update donor');
      }
      
      const data = await response.json();
      setDonor(data.data);
      setEditing(false);
      setError('');
    } catch (err) {
      setError('Failed to update donor');
      console.error('Error updating donor:', err);
    } finally {
      setSaving(false);
    }
  };

  // Delete donor
  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/donorData/${donorId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete donor');
      }
      
      // Redirect to donors list
      window.location.href = '/admin/donors';
    } catch (err) {
      setError('Failed to delete donor');
      console.error('Error deleting donor:', err);
      setDeleting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get status badge classes
  const getStatusBadgeClasses = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  // Get payment method badge classes
  const getPaymentMethodBadgeClasses = (method) => {
    switch (method) {
      case 'Credit Card': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Debit Card': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Bank Transfer': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'UPI': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'PayPal': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'Cash': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Check': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle back navigation
  const handleBack = () => {
    window.location.href = '/admin/donors';
  };

  useEffect(() => {
    // Extract donorId from URL - for demo purposes, we'll use a mock ID
    const urlPath = window.location.pathname;
    const id = urlPath.split("/")[3] || "demo-donor-123";
    setDonorId(id);
  }, []);

  useEffect(() => {
    if (donorId) {
      // For demo purposes, we'll use mock data instead of API call
      setTimeout(() => {
        const mockDonor = {
          _id: donorId,
          fullName: "Rajesh Kumar",
          email: "rajesh.kumar@email.com",
          phone: "+91-9876543210",
          address: "123 MG Road, Sector 14, Gurugram, Haryana 122001",
          donationAmount: 5000,
          donationDate: "2024-01-15T10:30:00Z",
          paymentMethod: "UPI",
          notes: "Regular monthly donor, very supportive of our cause.",
          isActive: true,
          totalDonated: 25000,
          donationHistory: [
            { amount: 5000, date: "2024-01-15T10:30:00Z", paymentMethod: "UPI", notes: "Monthly donation" },
            { amount: 7500, date: "2023-12-15T10:30:00Z", paymentMethod: "Credit Card", notes: "Year-end donation" },
            { amount: 5000, date: "2023-11-15T10:30:00Z", paymentMethod: "UPI", notes: "Monthly donation" },
            { amount: 7500, date: "2023-10-15T10:30:00Z", paymentMethod: "Bank Transfer", notes: "Festival donation" }
          ],
          lastDonated: "2024-01-15T10:30:00Z",
          createdAt: "2023-06-01T08:00:00Z",
          updatedAt: "2024-01-15T10:30:00Z"
        };

        setDonor(mockDonor);
        setFormData({
          fullName: mockDonor.fullName,
          email: mockDonor.email,
          phone: mockDonor.phone,
          address: mockDonor.address,
          donationAmount: mockDonor.donationAmount.toString(),
          donationDate: new Date(mockDonor.donationDate).toISOString().split('T')[0],
          paymentMethod: mockDonor.paymentMethod,
          notes: mockDonor.notes || '',
          isActive: mockDonor.isActive
        });
        setLoading(false);
      }, 1000);
    }
  }, [donorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400" />
          <span className="text-lg text-gray-700 dark:text-gray-300">Loading donor details...</span>
        </div>
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Donor not found</h2>
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Donors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <User className="h-8 w-8 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {editing ? 'Edit Donor' : 'Donor Details'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {editing ? 'Modify donor information' : 'View and manage donor information'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {!editing ? (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      fullName: donor.fullName,
                      email: donor.email,
                      phone: donor.phone,
                      address: donor.address,
                      donationAmount: donor.donationAmount.toString(),
                      donationDate: new Date(donor.donationDate).toISOString().split('T')[0],
                      paymentMethod: donor.paymentMethod,
                      notes: donor.notes || '',
                      isActive: donor.isActive
                    });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Donor Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Donated</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(donor.totalDonated)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {donor.donationHistory?.length || 1}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <History className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Donation</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Date(donor.lastDonated).toLocaleDateString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Donor Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Donor Information
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {editing ? 'Edit the donor details below' : 'Basic information about the donor'}
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{donor.fullName}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{donor.email}</span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{donor.phone}</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                {editing ? (
                  <select
                    value={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(donor.isActive)}`}>
                      {donor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              {editing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="flex items-start space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <span className="text-gray-900 dark:text-white">{donor.address}</span>
                </div>
              )}
            </div>

            {/* Donation Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Donation Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Donation Amount
                </label>
                {editing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={formData.donationAmount}
                    onChange={(e) => handleInputChange('donationAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <IndianRupee className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {formatCurrency(donor.donationAmount)}
                    </span>
                  </div>
                )}
              </div>

              {/* Donation Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Donation Date
                </label>
                {editing ? (
                  <input
                    type="date"
                    value={formData.donationDate}
                    onChange={(e) => handleInputChange('donationDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">
                      {new Date(donor.donationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                {editing ? (
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodBadgeClasses(donor.paymentMethod)}`}>
                      {donor.paymentMethod}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              {editing ? (
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  placeholder="Add any notes about this donor..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
              ) : (
                <div className="flex items-start space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <span className="text-gray-900 dark:text-white">{donor.notes || 'No notes available.'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Donation History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Donation History</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Overview of previous donations made by this donor.
            </p>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {donor.donationHistory?.map((entry, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(entry.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodBadgeClasses(entry.paymentMethod)}`}>
                        {entry.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {entry.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Deletion</h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this donor? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDetailsPage;
