import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Upload, Download, AlertCircle } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import type { ImportEmployeeData } from '~backend/employee/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface EmployeeImportProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function EmployeeImport({ onClose, onSuccess }: EmployeeImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportEmployeeData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const backend = useBackend();

  const importMutation = useMutation({
    mutationFn: (employees: ImportEmployeeData[]) => 
      backend.employee.importEmployees({ employees }),
    onSuccess: (data) => {
      toast({
        title: data.success ? "Import Successful" : "Import Completed with Errors",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      
      if (data.errors.length > 0) {
        setErrors(data.errors);
      } else {
        onSuccess();
      }
    },
    onError: (error: any) => {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import employees",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(selectedFile);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    
    return result;
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      toast({
        title: "Invalid CSV",
        description: "CSV file must have at least a header row and one data row",
        variant: "destructive",
      });
      return;
    }

    const headers = parseCSVLine(lines[0]);
    const data: ImportEmployeeData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length < 3) continue; // Skip incomplete rows

      const employee: ImportEmployeeData = {
        employeeId: values[0] || '',
        name: values[1] || '',
        nik: values[2] || '',
        department: values[3] || undefined,
        position: values[4] || undefined,
        email: values[5] || undefined,
        phone: values[6] || undefined,
        address: values[7] || undefined,
        hireDate: values[8] || undefined,
      };

      data.push(employee);
    }

    setPreview(data);
  };

  const handleImport = () => {
    if (preview.length === 0) {
      toast({
        title: "No Data",
        description: "No valid employee data to import",
        variant: "destructive",
      });
      return;
    }

    importMutation.mutate(preview);
  };

  const downloadTemplate = () => {
    const template = [
      'Employee ID,Name,NIK,Department,Position,Email,Phone,Address,Hire Date',
      'EMP001,"John Doe",1234567890123456,"IT","Software Engineer","john@example.com","08123456789","Jl. Example No. 1",2024-01-15',
      'EMP002,"Jane Smith",9876543210987654,"HR","HR Manager","jane@example.com","08987654321","Jl. Sample No. 2",2024-02-01',
      'EMP003,"Fitri Yanto, S.Si.",1122334455667788,"Research","Research Scientist","fitri@example.com","08111222333","Jl. Research St. 3",2024-03-01'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'employee_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-semibold">Import Employees</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">CSV Format Requirements</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Your CSV file should have the following columns in order:
                  Employee ID, Name, NIK, Department, Position, Email, Phone, Address, Hire Date
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  <strong>Important:</strong> If names contain commas (like "Fitri Yanto, S.Si."), wrap them in double quotes.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                  className="mt-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {preview.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Preview ({preview.length} employees)
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Employee ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          NIK
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Department
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Position
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.slice(0, 10).map((emp, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{emp.employeeId}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{emp.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{emp.nik}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{emp.department || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{emp.position || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.length > 10 && (
                  <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600">
                    ... and {preview.length - 10} more employees
                  </div>
                )}
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-2">Import Errors</h3>
              <div className="max-h-40 overflow-y-auto">
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={preview.length === 0 || importMutation.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              {importMutation.isPending ? 'Importing...' : `Import ${preview.length} Employees`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
