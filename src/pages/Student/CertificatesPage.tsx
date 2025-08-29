
import React, { useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import CertificateCard from '@/components/Certificates/CertificateCard';
import CertificateViewer from '@/components/Certificates/CertificateViewer';
import { Award, Download, Eye, Calendar, CheckCircle, Clock, RefreshCw, Star, Trophy } from 'lucide-react';
import { useCertificates } from '@/hooks/useCertificates';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { downloadCertificate } from '@/services/certificateService';

const CertificatesPage: React.FC = () => {
  const { user } = useAuth();
  const { userCertificates, availableCertificates, loading, refetch } = useCertificates();
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const handleDownload = (certificate: any) => {
    const userName = user?.fullName || user?.firstName || 'Student';
    downloadCertificate({
      userName,
      certificateTitle: certificate.certificate_title || 'Certificate',
      completionDate: new Date(certificate.issued_date).toLocaleDateString(),
      score: certificate.completion_data?.score || certificate.score,
      verificationCode: certificate.verification_code
    });
  };

  const handleView = (certificate: any) => {
    setSelectedCertificate(certificate);
    setViewerOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const averageScore = userCertificates.length > 0 
    ? Math.round(userCertificates.reduce((sum, cert) => sum + (cert.score || 0), 0) / userCertificates.length)
    : 0;

  const excellenceCount = userCertificates.filter(cert => (cert.score || 0) >= 90).length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 glass-morphism rounded-xl">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gradient">
              Your Certificates
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Showcase your achievements and skills with these earned certificates
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="floating-card group border border-gray-200 dark:border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 glass-morphism rounded-xl group-hover:scale-110 transition-transform">
                  <Award className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gradient">{userCertificates.length}</h3>
                  <p className="text-sm text-muted-foreground">Certificates Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="floating-card group border border-gray-200 dark:border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 glass-morphism rounded-xl group-hover:scale-110 transition-transform">
                  <Star className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gradient">{averageScore}%</h3>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="floating-card group border border-gray-200 dark:border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 glass-morphism rounded-xl group-hover:scale-110 transition-transform">
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gradient">{excellenceCount}</h3>
                  <p className="text-sm text-muted-foreground">Excellence Awards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Grid */}
        {userCertificates.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Achievements</h2>
              <Button 
                variant="outline" 
                onClick={refetch}
                className="btn-glass"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCertificates.map((certificate) => (
                <div key={certificate.id} className="animate-fadeIn">
                  <Card className="card-modern floating-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 glass-morphism rounded-lg">
                            <Award className="h-5 w-5 text-yellow-600" />
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200">Earned</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(certificate)}
                            className="btn-glass"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownload(certificate)}
                            className="btn-primary-glass"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-lg mb-2">
                        {certificate.certificate_title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {certificate.certificate_description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(certificate.issued_date).toLocaleDateString()}</span>
                        </div>
                        {certificate.score && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {certificate.score}%
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        ID: {certificate.verification_code}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Card className="glass-card border border-gray-200 dark:border-white/10">
            <CardContent className="py-16 text-center">
              <div className="space-y-4">
                <div className="p-4 glass-morphism rounded-2xl w-fit mx-auto">
                  <Award className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No certificates yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Complete course assessments with a score of 70% or higher to earn your first certificate.
                </p>
                <Button 
                  onClick={() => window.location.href = '/learning'}
                  className="btn-primary-glass"
                >
                  Start Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Certificates */}
        {availableCertificates.length > 0 && (
          <>
            <Separator className="my-8" />
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Available Certificates</h2>
              <p className="text-muted-foreground">
                Certificates you can earn by meeting the requirements
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCertificates.map((cert) => {
                  const isEarned = userCertificates.some(uc => uc.certificate_id === cert.id);
                  
                  return (
                    <Card 
                      key={cert.id} 
                      className={`card-modern ${isEarned ? "border-green-200/70 dark:border-green-400/20" : "border-blue-200/70 dark:border-blue-400/20"}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 glass-morphism rounded-lg">
                              <Award className={`h-5 w-5 ${isEarned ? 'text-green-600' : 'text-blue-600'}`} />
                            </div>
                            <Badge 
                              variant="outline" 
                              className={isEarned 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-blue-100 text-blue-800 border-blue-200"
                              }
                            >
                              {isEarned ? 'Earned' : 'Available'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-semibold text-lg mb-2">{cert.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {cert.description}
                        </p>
                        
                        {/* Requirements */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Requirements:</p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {cert.requirements?.min_interviews && (
                              <div>• Complete {cert.requirements.min_interviews} interviews</div>
                            )}
                            {cert.requirements?.min_score && (
                              <div>• Achieve {cert.requirements.min_score}% average score</div>
                            )}
                            {cert.requirements?.admin_approval && (
                              <div>• Admin approval required</div>
                            )}
                            {cert.requirements?.min_average_score && (
                              <div>• Maintain {cert.requirements.min_average_score}% average</div>
                            )}
                            {(!cert.requirements || Object.keys(cert.requirements).length === 0) && (
                              <div>• Complete associated courses and assessments</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Certificate Viewer Modal */}
        {viewerOpen && selectedCertificate && (
          <CertificateViewer
            certificate={{
              id: selectedCertificate.verification_code,
              title: selectedCertificate.certificate_title || 'Certificate',
              completedDate: new Date(selectedCertificate.issued_date).toLocaleDateString(),
              score: selectedCertificate.completion_data?.score || selectedCertificate.score || 0
            }}
            userName={user?.fullName || user?.firstName || 'Student'}
            onClose={() => setViewerOpen(false)}
            onDownload={() => handleDownload(selectedCertificate)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default CertificatesPage;
