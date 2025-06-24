import React, { useState, useEffect, useCallback } from 'react';                   
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HeartPulse, Users, Search, Check, X, ChevronDown, ChevronUp, Filter, Download, Trash } from 'lucide-react';

import { Button } from "../../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../components/ui/table";
import { Badge } from "../../../../../components/ui/badge";
import { Input } from "../../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../../../components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../../../../../components/ui/sheet";
import { Separator } from "../../../../../components/ui/separator";
import { useToast } from "../../../../../hooks/use-toast";
import { DoctorForm } from "../../../../../components/forms/doctor-form";

interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  licenseNumber: string;
  email: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'canceled';
}

interface ApiResponse {
  success: boolean;
  data: Doctor[];
  totalRecords: number;
  totalPending?: number;
  totalApproved?: number;
  totalRejected?: number;
  error?: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [totalDoctors, setTotalDoctors] = useState<number>(0);
  const [totalPendingDoctors, setTotalPendingDoctors] = useState<number>(0);
  const [totalApprovedDoctors, setTotalApprovedDoctors] = useState<number>(0);
  const [totalRejectedDoctors, setTotalRejectedDoctors] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortColumn, setSortColumn] = useState('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const doctorsPerPage = 9;
  
  const fetchDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: doctorsPerPage.toString(),
        search: searchQuery,
        status: filterStatus,
        sortColumn,
        sortDirection
      });

      const res = await fetch(`/api/doctors/all?${queryParams.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data: ApiResponse = await res.json();
      
      if (data.success) {
        if (data.data && data.data.length > 0) {
          const formattedDoctors = data.data.map((doctor) => ({
            ...doctor,
            fullName: doctor.fullName || 'N/A',
            specialization: doctor.specialization || 'N/A',
            licenseNumber: doctor.licenseNumber || 'N/A',
            email: doctor.email || 'N/A',
            submittedAt: doctor.submittedAt || new Date().toISOString(),
            status: doctor.status || 'pending'
          }));
          setDoctors(formattedDoctors);
          setTotalDoctors(data.totalRecords || formattedDoctors.length);
        } else {
          setDoctors([]);
          setTotalDoctors(0);
          toast({
            title: "No Data",
            description: "No doctors found in the current page.",
            variant: "default"
          });
        }
        // Set live totals for cards
        setTotalPendingDoctors(data.totalPending || 0);
        setTotalApprovedDoctors(data.totalApproved || 0);
        setTotalRejectedDoctors(data.totalRejected || 0);
      } else {
        throw new Error(data.error || 'Failed to fetch doctor data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch doctor data';
      setDoctors([]);
      setTotalDoctors(0);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, filterStatus, sortColumn, sortDirection, doctorsPerPage, toast]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, sortColumn, sortDirection]);

  // Sanitize search query
  const sanitizeSearchQuery = (query: string) => {
    return query.replace(/[<>]/g, ''); // Basic XSS prevention
  };

  // Filter doctors (only for search and status)
  const filteredDoctors = React.useMemo(() => {
    const sanitizedQuery = sanitizeSearchQuery(searchQuery.toLowerCase());
    return doctors.filter(doctor => {
      const matchesSearch = doctor.fullName.toLowerCase().includes(sanitizedQuery) || 
                          doctor.email.toLowerCase().includes(sanitizedQuery) ||
                          doctor.specialization.toLowerCase().includes(sanitizedQuery);
      const matchesStatus = filterStatus === 'all' || doctor.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [doctors, searchQuery, filterStatus]);

  // Calculate total pages based on total records from API
  const totalPages = Math.ceil(totalDoctors / doctorsPerPage);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const handleStatusChange = async (doctorId: string, newStatus: 'approved' | 'rejected' | 'canceled') => {
    try {
      const res = await fetch('/api/doctors/status', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Add CSRF token if your backend requires it
          // 'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ userId: doctorId, status: newStatus }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update status: ${res.statusText}`);
      }

      // Update local state for instant UI feedback
      setDoctors(doctors.map(doctor =>
        doctor.id === doctorId ? { ...doctor, status: newStatus } : doctor
      ));

      toast({
        title: `Doctor ${newStatus === 'approved' ? 'approved' : newStatus}`,
        description: `Doctor application has been ${newStatus}.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update doctor status';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  const viewDoctorDetails = (doctor: any) => {
    router.push(`/record/doctors/${doctor.id}`);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100/50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100/50 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100/50 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handleDeleteDoctor = async (doctorId: string) => {
    if (!window.confirm("Are you sure you want to delete this doctor? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/doctors/delete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Add CSRF token if your backend requires it
          // 'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ id: doctorId }),
      });

      if (!res.ok) {
        throw new Error(`Failed to delete doctor: ${res.statusText}`);
      }

      setDoctors(doctors.filter(d => d.id !== doctorId));
      toast({
        title: "Doctor deleted",
        description: "The doctor has been removed.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete doctor';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  // Add loading state to the table
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8">
            Loading doctors...
          </TableCell>
        </TableRow>
      );
    }

    if (filteredDoctors.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
            No doctor applications found matching your criteria
          </TableCell>
        </TableRow>
      );
    }

    return filteredDoctors.map((doctor) => (
      <TableRow key={doctor.id} className="border-border/40 hover:bg-muted/50">
        <TableCell className="font-medium text-foreground">{doctor.fullName}</TableCell>
        <TableCell className="text-muted-foreground">{doctor.specialization}</TableCell>
        <TableCell className="text-muted-foreground">{doctor.licenseNumber}</TableCell>
        <TableCell className="text-muted-foreground">{doctor.email}</TableCell>
        <TableCell className="text-muted-foreground">{formatDate(doctor.submittedAt)}</TableCell>
        <TableCell>{getStatusBadge(doctor.status)}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="border-border/40"
              onClick={() => viewDoctorDetails(doctor)}
            >
              View Details
            </Button>
            {doctor.status === 'pending' && (
              <>
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusChange(doctor.id, 'approved')}
                >
                  Approve
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleStatusChange(doctor.id, 'rejected')}
                >
                  Reject
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteDoctor(doctor.id)}
              title="Delete doctor"
            >
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));
  };
  
  return (
    <div className="min-h-screen bg-background w-full">
      <div className="flex flex-col w-full">
        <main className="flex-1 py-8 px-2 md:px-6 w-full">
          <div className="flex flex-col gap-8 w-full">
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
              <Card className="bg-card border-border/40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Total Applications</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{totalDoctors}</div>
                  <p className="text-xs text-muted-foreground">
                    Total doctor applications
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border/40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Pending Review</CardTitle>
                  <ChevronDown className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{totalPendingDoctors}</div>
                  <p className="text-xs text-muted-foreground">
                    Requires your attention
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border/40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Approved</CardTitle>
                  <Check className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{totalApprovedDoctors}</div>
                  <p className="text-xs text-muted-foreground">
                    Active doctors
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border/40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">Rejected</CardTitle>
                  <X className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{totalRejectedDoctors}</div>
                  <p className="text-xs text-muted-foreground">
                    Declined applications
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, email, or specialization..." 
                  className="pl-10 bg-background border-border/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 items-center">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px] bg-background border-border/40">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">Filter by status</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-border/40">
                  <Download className="h-4 w-4 mr-2 text-muted-foreground" />
                  Export
                </Button>
                <DoctorForm />
              </div>
            </div>
            
            {/* Applications Table */}
            <div className="w-full overflow-x-auto">
              <Card className="bg-card border-border/40 min-w-[900px] w-full">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/40 hover:bg-muted/50">
                        <TableHead className="cursor-pointer text-foreground" onClick={() => handleSort('name')}>
                          <div className="flex items-center">
                            Doctor Name
                            {sortColumn === 'name' && (
                              sortDirection === 'asc' ? 
                                <ChevronUp className="h-4 w-4 ml-1 text-muted-foreground" /> : 
                                <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-foreground">Specialization</TableHead>
                        <TableHead className="text-foreground">License</TableHead>
                        <TableHead className="text-foreground">Email</TableHead>
                        <TableHead className="cursor-pointer text-foreground" onClick={() => handleSort('submittedAt')}>
                          <div className="flex items-center">
                            Submitted
                            {sortColumn === 'submittedAt' && (
                              sortDirection === 'asc' ? 
                                <ChevronUp className="h-4 w-4 ml-1 text-muted-foreground" /> : 
                                <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-foreground">Status</TableHead>
                        <TableHead className="text-right text-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDoctors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No doctor applications found matching your criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDoctors.map((doctor) => (
                          <TableRow key={doctor.id} className="border-border/40 hover:bg-muted/50">
                            <TableCell className="font-medium text-foreground">{doctor.fullName}</TableCell>
                            <TableCell className="text-muted-foreground">{doctor.specialization}</TableCell>
                            <TableCell className="text-muted-foreground">{doctor.licenseNumber}</TableCell>
                            <TableCell className="text-muted-foreground">{doctor.email}</TableCell>
                            <TableCell className="text-muted-foreground">{formatDate(doctor.submittedAt)}</TableCell>
                            <TableCell>{getStatusBadge(doctor.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-border/40"
                                  onClick={() => viewDoctorDetails(doctor)}
                                >
                                  View Details
                                </Button>
                                {doctor.status === 'pending' && (
                                  <>
                                    <Button 
                                      variant="default" 
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleStatusChange(doctor.id, 'approved')}
                                    >
                                      Approve
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => handleStatusChange(doctor.id, 'rejected')}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteDoctor(doctor.id)}
                                  title="Delete doctor"
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4 px-2 md:px-6 w-full">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Prev
        </Button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
