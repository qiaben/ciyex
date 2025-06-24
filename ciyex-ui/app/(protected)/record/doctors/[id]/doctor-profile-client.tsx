"use client";

import React, { useState } from 'react';
import Navbar from '../../../../../components/navbar/Navbar';
import FooterSection from '../../../../../components/sections/FooterSection';
import ScrollToTop from '../../../../../components/ScrollToTop';
import { Button } from "../../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../../components/ui/tabs';
import { 
  Calendar, Clock, FileText, MapPin, Mail, Phone, Globe, Star, 
  User, Briefcase, GraduationCap, Clock8, Edit, ChevronRight, 
  Calendar as CalendarIcon, MessageSquare, Video
} from 'lucide-react';
import { Badge } from '../../../../../components/ui/badge';
import { ScrollArea } from '../../../../../components/ui/scroll-area';
import { Progress } from '../../../../../components/ui/progress';
import EditProfileButton from '../../../../../components/profile/EditProfileButton';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

interface DoctorProfileClientProps {
  data: any; // Replace with proper type from your database
  totalAppointment: number;
  availableDaysStr: string;
  recentApplications: any[]; // Replace with proper type
  ratings: any[]; // Replace with proper type
}

export default function DoctorProfileClient({
  data, 
  totalAppointment, 
  availableDaysStr,
  recentApplications,
  ratings
}: DoctorProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const params = useParams();
  const doctorIdFromUrl = params?.id;
  const { user } = useUser();

  // Clerk user email (first email address)
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const userId = user?.id;

  const isOwner =
    (userEmail && data?.email && userEmail === data.email) ||
    (userId && (userId === doctorIdFromUrl || userId === data?.userId));

  console.log('userEmail:', userEmail, 'data.email:', data?.email, 'userId:', userId, 'doctorIdFromUrl:', doctorIdFromUrl, 'data.userId:', data?.userId);

  const userRole = user?.publicMetadata?.role;

  const handleProfileUpdate = (data: any) => {
    console.log('Profile data updated:', data);
    setIsEditing(false);
    // In a real app, you would update the backend here
  };

  // Generate star rating display
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Cover Photo & Profile Header */}
        <div className="relative rounded-xl overflow-hidden mb-8 shadow-lg">
          {/* Cover Image */}
          <div className="h-48 md:h-64 w-full relative">
            {data.coverImage ? (
              <img 
                src={data.coverImage} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-muted-foreground">Add banner</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      </div>
          
          {/* Profile Overview */}
          <div className="relative bg-card rounded-b-xl px-6 py-6">
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Avatar */}
              <div className="-mt-20 border-4 border-background rounded-full shadow-xl">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={data.avatar} alt={data.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {data.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* Profile Info */}
              <div className="flex flex-col items-center w-full">
                <h1 className="text-2xl md:text-3xl font-bold">{data.name}</h1>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mt-1">
                  <Badge variant="secondary" className="w-fit">{data.specialty}</Badge>
                  <span className="text-sm text-muted-foreground">{data.title}</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md mt-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{data.rating}</span>
                  <span className="text-sm text-muted-foreground">({ratings.length} reviews)</span>
                </div>
                <div className="flex flex-wrap gap-4 mt-4 justify-center">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{data.experience || '-'} years experience</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{totalAppointment || '-'}+ patients</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{data.location || '-'}</span>
                  </div>
                </div>
                {/* Book Appointment Button - role based */}
                <div className="flex justify-center mt-6 w-full">
                  {userRole === "patient" ? (
                    <Button
                      asChild
                      className="px-8 py-2 text-base font-semibold"
                    >
                      <a href="/providers">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Book Appointment
                      </a>
                    </Button>
                  ) : (
                    <Button
                      disabled
                      variant="outline"
                      className="px-8 py-2 text-base font-semibold cursor-default"
                    >
                      Doctor
                    </Button>
                  )}
                </div>
              </div>
              {/* Edit Profile Button */}
              <div className="mt-4">
                {isOwner && (
                  <EditProfileButton profileData={data} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about">
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="prose dark:prose-invert max-w-none">
                        {data.bio.split('\n\n').map((paragraph: string, i: number) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Education</h3>
                        <div className="space-y-4">
                          {data.education.length > 0 ? (
                            data.education.map((edu: any, i: number) => (
                              <div key={i} className="flex gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    <GraduationCap className="h-4 w-4" />
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium">{edu.degree}</h4>
                                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                  <p className="text-xs text-muted-foreground">{edu.year}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground">-</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Certifications</h3>
                        {data.certifications.length > 0 ? (
                          <ul className="space-y-2">
                            {data.certifications.map((cert: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                                </div>
                                {cert}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">-</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Languages</h3>
                        {data.languages.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {data.languages.map((lang: string, i: number) => (
                              <Badge key={i} variant="outline">{lang}</Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">-</p>
                        )}
                      </div>
            </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="appointments">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      {recentApplications.map(appointment => (
                        <div
                          key={appointment.id}
                          className={`flex items-center gap-4 p-3 rounded-lg border ${
                            appointment.status === 'upcoming' ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30' : 
                            appointment.status === 'pending' ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30' :
                            appointment.status === 'completed' ? 'bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30' :
                            'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            <Avatar className="h-12 w-12">
                              {appointment.patientAvatar ? (
                                <AvatarImage src={appointment.patientAvatar} alt={appointment.patientName} />
                              ) : (
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {appointment.patientName.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{appointment.patientName}</h4>
                              <Badge variant={appointment.status === 'pending' ? 'secondary' : 'default'}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">{appointment.reason}</div>
                            <div className="flex items-center gap-3 mt-1 text-xs">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(appointment.date), 'PPP')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{format(new Date(appointment.date), 'p')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                  ))}
                      {recentApplications.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No upcoming appointments found
            </div>
                      )}
          </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Patient Reviews</CardTitle>
                      <CardDescription>
                        Feedback from your patients
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">{data.rating}</div>
                      {renderStarRating(data.rating)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="space-y-1 mb-4">
                        {[5, 4, 3, 2, 1].map(rating => {
                          // Calculate percentage of reviews for this rating
                          const reviewsForRating = ratings.filter(r => Math.round(r.rating) === rating).length;
                          const percentage = ratings.length ? (reviewsForRating / ratings.length) * 100 : 0;
                          
                          return (
                            <div key={rating} className="flex items-center gap-3">
                              <div className="flex items-center gap-1 w-16">
                                <span>{rating}</span>
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              </div>
                              <Progress className="h-2" value={percentage} />
                              <span className="text-xs text-muted-foreground w-10">{percentage.toFixed(0)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-6">
                        {ratings.map(review => (
                          <div key={review.id} className="border-b pb-5 last:border-none">
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  {review.patientAvatar ? (
                                    <AvatarImage src={review.patientAvatar} alt={review.patientName} />
                                  ) : (
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {review.patientName.charAt(0)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <div className="font-medium">{review.patientName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(review.date), 'PPP')}
                                  </div>
            </div>
          </div>
                              <div className="flex-shrink-0">{renderStarRating(review.rating)}</div>
                            </div>
                            <p className="text-sm">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      See All Reviews
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="availability">
                <Card>
                  <CardHeader>
                    <CardTitle>Working Hours</CardTitle>
                    <CardDescription>
                      When patients can book appointments with you
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.workingHours.map((schedule: any, i: number) => (
                        <div key={i} className="flex justify-between py-2 border-b last:border-none">
                          <div className="font-medium">{schedule.day}</div>
                          <div className={schedule.hours === 'Closed' ? 'text-muted-foreground' : ''}>
                            {schedule.hours}
                          </div>
            </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Column - Contact Info */}
          <div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium">{data.email || '-'}</div>
                  </div>
                </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Phone</div>
                        <div className="font-medium">{data.phone || '-'}</div>
              </div>
            </div>

                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Address</div>
                        <div className="font-medium">{data.location || '-'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="h-5 w-5 text-primary" />
                        </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Website</div>
                        <div className="font-medium">{data.website || '-'}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-3xl font-bold">{totalAppointment || '-'}+</div>
                      <div className="text-sm text-muted-foreground">Patients</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-3xl font-bold">{data.experience || '-'}</div>
                      <div className="text-sm text-muted-foreground">Years Experience</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-3xl font-bold">{ratings.length || '-'}</div>
                      <div className="text-sm text-muted-foreground">Reviews</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-3xl font-bold flex items-center justify-center">
                        {data.rating || '-'}
                        <Star className="h-4 w-4 ml-1 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <ScrollToTop />
      </div>
  );
} 