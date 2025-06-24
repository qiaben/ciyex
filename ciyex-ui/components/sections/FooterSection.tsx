import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Twitter, Instagram, Linkedin, Mail, ArrowRight, Check, Heart, Home, Info, Users, BookOpen, FileText, HelpCircle, MessageSquare, Briefcase, Accessibility, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const   FooterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();
  const pathname = usePathname();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubscribing(true);
    
    // Simulate subscription API call
    setTimeout(() => {
      setIsSubscribing(false);
      setEmail('');
      toast({
        title: "Subscription Successful",
        description: "Thank you for subscribing to our newsletter!",
        variant: "default",
      });
    }, 1500);
  };

  const handleScrollToSection = (sectionId: string) => {
    if (pathname !== '/') {
      window.location.href = `/#${sectionId}`;
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer id="contact" className="bg-gray-50 dark:bg-gray-900 pt-16 pb-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="animate-fade-in">
            <div className="flex items-center mb-4">
              <img src="/logo.png" alt="OurTopClinic Logo" className="h-35 w-48 mr-2 ml-8" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Empowering healthcare through technology - connecting patients and providers seamlessly.</p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61558999269602" aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors bg-white dark:bg-gray-800 p-2 rounded-full hover:shadow-md">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="tel:+18889324771" aria-label="Phone" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors bg-white dark:bg-gray-800 p-2 rounded-full hover:shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0-1.243 1.007-2.25 2.25-2.25h2.086c.414 0 .81.168 1.102.464l2.07 2.07a1.5 1.5 0 01.44 1.06v2.086a2.25 2.25 0 01-2.25 2.25h-.586a.75.75 0 00-.53 1.28l4.95 4.95a.75.75 0 001.28-.53v-.586a2.25 2.25 0 012.25-2.25h2.086a1.5 1.5 0 011.06.44l2.07 2.07c.296.292.464.688.464 1.102v2.086a2.25 2.25 0 01-2.25 2.25h-1.5C6.007 21.75 2.25 17.993 2.25 13.5v-1.5z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/ourtopclinic/" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors bg-white dark:bg-gray-800 p-2 rounded-full hover:shadow-md">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/ourtopclinic/" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors bg-white dark:bg-gray-800 p-2 rounded-full hover:shadow-md">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@ourtopclinic_health" aria-label="TikTok" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors bg-white dark:bg-gray-800 p-2 rounded-full hover:shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" className="h-5 w-5"><path d="M28.5 10.7c-2.2 0-4-1.8-4-4V2.5c0-0.3-0.2-0.5-0.5-0.5h-3.2c-0.3 0-0.5 0.2-0.5 0.5v18.1c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4c0.3 0 0.5-0.2 0.5-0.5v-3.2c0-0.3-0.2-0.5-0.5-0.5-5.2 0-9.5 4.3-9.5 9.5s4.3 9.5 9.5 9.5 9.5-4.3 9.5-9.5v-7.3c1.2 0.7 2.6 1.1 4 1.1 0.3 0 0.5-0.2 0.5-0.5v-3.2c0-0.3-0.2-0.5-0.5-0.5z"/></svg>
              </a>
            </div>
          </div>

          <div className="animate-fade-in lg:ml-12" style={{ animationDelay: '0.2s' }}>
            <h3 className="font-semibold mb-3 dark:text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Home</a></li>
              <li><a href="/about_us" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">About Us</a></li>
              <li><a href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Our Services</a></li>
              <li><a href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>

          <div className="animate-fade-in lg:ml-12" style={{ animationDelay: '0.4s' }}>
            <h3 className="font-semibold mb-3 dark:text-white">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="https://ourtopclinic.net/blogs/privacy-policy/" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="https://ourtopclinic.net/blogs/privacy-policy/" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Terms</a></li>
            </ul>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {/* Trust Seals Row: SBA EDWOSB, BBB, HIPAA - no background */}
            <div className="flex justify-center items-center h-full gap-4">
              <div className="flex items-center justify-center" style={{width:'170px', height:'171px'}}>
                <img src="/EDWOSB.jpg" alt="SBA EDWOSB Certified" style={{width:'170px', height:'120px', objectFit:'contain'}} />
              </div>
              <div className="flex items-center justify-center" style={{width:'81px', height:'171px'}}>
                <iframe
                  style={{border:0, width:'81px', height:'171px', background:'transparent'}}
                  src="https://seal-seflorida.bbb.org/frame/blue-seal-81-171-bbb-92044705.png?chk=7184048E49"
                  title="Better Business Bureau Seal"
                  aria-label="Better Business Bureau Seal"
                  scrolling="no"
                ></iframe>
              </div>
              <div className="flex items-center justify-center" style={{width:'200px', height:'200px'}}>
                <img src="/Hipaa.png" alt="HIPAA Compliant" style={{width:'200px', height:'200px', objectFit:'contain'}} />
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-0 bg-gray-200 dark:bg-gray-700" />
        <div className="flex justify-center items-center" style={{margin:0, padding:0}}>
          <img src="/SSL.png" alt="Secure Site - SSL Encrypted & PCI Compliant" style={{maxHeight:'150px', display:'block', margin:0, padding:0, marginTop:'-25px', marginBottom:'-45px'}} />
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
