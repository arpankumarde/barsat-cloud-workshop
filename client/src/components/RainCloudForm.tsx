import React, { useState } from 'react';
import { Cloud, CloudRain, Send } from 'lucide-react';
import FormInput from './FormInput';
import FileUpload from './FileUpload';
import { uploadFile } from '../barsat/uploadFile';

interface FormData {
  username: string;
  file: File | null;
}

interface FormErrors {
  username?: string;
  file?: string;
}

const RainCloudForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    file: null
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summaryMessage, setSummaryMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.file) {
      newErrors.file = 'Please upload a file';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSummaryMessage('Generating summary of your file...');
    // Simulate form submission
    setTimeout(() => {
      console.log('=== FORM SUBMISSION DATA ===');
      console.log('Username:', formData.username);
      console.log('File:', formData.file);
      
      if (formData.file) {
        console.log('File Details:');
        console.log('- Name:', formData.file.name);
        console.log('- Size:', formData.file.size, 'bytes');
        console.log('- Type:', formData.file.type);
        console.log('- Last Modified:', new Date(formData.file.lastModified));
      }
      
      console.log('=== END SUBMISSION DATA ===');
      
      setSummaryMessage('');
      setIsSubmitting(false);
      
      // Reset form
      setFormData({
        username: '',
        file: null
      });
      setErrors({});
      
      alert('Form submitted successfully! Check mail box for summary.');
    }, 2000);
  };

  const updateFormData = async (field: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
    if (field === "file" && value instanceof File) {
    try {
      const panCardFileExt = value.name.split(".").pop();
      const panCardUpload = await uploadFile({
        file: value,
        fileExt: panCardFileExt || "",
        folderPath: `barsat`,
        fileName: value.name,
      });
      console.log("File uploaded to S3:", panCardUpload);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white border-b border-gray-700">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <CloudRain className="w-8 h-8 text-blue-400" />
          <h1 className="text-2xl font-bold">Barsat Form</h1>
          <Cloud className="w-8 h-8 text-blue-400" />
        </div>
        <p className="text-center text-gray-300 text-sm">
          Generate Summary of Your File
        </p>
      </div>

      {summaryMessage && (
  <div className="text-center text-sm text-blue-400 bg-gray-800 p-2 border-b border-gray-700">
    {summaryMessage}
  </div>
)}


      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <FormInput
          label="Username"
          type="text"
          value={formData.username}
          onChange={(value) => updateFormData('username', value)}
          placeholder="Enter your username"
          required
          error={errors.username}
        />

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Upload File
            <span className="text-red-500 ml-1">*</span>
          </label>
          <FileUpload
            onFileSelect={(file) => updateFormData('file', file)}
            selectedFile={formData.file}
          />
          {errors.file && (
            <p className="text-red-500 text-sm mt-1">{errors.file}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Get Summary</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default RainCloudForm;