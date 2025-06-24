"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from "../../components/navbar/Navbar";
import FooterSection from "../../components/sections/FooterSection";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { BookOpen, Calendar, Clock, Eye, ArrowUpRight, Tag, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// Blog post type definition
type BlogPost = {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string[];
  readTime: string;
  date: string;
  image: string;
  externalUrl: string;
};

// Loading animation component
const ImageLoadingAnimation = () => (
  <div className="w-full h-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 animate-pulse flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(6);
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    document.title = "OurTopClinic - Health Blog";
    
    // Initialize image loading state
    const initialLoadingState = blogPosts.reduce((acc, post) => {
      acc[post.id] = true;
      return acc;
    }, {} as { [key: number]: boolean });
    setImageLoading(initialLoadingState);
    
    // Simulate loading blog posts
    setTimeout(() => {
      setPosts(blogPosts);
      setLoading(false);
    }, 800);
  }, []);

  const handleImageLoad = (postId: number) => {
    setImageLoading(prev => ({
      ...prev,
      [postId]: false
    }));
  };

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.category.toLowerCase() === filter.toLowerCase());

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  const openExternalBlog = (url: string, title: string) => {
    window.open(url, '_blank');
    toast({
      title: "Opening external blog",
      description: `You're being redirected to: ${title}`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 pb-16 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">
            <span className="gradient-text">Health Knowledge Hub</span>
          </h1>
          <p className="text-center text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Explore our collection of expert articles covering the latest in healthcare, wellness tips,
            and medical breakthroughs.
          </p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Button 
              variant={filter === 'all' ? "default" : "outline"} 
              onClick={() => setFilter('all')}
              className="rounded-full"
            >
              All Topics
            </Button>
            <Button 
              variant={filter === 'general health' ? "default" : "outline"} 
              onClick={() => setFilter('general health')}
              className="rounded-full"
            >
              General Health
            </Button>
            <Button 
              variant={filter === "men's health" ? "default" : "outline"} 
              onClick={() => setFilter("men's health")}
              className="rounded-full"
            >
              Men's Health
            </Button>
            <Button 
              variant={filter === "women's health" ? "default" : "outline"} 
              onClick={() => setFilter("women's health")}
              className="rounded-full"
            >
              Women's Health
            </Button>
            <Button 
              variant={filter === 'mental health' ? "default" : "outline"} 
              onClick={() => setFilter('mental health')}
              className="rounded-full"
            >
              Mental Health
            </Button>
            <Button 
              variant={filter === 'chronic conditions' ? "default" : "outline"} 
              onClick={() => setFilter('chronic conditions')}
              className="rounded-full"
            >
              Chronic Conditions
            </Button>
            <Button 
              variant={filter === 'infections & immunity' ? "default" : "outline"} 
              onClick={() => setFilter('infections & immunity')}
              className="rounded-full"
            >
              Infections & Immunity
            </Button>
            <Button 
              variant={filter === 'lifestyle & wellness' ? "default" : "outline"} 
              onClick={() => setFilter('lifestyle & wellness')}
              className="rounded-full"
            >
              Lifestyle & Wellness
            </Button>
            <Button 
              variant={filter === 'prevention & screening' ? "default" : "outline"} 
              onClick={() => setFilter('prevention & screening')}
              className="rounded-full"
            >
              Prevention & Screening
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <CardHeader>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No blog posts found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try selecting a different category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visiblePosts.map(post => (
                  <Card key={post.id} className="overflow-hidden hover-lift group">
                    <div className="relative overflow-hidden aspect-[16/9]">
                      {imageLoading[post.id] && <ImageLoadingAnimation />}
                      <Image 
                        src={post.image} 
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                          imageLoading[post.id] ? 'opacity-0' : 'opacity-100'
                        }`}
                        onLoad={() => handleImageLoad(post.id)}
                        priority={post.id <= 6} // Prioritize loading for first 6 images
                      />
                      <div className="absolute top-3 right-3">
                        <span className="bg-primary/90 text-white text-xs px-3 py-1 rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <CardHeader className="pb-0">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1 space-x-4">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {post.readTime} read
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors text-xl md:text-2xl font-semibold mb-0">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <CardDescription className="line-clamp-3 mb-3">
                        {post.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="ghost"
                        className="w-full justify-between group py-3 text-base h-12 border border-emerald-300"
                        onClick={() => openExternalBlog(post.externalUrl, post.title)}
                      >
                        Read article 
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
            
            {visibleCount < filteredPosts.length && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" onClick={() => setVisibleCount(c => c + 6)}>
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <FooterSection />
    </div>
  );
};

// Sample blog posts data with updated image URLs
const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Is Premature Ejaculation Linked to Testosterone, ADHD, and Lifestyle Habits? Here's What Science Says",
    description: "Explore the scientific connections between premature ejaculation, testosterone levels, ADHD, and lifestyle factors. Learn evidence-based insights and potential solutions.",
    category: "Men's Health",
    tags: ["Men's Health", "Research", "Lifestyle"],
    readTime: "8 min",
    date: "May 15, 2025",
    image: "https://images.unsplash.com/photo-1504194569341-48a2e831a3a7?auto=format&fit=crop&w=800&q=80",
    externalUrl: "https://ourtopclinic.net/blogs/is-premature-ejaculation-linked-to-testosterone-adhd-and-lifestyle-habits-heres-what-science-says/"
  },
  {
    id: 2,
    title: "Surprising Causes and Holistic Solutions for Headaches and Migraines",
    description: "Discover unexpected triggers of headaches and migraines, along with comprehensive natural and medical approaches to relief.",
    category: "General Health",
    tags: ["Pain Management", "Natural Remedies", "Headache Relief"],
    readTime: "10 min",
    date: "May 13, 2025",
    image: "https://images.pexels.com/photos/3771089/pexels-photo-3771089.jpeg?auto=compress&cs=tinysrgb&w=800",
    externalUrl: "https://ourtopclinic.net/blogs/surprising-causes-and-holistic-solutions-for-headaches-and-migraines/"
  },
  {
    id: 3,
    title: "Sleep Disorders, Insomnia, and Where to Get Help: What You Need to Know",
    description: "Comprehensive guide to understanding sleep disorders, identifying insomnia symptoms, and finding professional help for better sleep.",
    category: "Mental Health",
    tags: ["Sleep Health", "Mental Health", "Treatment"],
    readTime: "9 min",
    date: "May 12, 2025",
    image: "https://media.istockphoto.com/id/820818504/photo/depressed-man-suffering-from-insomnia-lying-in-bed.jpg?s=612x612&w=0&k=20&c=Ab1EIvpubzYMNWZFWRWzmMwxu7b4uMSGTdvrxFeIOYU=",
    externalUrl: "https://ourtopclinic.net/blogs/sleep-disorders-insomnia-and-where-to-get-help-what-you-need-to-know/"
  },
  {
    id: 4,
    title: "Virtual Doctor Visits: How Online Consultations Work",
    description: "Learn everything about telehealth appointments, from scheduling to what to expect during your virtual medical consultation.",
    category: "General Health",
    tags: ["Telehealth", "Digital Health", "Healthcare Access"],
    readTime: "7 min",
    date: "May 10, 2025",
    image: "https://media.istockphoto.com/id/1389444871/photo/shot-of-an-unrecognisable-psychologist-sitting-and-using-a-laptop-for-an-online-consultation.jpg?s=612x612&w=0&k=20&c=PmQEgAWeZuxecOeKs8OtD0G-mESODBD1sMEpQtJW63A=",
    externalUrl: "https://ourtopclinic.net/blogs/virtual-doctor-visits-how-online-consultations-work/"
  },
  {
    id: 5,
    title: "Complete Guide to Annual & Full Health Check-Ups",
    description: "Everything you need to know about comprehensive health screenings, what to expect, and how to prepare for your check-up.",
    category: "Prevention & Screening",
    tags: ["Preventive Care", "Health Screening", "Wellness"],
    readTime: "12 min",
    date: "May 8, 2025",
    image: "https://plus.unsplash.com/premium_photo-1661765826790-670098d7f4b5?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aGVhbHRoJTIwY2hlY2t8ZW58MHx8MHx8fDA%3D",
    externalUrl: "https://ourtopclinic.net/blogs/the-complete-guide-to-annual-full-health-check-ups/"
  },
  {
    id: 6,
    title: "Find the Best Doctors Near You for Any Medical Need",
    description: "Expert tips on how to research, evaluate, and choose the right healthcare provider for your specific medical needs.",
    category: "General Health",
    tags: ["Healthcare", "Doctor Selection", "Patient Care"],
    readTime: "8 min",
    date: "May 7, 2025",
    image: "https://images.pexels.com/photos/3845811/pexels-photo-3845811.jpeg?auto=compress&cs=tinysrgb&w=800",
    externalUrl: "https://ourtopclinic.net/blogs/find-the-best-doctors-near-you-for-any-medical-need/"
  },
  {
    id: 7,
    title: "Women's Health Check-Up Guide: Essential Screenings & Tests",
    description: "Comprehensive overview of important health screenings and tests every woman should consider at different life stages.",
    category: "Women's Health",
    tags: ["Women's Health", "Preventive Care", "Health Screening"],
    readTime: "11 min",
    date: "May 5, 2025",
    image: "https://assets.weforum.org/article/image/wjgZ8CcJLdkdhawWWh2g1jwXpdw1mTietuninUIl14M.jpg",
    externalUrl: "https://ourtopclinic.net/blogs/womens-health-check-up-guide-essential-screenings-tests/"
  },
  {
    id: 8,
    title: "Debunking Common Misconceptions About Acid Reflux: What You Need to Know",
    description: "Separate fact from fiction about acid reflux, its causes, and effective treatment options backed by medical research.",
    category: "Digestive Health",
    tags: ["Digestive Health", "Treatment", "Lifestyle"],
    readTime: "9 min",
    date: "May 3, 2025",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
    externalUrl: "https://ourtopclinic.net/blogs/debunking-common-misconceptions-about-acid-reflux-what-you-need-to-know/"
  },
  {
    id: 9,
    title: "Understanding Bacterial Vaginosis",
    description: "Comprehensive guide to understanding bacterial vaginosis, its symptoms, causes, and effective treatment options.",
    category: "Women's Health",
    tags: ["Women's Health", "Infection", "Treatment"],
    readTime: "8 min",
    date: "May 1, 2025",
    image: "https://images.unsplash.com/photo-1535127022272-dbe7ee35cf33?auto=format&fit=crop&w=800&q=80",
    externalUrl: "https://ourtopclinic.net/blogs/category/bacterial-vaginosis/"
  },
  {
    id: 10,
    title: "Erectile Dysfunction",
    description: "In-depth look at erectile dysfunction, its causes, treatment options, and lifestyle modifications for better sexual health.",
    category: "Men's Health",
    tags: ["Men's Health", "Sexual Health", "Treatment"],
    readTime: "10 min",
    date: "April 30, 2025",
    image: "https://media.istockphoto.com/id/1167360822/photo/couple-having-problems.jpg?s=612x612&w=0&k=20&c=FUWj7kAQXQtk-zS04wTjLCbDGJLUmqwEMD3sagszmqc=",
    externalUrl: "https://ourtopclinic.net/blogs/understanding-erectile-dysfunction/"
  },
  {
    id: 11,
    title: "Understanding High Cholesterol: Medical Insights, Diet Tips, and Natural Options",
    description: "Comprehensive guide to managing cholesterol levels through medical treatment, dietary changes, and natural approaches.",
    category: "Heart & Circulatory",
    tags: ["Heart Health", "Nutrition", "Prevention"],
    readTime: "12 min",
    date: "April 28, 2025",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    externalUrl: "https://ourtopclinic.net/blogs/understanding-high-cholesterol-medical-insights-diet-tips-and-natural-options/"
  },
  {
    id: 12,
    title: "Understanding and Addressing Substance Use Disorder: Evidence-Based Strategies for Recovery and Professional Support",
    description: "Explore evidence-based approaches to substance use disorder treatment, recovery strategies, and available professional support services.",
    category: "Mental Health",
    tags: ["Mental Health", "Recovery", "Treatment"],
    readTime: "15 min",
    date: "April 26, 2025",
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=800&q=80",
    externalUrl: "https://ourtopclinic.net/blogs/understanding-and-addressing-substance-use-disorder-evidence-based-strategies-for-recovery-and-professional-support/"
  },
  {
    id: 13,
    title: "Comprehensive Guide to Cold Sore Treatments: Medical Solutions That Work",
    description: "Expert-reviewed treatments and prevention strategies for cold sores, from prescription medications to natural remedies.",
    category: "Infections & Immunity",
    tags: ["Oral Health", "Viral Infections", "Treatment"],
    readTime: "8 min",
    date: "April 24, 2025",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    externalUrl: "https://ourtopclinic.net/blogs/comprehensive-guide-to-cold-sore-treatments-medical-solutions-that-work/"
  },
  {
    id: 14,
    title: "Understanding Blood Sugar Management: What You Need to Know and How to Stay on Track",
    description: "Essential guide to managing blood sugar levels through diet, exercise, and lifestyle modifications for optimal health.",
    category: "Chronic Conditions",
    tags: ["Diabetes", "Nutrition", "Health Management"],
    readTime: "11 min",
    date: "April 22, 2025",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    externalUrl: "https://ourtopclinic.net/blogs/comprehensive-guide-to-cold-sore-treatments-medical-solutions-that-work/"
  },
  {
    id: 15,
    title: "Pink Eye: Causes, Symptoms, Diagnosis, and When to Seek Care",
    description: "Complete overview of conjunctivitis, including different types, symptoms, treatment options, and when to see a doctor.",
    category: "Infections & Immunity",
    tags: ["Eye Health", "Infection", "Treatment"],
    readTime: "7 min",
    date: "April 20, 2025",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    externalUrl: "https://ourtopclinic.net/blogs/pink-eye-causes-symptoms-diagnosis-and-when-to-seek-care/"
  }
];

export default Blog;
