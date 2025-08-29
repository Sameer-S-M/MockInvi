
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  completedDate: string;
  score: number;
  certificateUrl?: string;
}

interface CertificateViewerProps {
  certificate: Certificate;
  userName: string;
  onClose: () => void;
  onDownload: () => void;
}

const CertificateViewer: React.FC<CertificateViewerProps> = ({ 
  certificate, 
  userName, 
  onClose, 
  onDownload 
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-5xl max-h-[92vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyrobox-primary rounded-lg flex items-center justify-center shadow">
              <svg viewBox="0 0 32 32" className="w-5 h-5">
                <path d="M16 2 L28 8 L28 20 L16 26 L4 20 L4 8 Z" fill="none" stroke="white" strokeWidth="2" />
                <path d="M8 12 L16 16 L24 12" fill="none" stroke="white" strokeWidth="2" />
                <path d="M8 16 L16 20 L24 16" fill="none" stroke="white" strokeWidth="2" />
                <path d="M8 20 L16 24 L24 20" fill="none" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="text-sm text-muted-foreground">CYROBOX</div>
              <div className="text-base font-semibold">MocKinvi by CYROBOX</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onDownload} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Branded certificate */}
          <div className="relative overflow-hidden rounded-2xl border shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950 p-10">
            {/* Decorative gradient rings */}
            <div className="pointer-events-none absolute -top-24 -left-24 w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl"></div>
            <div className="pointer-events-none absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl"></div>

            {/* Header with dual brand */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-10 h-10 bg-cyrobox-primary rounded-lg flex items-center justify-center shadow">
                <svg viewBox="0 0 32 32" className="w-6 h-6">
                  <path d="M16 2 L28 8 L28 20 L16 26 L4 20 L4 8 Z" fill="none" stroke="white" strokeWidth="2" />
                  <path d="M8 12 L16 16 L24 12" fill="none" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CYROBOX</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MocKinvi</span>
            </div>

            <div className="text-center space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl font-extrabold text-foreground">Certificate of Completion</h1>
                <div className="w-28 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
              </div>

              <div className="space-y-4">
                <p className="text-lg text-muted-foreground">This certifies that</p>
                <p className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{userName}</p>
                <p className="text-lg text-muted-foreground">has successfully completed</p>
                <p className="text-2xl font-bold text-foreground">{certificate.title}</p>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-12 pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Completion Date</p>
                  <p className="font-semibold text-foreground">{certificate.completedDate}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Final Score</p>
                  <p className="font-semibold text-foreground">{certificate.score}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Certificate ID</p>
                  <p className="font-mono text-foreground">{certificate.id}</p>
                </div>
              </div>

              <div className="pt-8">
                <div className="inline-block">
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl">
                    <div className="text-white text-center">
                      <div className="text-3xl font-bold">✓</div>
                      <div className="text-xs tracking-wide">CERTIFIED</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                This certificate is issued by <span className="font-semibold">MocKinvi</span> and <span className="font-semibold">CYROBOX</span>. MocKinvi is a product of CYROBOX. Verify using the Certificate ID above.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateViewer;
