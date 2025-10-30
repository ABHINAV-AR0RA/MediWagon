import React, { useState } from 'react';
import { Navbar } from '../navbar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { ChevronLeft, Upload, FileText, Download, Eye } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface HealthRecordsProps {
  isDark: boolean;
  toggleTheme: () => void;
  onBack: () => void;
  onLogoClick?: () => void;
  onLogout?: () => void;
  onProfileClick?: () => void;
}

interface HealthRecord {
  id: number;
  name: string;
  type: string;
  date: string;
  thumbnail: string;
  summary?: string;
}

export const HealthRecords: React.FC<HealthRecordsProps> = ({ isDark, toggleTheme, onBack, onLogoClick, onLogout, onProfileClick }) => {
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([
    {
      id: 1,
      name: 'Blood Test Report',
      type: 'Lab Report',
      date: 'Oct 15, 2025',
      thumbnail: 'https://images.unsplash.com/photo-1631543722888-01f8a17ebf3f?w=300',
      summary: 'Your blood test results show normal levels across all parameters. Hemoglobin: 14.2 g/dL (Normal), White Blood Cell Count: 7,200/µL (Normal), Platelet Count: 250,000/µL (Normal). All values are within healthy ranges.'
    },
    {
      id: 2,
      name: 'X-Ray Chest',
      type: 'Imaging',
      date: 'Oct 10, 2025',
      thumbnail: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300',
      summary: 'Chest X-ray shows clear lung fields with no signs of infection, consolidation, or masses. Heart size is normal. No pleural effusion detected. Overall findings are unremarkable.'
    },
    {
      id: 3,
      name: 'Prescription - Dr. Chen',
      type: 'Prescription',
      date: 'Oct 5, 2025',
      thumbnail: 'https://images.unsplash.com/photo-1631669969504-f35518bf96ba?w=300',
      summary: 'Prescribed medications: Amoxicillin 500mg (3 times daily for 7 days), Ibuprofen 400mg (as needed for pain). Follow-up recommended in 2 weeks.'
    },
    {
      id: 4,
      name: 'Vaccination Record',
      type: 'Immunization',
      date: 'Sep 28, 2025',
      thumbnail: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=300',
      summary: 'COVID-19 booster dose administered. No adverse reactions reported. Next vaccination due in 6 months.'
    },
    {
      id: 5,
      name: 'Lipid Profile',
      type: 'Lab Report',
      date: 'Sep 20, 2025',
      thumbnail: 'https://images.unsplash.com/photo-1631543722888-01f8a17ebf3f?w=300',
      summary: 'Total Cholesterol: 185 mg/dL (Normal), LDL: 110 mg/dL (Optimal), HDL: 55 mg/dL (Good), Triglycerides: 100 mg/dL (Normal). Maintain healthy diet and exercise routine.'
    }
  ]);

  const handleFileUpload = () => {
    // Simulate file upload
    const newRecord: HealthRecord = {
      id: records.length + 1,
      name: 'New Report',
      type: 'Lab Report',
      date: new Date().toLocaleDateString(),
      thumbnail: 'https://images.unsplash.com/photo-1631543722888-01f8a17ebf3f?w=300',
      summary: 'Report uploaded successfully. MediWagon is analyzing...'
    };
    setRecords([newRecord, ...records]);
    setSelectedRecord(newRecord);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        userName="Gayathri" 
        onLogoClick={onLogoClick}
        onLogout={onLogout}
        onProfileClick={onProfileClick}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="rounded-2xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2>Health Records</h2>
              <p className="text-muted-foreground">Upload and manage your medical reports</p>
            </div>
          </div>
          <Button 
            className="rounded-2xl gap-2"
            onClick={handleFileUpload}
          >
            <Upload className="w-4 h-4" />
            Upload Report
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Records List */}
          <Card className="rounded-3xl shadow-lg border-border lg:col-span-1">
            <CardHeader>
              <CardTitle>My Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-3">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      onClick={() => setSelectedRecord(record)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all ${
                        selectedRecord?.id === record.id
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-secondary/50 hover:bg-secondary border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <ImageWithFallback
                          src={record.thumbnail}
                          alt={record.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{record.name}</p>
                          <p className="text-muted-foreground">{record.type}</p>
                          <p className="text-muted-foreground">{record.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Report Preview & Summary */}
          <Card className="rounded-3xl shadow-lg border-border lg:col-span-2">
            {selectedRecord ? (
              <>
                <CardHeader className="border-b border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedRecord.name}</CardTitle>
                      <p className="text-muted-foreground">{selectedRecord.type} • {selectedRecord.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="rounded-2xl">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-2xl">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <ImageWithFallback
                      src={selectedRecord.thumbnail}
                      alt={selectedRecord.name}
                      className="w-full h-64 rounded-2xl object-cover"
                    />
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-cyan-500/5 border border-primary/10">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="mb-1">MediWagon's Summary</h4>
                        <p className="text-muted-foreground">AI-generated explanation in simple language</p>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-card">
                      <p className="leading-relaxed">
                        {selectedRecord.summary || 'No summary available yet. Upload a report to get AI-powered insights.'}
                      </p>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-accent/10 border border-accent/20">
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">Note:</strong> This is an AI-generated summary for informational purposes. Always consult with your healthcare provider for medical advice.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center h-[calc(100vh-250px)]">
                <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
                  <FileText className="w-16 h-16 text-primary" />
                </div>
                <h3 className="mb-2">No Report Selected</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  Select a report from the list to view details and AI-generated summary
                </p>
                <Button 
                  className="rounded-2xl gap-2"
                  onClick={handleFileUpload}
                >
                  <Upload className="w-4 h-4" />
                  Upload New Report
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
