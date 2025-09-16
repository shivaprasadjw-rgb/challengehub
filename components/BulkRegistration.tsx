'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, FileText, Users, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface BulkRegistrationProps {
  organizerSlug: string
  tournamentId: string
  tournamentTitle: string
  onRegistrationsUpdated?: () => void
}

interface BulkResult {
  successful: number
  failed: number
  errors: string[]
}

export default function BulkRegistration({ 
  organizerSlug, 
  tournamentId, 
  tournamentTitle,
  onRegistrationsUpdated 
}: BulkRegistrationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [result, setResult] = useState<BulkResult | null>(null)
  const [error, setError] = useState('')
  const [jsonData, setJsonData] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sampleCSV = `playerName,playerEmail,playerPhone,playerAge,playerGender,playerCategory
John Doe,john@example.com,+91-9876543210,25,MALE,Men's Singles
Jane Smith,jane@example.com,+91-9876543211,23,FEMALE,Women's Singles
Bob Johnson,bob@example.com,+91-9876543212,30,MALE,Men's Singles`

  const sampleJSON = `{
  "registrations": [
    {
      "playerName": "John Doe",
      "playerEmail": "john@example.com", 
      "playerPhone": "+91-9876543210",
      "playerAge": 25,
      "playerGender": "MALE",
      "playerCategory": "Men's Singles"
    },
    {
      "playerName": "Jane Smith",
      "playerEmail": "jane@example.com",
      "playerPhone": "+91-9876543211", 
      "playerAge": 23,
      "playerGender": "FEMALE",
      "playerCategory": "Women's Singles"
    }
  ]
}`

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setError('')
      setResult(null)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/organizer/${organizerSlug}/tournaments/${tournamentId}/registrations/bulk`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data.results)
        if (onRegistrationsUpdated) {
          onRegistrationsUpdated()
        }
      } else {
        setError(data.error || 'Failed to upload registrations')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setError('Failed to upload file')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleJSONSubmit = async () => {
    if (!jsonData.trim()) {
      setError('Please enter registration data')
      return
    }

    try {
      setUploading(true)
      setError('')
      setResult(null)

      const parsedData = JSON.parse(jsonData)
      
      const response = await fetch(`/api/organizer/${organizerSlug}/tournaments/${tournamentId}/registrations/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedData)
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data.results)
        setJsonData('')
        if (onRegistrationsUpdated) {
          onRegistrationsUpdated()
        }
      } else {
        setError(data.error || 'Failed to process registrations')
      }
    } catch (error) {
      console.error('Error processing JSON:', error)
      if (error instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your data.')
      } else {
        setError('Failed to process registrations')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const response = await fetch(`/api/organizer/${organizerSlug}/tournaments/${tournamentId}/registrations/bulk`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${tournamentTitle}-registrations.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to export registrations')
      }
    } catch (error) {
      console.error('Error exporting registrations:', error)
      setError('Failed to export registrations')
    } finally {
      setExporting(false)
    }
  }

  const downloadSampleCSV = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-registrations.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk Registration Management
        </CardTitle>
        <CardDescription>
          Import multiple registrations or export existing registration data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Import Registrations
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import Bulk Registrations</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {error && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {result && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">Import completed!</p>
                        <div className="flex gap-4 text-sm">
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            {result.successful} Successful
                          </Badge>
                          {result.failed > 0 && (
                            <Badge variant="destructive">
                              {result.failed} Failed
                            </Badge>
                          )}
                        </div>
                        {result.errors.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-red-600">Errors:</p>
                            <ul className="text-xs text-red-600 list-disc list-inside max-h-32 overflow-y-auto">
                              {result.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* CSV Upload */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Upload CSV File</h3>
                    <p className="text-sm text-gray-600">
                      Upload a CSV file with participant registration data
                    </p>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="csv-upload"
                        />
                        <label
                          htmlFor="csv-upload"
                          className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploading ? 'Uploading...' : 'Choose CSV File'}
                        </label>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Only CSV files are supported
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
                      <Download className="h-3 w-3 mr-1" />
                      Download Sample CSV
                    </Button>
                  </div>
                </div>

                {/* JSON Input */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Enter JSON Data</h3>
                    <p className="text-sm text-gray-600">
                      Paste registration data in JSON format
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="json-data">Registration Data (JSON)</Label>
                    <Textarea
                      id="json-data"
                      value={jsonData}
                      onChange={(e) => setJsonData(e.target.value)}
                      placeholder={sampleJSON}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleJSONSubmit} 
                    disabled={!jsonData.trim() || uploading}
                    className="w-full"
                  >
                    {uploading ? 'Processing...' : 'Import JSON Data'}
                  </Button>
                </div>

                {/* Format Requirements */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Format Requirements</h4>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1">
                        <li>• <strong>playerName:</strong> Full name of the participant</li>
                        <li>• <strong>playerEmail:</strong> Valid email address (must be unique)</li>
                        <li>• <strong>playerPhone:</strong> Contact phone number</li>
                        <li>• <strong>playerAge:</strong> Age between 5-100</li>
                        <li>• <strong>playerGender:</strong> MALE, FEMALE, OTHER, or PREFER_NOT_TO_SAY</li>
                        <li>• <strong>playerCategory:</strong> Tournament category (e.g., "Men's Singles")</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export Registrations'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}