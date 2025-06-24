"use client"
import React, { useEffect } from 'react';   
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import FooterSection from '@/components/sections/FooterSection';
import ScrollToTop from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Heart, Building, Stethoscope, Users, ChevronRight, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const PartnerWithUs = () => {
  const router = useRouter();
  
  useEffect(() => {
    document.title = 'Partner With Us - OurTopClinic';
  }, []);
  
  const handleContactClick = () => {
    router.push('/contact');
  };
  const handleAboutUsClick = () => {
    router.push('/about_us');
  };

  // Partnership benefits
  const benefits = [
    {
      title: 'Expanded Reach',
      description: 'Access to a broader patient base and underserved communities',
      icon: Users
    },
    {
      title: 'Innovative Technology',
      description: 'State-of-the-art digital health platforms and telemedicine solutions',
      icon: Building
    },
    {
      title: 'Clinical Excellence',
      description: 'Collaboration with top-tier healthcare professionals and specialists',
      icon: Stethoscope
    },
    {
      title: 'Patient-Centered Care',
      description: 'Focus on outcomes and satisfaction through personalized approaches',
      icon: Heart
    }
  ];

  // Partnership types
  const partnershipTypes = [
    {
      title: 'For Businesses',
      icon: Building,
      description: 'Provide on-site health services for your employees',
      examples: ['Corporate wellness programs', 'On-site clinics', 'Employee health screenings'],
      color: 'from-blue-500 to-cyan-400'
    },
    {
      title: 'For Healthcare Providers',
      icon: Stethoscope,
      description: 'Join our network of forward-thinking medical professionals',
      examples: ['Private practices', 'Specialist physicians', 'Allied health professionals'],
      color: 'from-emerald-500 to-teal-400'
    },
    {
      title: 'For Community Organizations',
      icon: Users,
      description: 'Create accessible healthcare solutions for your community',
      examples: ['Pharmacies', 'Community centers', 'Religious organizations'],
      color: 'from-orange-500 to-amber-400'
    }
  ];

  // Success stories
  const testimonials = [
    {
      quote: "Partnering with OurTopClinic allowed us to provide quality healthcare to our employees right in the office. It's been transformative for our workplace wellness program.",
      author: "Sarah Johnson",
      position: "HR Director, TechCorp Inc."
    },
    {
      quote: "As a rural pharmacy, our partnership has enabled us to host specialists monthly, bringing essential care to our community that would otherwise require hours of travel.",
      author: "Michael Reynolds",
      position: "Owner, Community Pharmacy"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 -z-10"></div>
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            Partner With Us to Expand Access to Care
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join OurTopClinic in reshaping healthcare delivery through innovative partnerships that bring quality care to more communities.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            <Button size="lg" onClick={handleContactClick} className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
              Contact Us Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" onClick={handleAboutUsClick} variant="outline" className="w-full sm:w-auto">
              Learn More
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      
    
      
      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center mb-10 relative">
            {/* Animated Glowing Rings */}
            {/* <span className="absolute -top-6 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full border-4 border-primary/30 animate-pulse-slow pointer-events-none" style={{ zIndex: 0 }}></span> */}
            {/* <span className="absolute -top-10 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full border-2 border-primary/20 animate-pulse-slower pointer-events-none" style={{ zIndex: 0 }}></span> */}
            <h2 className="relative z-10 text-4xl md:text-5xl font-extrabold text-center tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-display drop-shadow-lg">
              Benefits of Partnership
            </h2>
            {/* <span className="block mt-3 w-32 h-1 rounded-full bg-gradient-to-r from-primary to-primary/80 opacity-90 animate-pulse"></span> */}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Just the image, no card, no border, no shadow */}
            <img
              src="/partnership.png"
              alt="OurTopClinic Partnership Team"
              className="object-contain w-full max-w-md mx-auto"
              style={{ background: "transparent" }}
            />
            {/* Benefits grid on the right */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <Card key={index} className="border-none shadow-md bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow hover:-translate-y-1 duration-300">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Vision Statement */}
        <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-6">Our Vision for Healthcare</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            At OurTopClinic, we believe that healthcare should be affordable, accessible, and centered
            around people — not systems. We are inviting like-minded organizations, community partners,
            and forward-thinking providers to join us in reshaping how care is delivered.
          </p>
        </div>
      </section>
      
      {/* Partnership Types */}
      <section className="py-20 px-4 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 -z-10"></div>
        
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">Who Can Partner With Us?</h2>
          <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-12">
            Whether you represent a business looking to offer on-site health services, a pharmacy open to hosting care professionals, or a healthcare provider seeking innovative ways to reach more patients — we are ready to collaborate.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {partnershipTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <div 
                  key={index} 
                  className="rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className={`bg-gradient-to-r ${type.color} p-6 flex items-center`}>
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white ml-4">{type.title}</h3>
                  </div>
                  
                  <div className="p-6">
                    <p className="mb-4 text-muted-foreground">{type.description}</p>
                    <h4 className="font-medium mb-3">Examples:</h4>
                    <ul className="space-y-2">
                      {type.examples.map((example, i) => (
                        <li key={i} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-primary mr-2" />
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-accent text-white">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold mb-6">Let's Make a Lasting Impact — Together</h2>
          <p className="text-lg mb-8 text-white/90 max-w-3xl mx-auto">
            Together, we can build partnerships that bring compassionate, high-quality care to more
            communities. If you share our commitment to making healthcare better for all, we would love to
            hear from you.
          </p>
          <Button size="lg" onClick={handleContactClick} variant="secondary" className="bg-white text-primary hover:bg-white/90">
            Get in Touch Today
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
      
      {/* Partnership Process */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Our Partnership Process</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-primary" />
                <div className="absolute h-16 w-16 border-2 border-dashed border-primary rounded-full animate-spin-slow"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">Initial Consultation</h3>
              <p className="text-muted-foreground">We'll discuss your needs, goals, and explore potential collaboration opportunities</p>
            </div>
            
            <div className="text-center relative">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
                <div className="absolute h-16 w-16 border-2 border-dashed border-primary rounded-full animate-spin-slow"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">Customized Planning</h3>
              <p className="text-muted-foreground">We develop tailored solutions that address your specific healthcare objectives</p>
              
              {/* Connector lines - only visible on desktop */}
              <div className="hidden md:block absolute top-8 -left-4 w-8 h-0.5 bg-primary/30"></div>
              <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-primary/30"></div>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-primary" />
                <div className="absolute h-16 w-16 border-2 border-dashed border-primary rounded-full animate-spin-slow"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">Implementation</h3>
              <p className="text-muted-foreground">We launch our partnership with comprehensive support and regular evaluation</p>
            </div>
          </div>
        </div>
      </section>
      
      <FooterSection />
      <ScrollToTop />
    </div>
  );
};

export default PartnerWithUs;
