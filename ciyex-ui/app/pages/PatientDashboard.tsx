
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Video, Plus, FileText, Pill, Heart, Activity, Bell, User } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const PatientDashboard = () => {
  useEffect(() => {
    document.title = 'Patient Dashboard - OurTopClinic';
  }, []);

  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for charts
  const heartRateData = [
    { time: '6:00 AM', rate: 65 },
    { time: '9:00 AM', rate: 72 },
    { time: '12:00 PM', rate: 75 },
    { time: '3:00 PM', rate: 70 },
    { time: '6:00 PM', rate: 76 },
    { time: '9:00 PM', rate: 68 },
  ];
  
  const bloodPressureData = [
    { time: '6:00 AM', systolic: 120, diastolic: 80 },
    { time: '9:00 AM', systolic: 126, diastolic: 82 },
    { time: '12:00 PM', systolic: 128, diastolic: 84 },
    { time: '3:00 PM', systolic: 122, diastolic: 81 },
    { time: '6:00 PM', systolic: 125, diastolic: 83 },
    { time: '9:00 PM', systolic: 118, diastolic: 79 },
  ];
  
  const medicationsData = [
    { name: 'Taken', value: 85 },
    { name: 'Missed', value: 15 },
  ];
  
  const COLORS = ['#2E7D32', '#ff6b6b'];
  
  const upcomingAppointments = [
    {
      id: 1,
      doctorName: 'Dr. Sarah Wilson',
      specialty: 'Cardiologist',
      date: 'Today',
      time: '10:30 AM',
      isVideo: true,
    },
    {
      id: 2,
      doctorName: 'Dr. Michael Chen',
      specialty: 'Dermatologist',
      date: 'May 20, 2025',
      time: '2:15 PM',
      isVideo: false,
    },
  ];
  
  const medications = [
    {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      time: 'Morning',
      remaining: 12,
    },
    {
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      time: 'Morning/Evening',
      remaining: 8,
    },
    {
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily',
      time: 'Evening',
      remaining: 15,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header/Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full gradient-bg flex items-center justify-center mr-3">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text">OurTopClinic</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">2</span>
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold dark:text-white">Welcome back, John!</h1>
            <p className="text-gray-600 dark:text-gray-300">Here's your health summary and upcoming appointments</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="gradient-bg">
              <Plus className="mr-2 h-4 w-4" /> Book New Appointment
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="records">Medical Records</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Health stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-gray-800 hover-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Heart Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <div className="text-2xl font-bold dark:text-white">72</div>
                    <div className="ml-1 text-sm text-gray-500 dark:text-gray-400">bpm</div>
                  </div>
                  <div className="mt-4 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={heartRateData}>
                        <defs>
                          <linearGradient id="heartRateGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area 
                          type="monotone" 
                          dataKey="rate" 
                          stroke="#2E7D32" 
                          fillOpacity={1} 
                          fill="url(#heartRateGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800 hover-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Blood Pressure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <div className="text-2xl font-bold dark:text-white">120/80</div>
                    <div className="ml-1 text-sm text-gray-500 dark:text-gray-400">mmHg</div>
                  </div>
                  <div className="mt-4 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={bloodPressureData}>
                        <Line type="monotone" dataKey="systolic" stroke="#2E7D32" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="diastolic" stroke="#66BB6A" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800 hover-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Weight</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <div className="text-2xl font-bold dark:text-white">168</div>
                    <div className="ml-1 text-sm text-gray-500 dark:text-gray-400">lbs</div>
                  </div>
                  <div className="mt-1 text-xs text-green-500 flex items-center">
                    <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none">
                      <path d="M7 13L12 8L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Down 2.5 lbs this month
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800 hover-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Medication Adherence</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <div className="w-16 h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={medicationsData}
                          innerRadius={15}
                          outerRadius={30}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {medicationsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="ml-4 text-center">
                    <div className="text-2xl font-bold dark:text-white">85%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Taken on time</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Upcoming Appointment */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="col-span-2 bg-white dark:bg-gray-800 hover-card">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled appointments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingAppointments.map(appointment => (
                    <div 
                      key={appointment.id}
                      className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10 mt-1">
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {appointment.doctorName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold dark:text-white">{appointment.doctorName}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.specialty}</p>
                            <div className="flex items-center mt-2">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">{appointment.date}</span>
                              <Clock className="h-4 w-4 text-gray-400 ml-3 mr-1" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">{appointment.time}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Button variant={appointment.isVideo ? "default" : "outline"} className={appointment.isVideo ? "gradient-bg" : ""}>
                            {appointment.isVideo ? (
                              <>
                                <Video className="h-4 w-4 mr-1" />
                                Join Now
                              </>
                            ) : (
                              'View Details'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Schedule New Appointment
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800 hover-card">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">Medications</CardTitle>
                  <CardDescription>Your current prescriptions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {medications.slice(0, 2).map((medication, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium dark:text-white">{medication.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{medication.dosage} • {medication.frequency}</p>
                        <div className="mt-1 flex items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{medication.remaining} pills remaining</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full text-primary hover:text-primary/90 hover:bg-primary/10">
                    View All Medications
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Health activity trends */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg dark:text-white">Health Activity</CardTitle>
                  <Button variant="outline" size="sm">
                    Last 7 Days <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { day: 'Mon', steps: 5200, sleepHours: 7.2 },
                        { day: 'Tue', steps: 6800, sleepHours: 6.8 },
                        { day: 'Wed', steps: 4500, sleepHours: 7.5 },
                        { day: 'Thu', steps: 7200, sleepHours: 6.5 },
                        { day: 'Fri', steps: 6500, sleepHours: 7.1 },
                        { day: 'Sat', steps: 8100, sleepHours: 7.8 },
                        { day: 'Sun', steps: 4800, sleepHours: 8.2 },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" />
                      <YAxis yAxisId="left" orientation="left" stroke="#2E7D32" />
                      <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="steps" 
                        stroke="#2E7D32" 
                        fillOpacity={1} 
                        fill="url(#stepsGradient)" 
                        name="Steps"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="sleepHours" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="Sleep (hours)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appointments">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">All Appointments</CardTitle>
                <CardDescription>View and manage all your upcoming and past appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Switch to this tab to see all your appointments
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="medications">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Medications</CardTitle>
                <CardDescription>Track your prescriptions and refills</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Switch to this tab to manage your medications
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="records">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Medical Records</CardTitle>
                <CardDescription>Access your health history and test results</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Switch to this tab to view your medical records
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;
