"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";

// Custom Button component using Tailwind CSS
const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = "primary",
  size = "md",
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const baseClasses = "font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    outline: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

// Custom Card component using Tailwind CSS
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// Custom Badge component using Tailwind CSS
const Badge = ({ 
  children, 
  variant = "default",
  className = ""
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800"
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Custom Alert component using Tailwind CSS
const Alert = ({ 
  children, 
  variant = "default",
  className = ""
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}) => {
  const baseClasses = "p-4 rounded-md border";
  
  const variantClasses = {
    default: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

const AlertDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-sm ${className}`}>
    {children}
  </div>
);

// Custom icons using simple SVG or text
const Loader2 = ({ className = "animate-spin h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const Upload = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const FileSpreadsheet = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const AlertCircle = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircle = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const X = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface ExcelUploadProps {
  tournamentId: string;
  onUploadSuccess: (participants: any[]) => void;
}

interface Participant {
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  phone: string;
  email: string;
  address: string;
  schoolOrEmployer: string;
  playerPhoto?: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  knownAllergies: string;
  priorMedicalConditions: string;
  currentMedications: string;
  medicalReleaseConsent: boolean;
  playerSkillLevel: 'Professional' | 'Advanced' | 'Intermediate' | 'Beginner';
  pastPerformance?: string;
  waiversAcknowledged: boolean;
  mediaConsentAcknowledged: boolean;
  paymentScreenshot?: string;
  transactionId: string;
}

export default function ExcelUpload({ tournamentId, onUploadSuccess }: ExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate CSRF token on component mount
  useState(() => {
    setCsrfToken(crypto.randomUUID());
  });

  // Get session ID from localStorage
  const getSessionId = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminSessionId');
    }
    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please select a valid Excel file (.xlsx, .xls) or CSV file');
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const parseExcelFile = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        setError('Excel file must have at least a header row and one data row');
        return;
      }

      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);

      // Map flexible column names to standard fields
      const columnMapping: { [key: string]: string } = {
        'full name': 'fullName',
        'fullname': 'fullName',
        'name': 'fullName',
        'first name': 'fullName',
        'firstname': 'fullName',
        'date of birth': 'dateOfBirth',
        'dateofbirth': 'dateOfBirth',
        'dob': 'dateOfBirth',
        'birth date': 'dateOfBirth',
        'birthdate': 'dateOfBirth',
        'phone': 'phone',
        'phone number': 'phone',
        'phonenumber': 'phone',
        'mobile': 'phone',
        'mobile number': 'phone',
        'mobilenumber': 'phone',
        'contact': 'phone',
        'contact number': 'phone',
        'contactnumber': 'phone',
        'school or employer': 'schoolOrEmployer',
        'schooloremployer': 'schoolOrEmployer',
        'school': 'schoolOrEmployer',
        'employer': 'schoolOrEmployer',
        'organization': 'schoolOrEmployer',
        'company': 'schoolOrEmployer',
        'emergency contact name': 'emergencyContactName',
        'emergencycontactname': 'emergencyContactName',
        'emergency name': 'emergencyContactName',
        'emergencyname': 'emergencyContactName',
        'emergency contact': 'emergencyContactName',
        'emergencycontact': 'emergencyContactName',
        'emergency contact relationship': 'emergencyContactRelationship',
        'emergencycontactrelationship': 'emergencyContactRelationship',
        'emergency relationship': 'emergencyContactRelationship',
        'emergencyrelationship': 'emergencyContactRelationship',
        'relationship': 'emergencyContactRelationship',
        'emergency contact phone': 'emergencyContactPhone',
        'emergencycontactphone': 'emergencyContactPhone',
        'emergency phone': 'emergencyContactPhone',
        'emergencyphone': 'emergencyContactPhone',
        'emergency contact number': 'emergencyContactPhone',
        'emergencycontactnumber': 'emergencyContactPhone',
        'known allergies': 'knownAllergies',
        'knownallergies': 'knownAllergies',
        'allergies': 'knownAllergies',
        'prior medical conditions': 'priorMedicalConditions',
        'priormedicalconditions': 'priorMedicalConditions',
        'medical conditions': 'priorMedicalConditions',
        'medicalconditions': 'priorMedicalConditions',
        'current medications': 'currentMedications',
        'currentmedications': 'currentMedications',
        'medications': 'currentMedications',
        'medical release consent': 'medicalReleaseConsent',
        'medicalreleaseconsent': 'medicalReleaseConsent',
        'medical consent': 'medicalReleaseConsent',
        'medicalconsent': 'medicalReleaseConsent',
        'player skill level': 'playerSkillLevel',
        'playerskilllevel': 'playerSkillLevel',
        'skill level': 'playerSkillLevel',
        'skilllevel': 'playerSkillLevel',
        'level': 'playerSkillLevel',
        'past performance': 'pastPerformance',
        'pastperformance': 'pastPerformance',
        'performance': 'pastPerformance',
        'waivers acknowledged': 'waiversAcknowledged',
        'waiversacknowledged': 'waiversAcknowledged',
        'waivers': 'waiversAcknowledged',
        'media consent acknowledged': 'mediaConsentAcknowledged',
        'mediaconsentacknowledged': 'mediaConsentAcknowledged',
        'media consent': 'mediaConsentAcknowledged',
        'mediaconsent': 'mediaConsentAcknowledged',
        'payment screenshot': 'paymentScreenshot',
        'paymentscreenshot': 'paymentScreenshot',
        'payment': 'paymentScreenshot',
        'screenshot': 'paymentScreenshot',
        'transaction id': 'transactionId',
        'transactionid': 'transactionId',
        'transaction': 'transactionId',
        'txn id': 'transactionId',
        'txnid': 'transactionId'
      };

      const mappedHeaders = headers.map(header => {
        const lowerHeader = header.toLowerCase().trim();
        return columnMapping[lowerHeader] || header;
      });

      const parsedParticipants: Participant[] = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i] as any[];
        if (row.every(cell => !cell)) continue; // Skip empty rows

        const participant: any = {};
        
        mappedHeaders.forEach((mappedHeader, index) => {
          if (mappedHeader && row[index] !== undefined) {
            participant[mappedHeader] = row[index];
          }
        });

        // Set default values for required fields
        participant.medicalReleaseConsent = participant.medicalReleaseConsent !== false;
        participant.waiversAcknowledged = participant.waiversAcknowledged !== false;
        participant.mediaConsentAcknowledged = participant.mediaConsentAcknowledged !== false;

        // Validate required fields
        const requiredFields = ['fullName', 'dateOfBirth', 'gender', 'phone', 'email', 'address', 'schoolOrEmployer'];
        const missingFields = requiredFields.filter(field => !participant[field]);
        
        if (missingFields.length > 0) {
          setError(`Row ${i + 2}: Missing required fields: ${missingFields.join(', ')}`);
          return;
        }

        // Validate gender
        if (!['Male', 'Female'].includes(participant.gender)) {
          setError(`Row ${i + 2}: Gender must be 'Male' or 'Female'`);
          return;
        }

        // Validate player skill level
        if (participant.playerSkillLevel && !['Professional', 'Advanced', 'Intermediate', 'Beginner'].includes(participant.playerSkillLevel)) {
          setError(`Row ${i + 2}: Player skill level must be one of: Professional, Advanced, Intermediate, Beginner`);
          return;
        }

        parsedParticipants.push(participant as Participant);
      }

      if (parsedParticipants.length === 0) {
        setError('No valid participant data found in the file');
        return;
      }

      if (parsedParticipants.length > 32) {
        setError(`Maximum 32 participants allowed. Found ${parsedParticipants.length}`);
        return;
      }

      setParticipants(parsedParticipants);
      setPreviewMode(true);
      setSuccess(`Successfully parsed ${parsedParticipants.length} participants`);

    } catch (error) {
      console.error('Error parsing Excel file:', error);
      setError('Failed to parse Excel file. Please check the file format.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (participants.length === 0) {
      setError('No participants to upload');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const sessionId = getSessionId();
      if (!sessionId) {
        setError('No active session found. Please log in again.');
        return;
      }

      const response = await fetch('/api/admin/participants/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
          'x-csrf-token': csrfToken
        },
        body: JSON.stringify({
          tournamentId,
          participants
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Successfully uploaded ${participants.length} participants!`);
        onUploadSuccess(participants);
        
        // Reset form
        setFile(null);
        setParticipants([]);
        setPreviewMode(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload participants');
      }
    } catch (error) {
      console.error('Error uploading participants:', error);
      setError('Failed to upload participants');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setParticipants([]);
    setPreviewMode(false);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateTemplate = () => {
    const templateData = [
      ['Full Name', 'Date of Birth', 'Gender', 'Phone', 'Email', 'Address', 'School/Employer', 'Player Skill Level'],
      ['John Doe', '1990-01-01', 'Male', '1234567890', 'john@example.com', '123 Main St', 'ABC School', 'Intermediate'],
      ['Jane Smith', '1992-05-15', 'Female', '0987654321', 'jane@example.com', '456 Oak Ave', 'XYZ Company', 'Advanced']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Participants');
    
    XLSX.writeFile(wb, 'participants-template.xlsx');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Upload Participants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!previewMode ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Excel File:</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500">
                  Supported formats: .xlsx, .xls, .csv (Max size: 5MB)
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={parseExcelFile}
                  disabled={!file || loading}
                  className="flex-1"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Parse File
                </Button>
                <Button
                  onClick={generateTemplate}
                  variant="outline"
                  className="flex-1"
                >
                  Download Template
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Preview ({participants.length} participants)</h3>
                  <Badge variant="info">{participants.length}/32</Badge>
                </div>
                
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Phone</th>
                        <th className="p-2 text-left">Skill Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.slice(0, 10).map((participant, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{participant.fullName}</td>
                          <td className="p-2">{participant.email}</td>
                          <td className="p-2">{participant.phone}</td>
                          <td className="p-2">{participant.playerSkillLevel || 'Not specified'}</td>
                        </tr>
                      ))}
                      {participants.length > 10 && (
                        <tr>
                          <td colSpan={4} className="p-2 text-center text-gray-500">
                            ... and {participants.length - 10} more participants
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Upload {participants.length} Participants
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </>
          )}

          {error && (
            <Alert variant="error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
