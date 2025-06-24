"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, Filter, Download, Eye, Calendar, 
  User, Activity, Clock, MapPin, Video, CheckCircle, XCircle, Loader2, CalendarCheck 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AppointmentStatus } from "@prisma/client";
import { appointmentAction } from "@/app/actions/appointment";

interface Interaction {
  id: number;
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  specialty: string;
  serviceName: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: string;
  status: string;
  insurance: string;
  amount: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  mode: string;
  description: string;
  totalAppointments: number;
  revenue: number;
}

interface DoctorStat {
  id: string;
  name: string;
  specialty: string;
  totalPatients: number;
  thisWeek: number;
  revenue: string;
  rating: string;
  services: Service[];
}

const AdminMonitoring = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [doctorStats, setDoctorStats] = useState<DoctorStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorStat | null>(null);
  const [showServicesDialog, setShowServicesDialog] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [showInteractionDialog, setShowInteractionDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/patient-intakes');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const { intakes } = await response.json();
        // Transform intakes into interactions
        const interactions = intakes.map((intake: any) => ({
          id: intake.id,
          patientName: `${intake.patient?.first_name || ''} ${intake.patient?.last_name || ''}`.trim(),
          patientId: intake.patient?.id || '',
          doctorName: intake.doctor?.name || '',
          doctorId: intake.doctor?.id || '',
          specialty: intake.doctor?.specialization || '',
          serviceName: intake.service?.service_name || '',
          serviceType: intake.service?.mode || '',
          appointmentDate: intake.appointment?.appointment_date ? new Date(intake.appointment.appointment_date).toISOString().split('T')[0] : '',
          appointmentTime: intake.appointment?.time || '',
          duration: '30 min',
          status: intake.appointment?.status?.toLowerCase() || '',
          insurance: intake.patient?.insurance_provider || 'Not specified',
          amount: intake.service ? `$${intake.service.price}` : '',
        }));
        setInteractions(interactions);
        // Optionally, you can also aggregate doctorStats here if needed
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "No Data Available",
          description: "There are no patient intakes in the system yet.",
          variant: "default",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const filteredInteractions = interactions.filter(interaction => {
    const matchesSearch = 
      interaction.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interaction.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || interaction.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleViewServices = (doctor: DoctorStat) => {
    setSelectedDoctor(doctor);
    setShowServicesDialog(true);
  };

  const handleViewInteractionDetails = (interaction: Interaction) => {
    setSelectedInteraction(interaction);
    setShowInteractionDialog(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedInteraction || !selectedStatus) return;

    if (selectedStatus === "CANCELLED" && !cancellationReason) {
      toast({
        title: "Error",
        description: "Please provide a reason for cancellation.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const reason = cancellationReason || `Status changed to ${selectedStatus.toLowerCase()} on ${new Date().toLocaleDateString()}`;

      const resp = await appointmentAction(
        selectedInteraction.id,
        selectedStatus,
        reason
      );

      if (resp.success) {
        toast({
          title: "Success",
          description: resp.msg,
        });
        // Refresh data or update state locally if needed
        // For now, refresh router for simplicity
        // router.refresh(); // Assuming router is available, need to import it if not.
        // A better approach would be to update the interactions state directly
        setInteractions(prevInteractions =>
          prevInteractions.map(interaction =>
            interaction.id === selectedInteraction.id
              ? { ...interaction, status: selectedStatus.toLowerCase() } // Assuming API returns lowercase status
              : interaction
          )
        );
        setSelectedStatus(null); // Reset selected status
        setCancellationReason(""); // Reset reason
        setShowInteractionDialog(false); // Close dialog
      } else if (resp.error) {
        toast({
          title: "Error",
          description: resp.msg,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Something went wrong while updating status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (interactions.length === 0 && doctorStats.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Patient-Provider Monitoring
            </h1>
            <p className="text-gray-600">
              Track and monitor all interactions between patients and healthcare providers
            </p>
          </div>
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h2>
              <p className="text-gray-500 mb-4">There are no services or interactions in the system yet.</p>
              <p className="text-gray-500">Add some services and appointments to see them here.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50"> 
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Patient-Provider Monitoring
          </h1>
          <p className="text-gray-600">
            Track and monitor all interactions between patients and healthcare providers
          </p>
        </div>

        <Tabs defaultValue="interactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="interactions">All Interactions</TabsTrigger>
            <TabsTrigger value="providers">Provider Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="interactions" className="space-y-6">
            {/* Search and Filter Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by patient, doctor, or service..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactions Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Patient-Provider Interactions ({filteredInteractions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInteractions.map((interaction) => (
                      <TableRow key={interaction.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{interaction.patientName}</div>
                            <div className="text-sm text-gray-500">ID: {interaction.patientId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{interaction.doctorName}</div>
                            <div className="text-sm text-gray-500">{interaction.specialty}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{interaction.serviceName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {interaction.serviceType === 'virtual' ? 
                              <Video className="h-4 w-4 text-blue-500" /> : 
                              <MapPin className="h-4 w-4 text-green-500" />
                            }
                            <span className="capitalize">{interaction.serviceType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {interaction.appointmentDate}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              {interaction.appointmentTime}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(interaction.status)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {interaction.amount}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInteractionDetails(interaction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            {/* Provider Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{doctorStats.length}</div>
                  <p className="text-sm text-gray-600">Active Providers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {doctorStats.reduce((sum, doctor) => sum + doctor.totalPatients, 0)}
                  </div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {doctorStats.reduce((sum, doctor) => sum + doctor.thisWeek, 0)}
                  </div>
                  <p className="text-sm text-gray-600">This Week</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    ${doctorStats.reduce((sum, doctor) => 
                      sum + parseFloat(doctor.revenue.replace('$', '')), 0
                    ).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </CardContent>
              </Card>
            </div>

            {/* Provider Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Provider Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Total Patients</TableHead>
                      <TableHead>This Week</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctorStats.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{doctor.name}</div>
                            <div className="text-sm text-gray-500">{doctor.specialty}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{doctor.totalPatients}</TableCell>
                        <TableCell>{doctor.thisWeek}</TableCell>
                        <TableCell>{doctor.revenue}</TableCell>
                        <TableCell>{doctor.rating}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewServices(doctor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Patient Activity Report
                  </Button>
                  <Button className="h-20 flex-col" variant="outline">
                    <Download className="h-6 w-6 mb-2" />
                    Provider Performance Report
                  </Button>
                  <Button className="h-20 flex-col" variant="outline">
                    <Download className="h-6 w-6 mb-2" />
                    Revenue Summary Report
                  </Button>
                  <Button className="h-20 flex-col" variant="outline">
                    <Download className="h-6 w-6 mb-2" />
                    Service Utilization Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Services Dialog */}
        <Dialog open={showServicesDialog} onOpenChange={setShowServicesDialog}>
          <DialogContent 
            className="w-full" 
            style={{ maxWidth: '1200px' }}
          >
            <DialogHeader>
              <DialogTitle>
                Services for {selectedDoctor?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 max-h-[80vh] overflow-y-auto pr-2">
              <Table className="table-auto w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total Appointments</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedDoctor?.services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-500">{service.description}</div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{service.mode}</TableCell>
                      <TableCell>${service.price.toFixed(2)}</TableCell>
                      <TableCell>{service.totalAppointments}</TableCell>
                      <TableCell>${service.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>

        {/* Interaction Details Dialog */}
        <Dialog open={showInteractionDialog} onOpenChange={setShowInteractionDialog}>
          <DialogContent className="max-w-xl w-full">
            <DialogHeader>
              <DialogTitle>
                Interaction Details
              </DialogTitle>
            </DialogHeader>
            {selectedInteraction && (
              <div className="mt-4 space-y-4 text-sm text-gray-700">
                <p><span className="font-medium">Patient:</span> {selectedInteraction.patientName}</p>
                <p><span className="font-medium">Doctor:</span> {selectedInteraction.doctorName} ({selectedInteraction.specialty})</p>
                <p><span className="font-medium">Service:</span> {selectedInteraction.serviceName} ({selectedInteraction.serviceType})</p>
                <p><span className="font-medium">Date & Time:</span> {selectedInteraction.appointmentDate} {selectedInteraction.appointmentTime}</p>
                <p><span className="font-medium">Status:</span> {selectedInteraction.status}</p>
                <p><span className="font-medium">Amount:</span> {selectedInteraction.amount}</p>
                {/* Add more details as needed */}

                {/* Status Change Buttons */}
                <div className="mt-6 border-t pt-4">
                  <p className="font-medium mb-3">Change Status:</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedInteraction.status === "pending" || isUpdatingStatus || selectedInteraction.status === "completed"}
                      className={cn("flex items-center gap-1", selectedStatus === "PENDING" && "bg-yellow-100 text-yellow-700 border-yellow-700")}
                      onClick={() => setSelectedStatus("PENDING")}
                    >
                      <Clock className="w-4 h-4" /> Pending
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedInteraction.status === "scheduled" || isUpdatingStatus || selectedInteraction.status === "completed"}
                      className={cn("flex items-center gap-1", selectedStatus === "SCHEDULED" && "bg-blue-100 text-blue-700 border-blue-700")}
                      onClick={() => setSelectedStatus("SCHEDULED")}
                    >
                      <CalendarCheck className="w-4 h-4" /> Scheduled
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedInteraction.status === "completed" || isUpdatingStatus}
                      className={cn("flex items-center gap-1", selectedStatus === "COMPLETED" && "bg-emerald-100 text-emerald-700 border-emerald-700")}
                      onClick={() => setSelectedStatus("COMPLETED")}
                    >
                      <CheckCircle className="w-4 h-4" /> Completed
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedInteraction.status === "cancelled" || isUpdatingStatus || selectedInteraction.status === "completed"}
                      className={cn("flex items-center gap-1", selectedStatus === "CANCELLED" && "bg-red-100 text-red-700 border-red-700")}
                      onClick={() => setSelectedStatus("CANCELLED")}
                    >
                      <XCircle className="w-4 h-4" /> Cancelled
                    </Button>
                  </div>

                  {selectedStatus === "CANCELLED" && (
                    <Textarea
                      disabled={isUpdatingStatus}
                      className="mt-4"
                      placeholder="Enter reason for cancellation..."
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                    />
                  )}

                  {selectedStatus && ( // Show confirmation when a status is selected
                    <div className="flex items-center justify-between mt-4 bg-emerald-50/80 border-l-4 border-emerald-400 p-3 rounded-md shadow-sm text-gray-700">
                      <p className="font-medium text-sm">Confirm status change to {selectedStatus.toLowerCase()}?</p>
                      <Button
                        disabled={isUpdatingStatus || (selectedStatus === "CANCELLED" && !cancellationReason)}
                        type="button"
                        onClick={handleStatusUpdate}
                        className="flex items-center gap-1"
                        size="sm"
                      >
                        {isUpdatingStatus && <Loader2 className="w-4 h-4 animate-spin" />} Yes, Update
                      </Button>
                    </div>
                  )}

                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminMonitoring;
