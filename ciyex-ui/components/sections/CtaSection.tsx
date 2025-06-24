import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, PhoneCall } from 'lucide-react';
import Link from "next/link";

const CtaSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll('.reveal');
            elements.forEach(el => {
              el.classList.add('active');
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      id="cta" 
      className="py-16"
      ref={sectionRef}
    >
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Gradient background */}
          <div className="absolute inset-0 gradient-bg opacity-95"></div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full opacity-10 translate-y-1/3 -translate-x-1/3"></div>
          
          <div className="relative z-10 py-16 px-8 md:px-16 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 reveal scroll-animation-1">
                Ready to Transform Your Healthcare Experience?
              </h2>
              <p className="text-xl opacity-90 mb-10 reveal scroll-animation-2">
                Join thousands of patients and doctors who are already enjoying the benefits of our platform.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 reveal scroll-animation-3">
                <Button 
                  size="lg" 
                  className="bg-green-500 text-white hover:bg-green-600 group border-none shadow-md dark:bg-white dark:text-green-600 dark:hover:bg-gray-100 dark:hover:text-green-700"
                >
                  Join Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-white text-green-600 border-green-500 hover:bg-green-50 hover:text-green-700 group dark:bg-transparent dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-green-600"
                >
                  <Link href="/contact">
                    <PhoneCall className="mr-2 h-5 w-5" />
                    Contact Support
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
