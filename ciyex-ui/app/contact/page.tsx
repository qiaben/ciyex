"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import FooterSection from '@/components/sections/FooterSection';
import ScrollToTop from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Phone, Mail, MapPin, Clock, Send, ChevronRight, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import ReCAPTCHA from 'react-google-recaptcha';

const Contact = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    isAppointmentRequest: false,
    preferredDate: '',
    preferredTime: '',
    optInText: false,
  });
  
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  useEffect(() => {
    document.title = 'Contact Us - OurTopClinic';
    if (!recaptchaSiteKey) {
      setRecaptchaError('reCAPTCHA site key is not configured');
      console.error('reCAPTCHA site key is missing. Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your .env.local file');
    }
  }, [recaptchaSiteKey]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!recaptchaValue) {
      toast({
        title: 'Verification Required',
        description: 'Please complete the reCAPTCHA verification',
        variant: 'destructive',
      });
      return;
    }

    setFormStatus('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, recaptchaValue }),
      });
      if (res.ok) {
        setFormStatus('submitted');
        toast({
          title: 'Message sent successfully! 🎉',
          description: "We'll get back to you as soon as possible.",
          variant: 'default',
        });
      } else {
        toast({ title: 'Failed to send message', variant: 'destructive' });
        setFormStatus('idle');
      }
    } catch (err) {
      toast({ title: 'Error sending message', variant: 'destructive' });
      setFormStatus('idle');
    }
  };

  // Contact information with enhanced styling
  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['+1 888-932-4771'],
      color: 'text-blue-500',
      gradient: 'from-blue-500/20 to-blue-600/20'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['hello@ourtopclinic.com'],
      color: 'text-amber-500',
      gradient: 'from-amber-500/20 to-amber-600/20'
    },
    {
      icon: MapPin,
      title: 'Address',
      details: [
        'Ourtopclinic',
        '550 SE 6th Ave, #200-V',
        'Delray Beach, FL 33483',
        '(Accept Medicare and Medicaid at this location)'
      ],
      color: 'text-rose-500',
      gradient: 'from-rose-500/20 to-rose-600/20'
    },
    {
      icon: Clock,
      title: 'Hours',
      details: ['By appointment; evening and weekend hours available.'],
      color: 'text-emerald-500',
      gradient: 'from-emerald-500/20 to-emerald-600/20'
    }
  ];

  // Enhanced FAQ questions with more details
  const faqs = [
    {
      question: 'How quickly can I expect a response?',
      answer: 'We typically respond to all inquiries within 24-48 business hours. For urgent matters, please call our main line directly.',
      icon: Clock
    },
    {
      question: 'What partnership opportunities do you offer?',
      answer: 'We offer various partnership models including facility sharing, provider networks, corporate wellness programs, and community health initiatives.',
      icon: Sparkles
    },
    {
      question: 'Do you offer telehealth solutions?',
      answer: 'Yes, we provide comprehensive telehealth platforms that can be integrated with existing systems or deployed as standalone solutions.',
      icon: Phone
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-white dark:from-primary/20 dark:via-accent/20 dark:to-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 -z-10"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ display: 'block' }}
            >
              Get In Touch
            </motion.h1>
          </div>
          <div className="text-lg text-muted-foreground max-w-2xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ display: 'block' }}
            >
              Have questions about our services or partnership opportunities? 
              We're here to help. Reach out to our team for assistance.
            </motion.p>
          </div>
        </div>
      </section>
      
      {/* Enhanced Contact Form Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Enhanced Contact Form */}
            <form onSubmit={handleSubmit}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-white dark:bg-gray-800 shadow-lg border-none overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="bg-gradient-to-r  pb-6">
                    <CardTitle className="text-2xl">Contact Form</CardTitle>
                    <CardDescription>Fill out the form below and we'll get back to you soon</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <AnimatePresence mode="wait">
                      {formStatus === 'submitted' ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{ display: 'block' }}
                          >
                            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                style={{ display: 'block' }}
                              >
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                              </motion.div>
                            </div>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ display: 'block' }}
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="name">Your Name</Label>
                                <Input 
                                  id="name"
                                  name="name"
                                  value={form.name}
                                  onChange={handleChange}
                                  placeholder="John Doe"
                                  required
                                  className="bg-muted/40 focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input 
                                  id="email"
                                  name="email"
                                  value={form.email}
                                  onChange={handleChange}
                                  type="email"
                                  placeholder="johndoe@example.com"
                                  required
                                  className="bg-muted/40 focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input 
                                id="phone"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                required
                                className="bg-muted/40 focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="subject">Subject</Label>
                              <Select onValueChange={val => setForm(f => ({ ...f, subject: val }))} value={form.subject}>
                                <SelectTrigger className="bg-muted/40 focus:ring-2 focus:ring-primary/20 transition-all">
                                  <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">General Inquiry</SelectItem>
                                  <SelectItem value="support">Technical Support</SelectItem>
                                  <SelectItem value="billing">Billing Question</SelectItem>
                                  <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                                  <SelectItem value="appointment">In-Person Appointment Request</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {form.subject === 'appointment' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 mt-4 p-4 bg-primary/5 rounded-lg"
                              >
                                <h3 className="font-semibold text-lg">Appointment Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="preferredDate">Preferred Date</Label>
                                    <Input 
                                      id="preferredDate"
                                      name="preferredDate"
                                      type="date"
                                      value={form.preferredDate}
                                      onChange={handleChange}
                                      required
                                      min={new Date().toISOString().split('T')[0]}
                                      className="bg-muted/40 focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="preferredTime">Preferred Time</Label>
                                    <Input 
                                      id="preferredTime"
                                      name="preferredTime"
                                      type="time"
                                      value={form.preferredTime}
                                      onChange={handleChange}
                                      required
                                      className="bg-muted/40 focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                            
                            <div className="space-y-2">
                              <Label htmlFor="message">Message</Label>
                              <Textarea 
                                id="message"
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                placeholder="How can we help you?"
                                required
                                className="min-h-[120px] bg-muted/40 focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>

                            <div className="flex items-center space-x-2 mt-4">
                              <Checkbox 
                                id="optInText"
                                checked={form.optInText}
                                onCheckedChange={(checked) => setForm(f => ({ ...f, optInText: checked as boolean }))}
                              />
                              <Label htmlFor="optInText" className="text-sm text-muted-foreground">
                                I agree to receive text messages regarding my appointment and updates
                              </Label>
                            </div>

                            <div className="mt-4">
                              {recaptchaError ? (
                                <div className="text-red-500 text-sm mb-4">{recaptchaError}</div>
                              ) : (
                                <ReCAPTCHA
                                  sitekey={recaptchaSiteKey || ''}
                                  onChange={(value: string | null) => setRecaptchaValue(value)}
                                  onError={() => setRecaptchaError('Failed to load reCAPTCHA. Please refresh the page.')}
                                />
                              )}
                            </div>
                            
                            <Button 
                              type="submit"
                              className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                              disabled={formStatus === 'submitting'}
                            >
                              {formStatus === 'submitting' ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                  Sending...
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Send className="w-4 h-4" />
                                  Send Message
                                </div>
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </form>
            
            {/* Contact Information Cards */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-white dark:bg-gray-800 shadow-lg border-none overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${info.gradient}`}>
                          <info.icon className={`w-6 h-6 ${info.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                          <div className="space-y-1">
                            {info.details.map((detail, i) => (
                              <p key={i} className="text-muted-foreground">{detail}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {/* Creative Coming Soon Clinic Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl shadow-lg p-6 text-center my-2 animate-pulse-slow">
                  <CardContent>
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-3xl mr-2">🏥</span>
                      <span className="text-lg font-bold text-emerald-700">OurTopClinic</span>
                    </div>
                    <div className="text-gray-700 font-medium text-base mb-1">1905 N Andrews Ave<br/>Wilton Manors, FL 33311</div>
                    <div className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm shadow-sm border border-emerald-200">Coming Soon - Under Construction</div>
                    <div className="mt-3 text-xs text-gray-500">We're building a brand new clinic to serve you better. Stay tuned for updates!</div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-12 px-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: 'block' }}
          >
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Find quick answers to common questions about our services</p>
          </motion.div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card 
                  className={`bg-white dark:bg-gray-800 shadow-lg border-none overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    activeFAQ === index ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <faq.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">{faq.question}</h3>
                      </div>
                      <ChevronRight 
                        className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                          activeFAQ === index ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                    <AnimatePresence>
                      {activeFAQ === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ display: 'block' }}
                        >
                          <p className="mt-4 text-muted-foreground pl-14">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Map Section - Enhanced */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white dark:bg-gray-800 shadow-md border-none overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <CardTitle>Our Location</CardTitle>
                  <CardDescription>Visit us at our main office in Delray Beach</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative h-[400px] md:h-[500px] w-full">
                    {!mapLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                      </div>
                    )}
                    <iframe
                      title="Ourtopclinic Location"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.1234567890123!2d-80.0723!3d26.4615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d8c5c5c5c5c5c5%3A0x1234567890abcdef!2s550%20SE%206th%20St%20Ste%20200-V%2C%20Delray%20Beach%2C%20FL%2033483!5e0!3m2!1sen!2sus!4v1234567890!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      onLoad={() => setMapLoaded(true)}
                      className="transition-opacity duration-300"
                    />
                  </div>
                  <div className="p-6 bg-gradient-to-r from-primary/5 to-accent/5">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <p>550 SE 6th St Ste 200-V, Delray Beach, FL 33483, United States</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      
      
      <FooterSection />
      <ScrollToTop />
    </div>
  );
};

export default Contact;
