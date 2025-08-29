import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';

const AboutPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              About <span className="text-cyrobox-primary">MocKinvi</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Empowering the future through innovative technology solutions and cutting-edge AI-powered platforms.
            </p>
          </div>

          {/* Company Story */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                CYROBOX was founded with a vision to revolutionize how people learn, grow, and succeed in their careers. 
                We believe that everyone deserves access to world-class interview preparation, skill development, and 
                career advancement tools.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Our flagship product, <span className="font-semibold text-cyan-600 dark:text-cyan-400">MocKinvi</span>, 
                represents the culmination of years of research and development in AI, machine learning, and educational technology. 
                We've created a platform that not only prepares candidates for interviews but also provides comprehensive 
                learning experiences that build lasting skills.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Today, CYROBOX stands as a trusted partner for thousands of professionals, students, and organizations 
                worldwide, helping them achieve their career goals through innovative technology solutions.
              </p>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                To democratize access to high-quality interview preparation and skill development, 
                enabling individuals to unlock their full potential and achieve career success.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Our Vision
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                To become the global leader in AI-powered career development platforms, 
                transforming how people learn and grow in their professional journeys.
              </p>
            </div>
          </div>

          {/* Founder Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Meet Our Founder
              </h2>
              <div className="text-center">
                <div className="w-32 h-32 bg-cyrobox-primary rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">NK</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  G Naveen Kumar
                </h3>
                <p className="text-lg text-cyrobox-primary font-semibold mb-4">
                  Founder & CEO
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
                  G Naveen Kumar is a visionary entrepreneur and technology innovator with a passion for 
                  transforming education and career development. With years of experience in AI and software development, 
                  he founded CYROBOX to bridge the gap between traditional learning methods and modern technological solutions.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto mt-4">
                  His commitment to excellence and innovation has driven CYROBOX to become a leading platform 
                  in the interview preparation and skill development space, helping thousands of professionals 
                  achieve their career goals.
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
                <div className="w-16 h-16 bg-cyrobox-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-cyrobox-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Innovation</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Constantly pushing boundaries and exploring new technologies to deliver cutting-edge solutions.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
                <div className="w-16 h-16 bg-cyrobox-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-cyrobox-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Excellence</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Committed to delivering the highest quality products and services to our users.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
                <div className="w-16 h-16 bg-cyrobox-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-cyrobox-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">User-Centric</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Every decision we make is centered around providing value and improving the user experience.
                </p>
              </div>
            </div>
          </div>

          {/* MocKinvi Product Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-cyrobox-primary rounded-2xl shadow-xl p-8 md:p-12 text-white">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Our Flagship Product: MocKinvi
              </h2>
              <p className="text-xl mb-6 leading-relaxed text-center">
                MocKinvi is our revolutionary AI-powered interview preparation platform that combines 
                cutting-edge technology with proven learning methodologies to deliver exceptional results.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-3">AI-Powered Interviews</h3>
                  <p className="text-cyrobox-primary/90">
                    Practice with intelligent AI interviewers that adapt to your skill level and provide personalized feedback.
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-3">Comprehensive Learning</h3>
                  <p className="text-cyrobox-primary/90">
                    Access a vast library of courses, resources, and practice materials to build your skills.
                  </p>
                </div>
              </div>
            </div>
          </div>
                  {/* Credits Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Credits</h2>
          <p className="text-lg text-muted-foreground">
            Developed and designed by <span className="font-semibold">Mohit Sherkhane</span>, <span className="font-semibold">Sameer Mansur</span>, and <span className="font-semibold">Atharva Jeevannavar</span>.
          </p>
        </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;