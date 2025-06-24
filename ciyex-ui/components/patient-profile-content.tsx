'use client';

import { ProfileImage } from "@/components/profile-image";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Phone, Mail, MapPin, Heart, User, Shield, Clock, Edit2, FileText, CreditCard, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface PatientProfileContentProps {
  data: any;
  id: string;
  cat: string;
  loading?: boolean;
  medicalHistory?: React.ReactNode;
  patientRating?: React.ReactNode;
  upcomingAppointments?: any[];
}

export const PatientProfileContent = ({ 
  data, 
  id, 
  cat, 
  loading,
  medicalHistory,
  patientRating,
  upcomingAppointments = []
}: PatientProfileContentProps) => {
  const SmallCard = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => {
    return (
      <div className="w-full md:w-1/3 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm">
        <motion.div whileHover={{ scale: 1.02 }}>
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">{label}</span>
          </div>
          <p className="text-sm md:text-base font-medium text-gray-800">{value}</p>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Skeleton className="h-[400px] w-full" />
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Profile Card and Sidebar */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <motion.div whileHover={{ y: -5 }}>
                {/* Profile Card */}
                <Card className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-100 shadow-xl">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <ProfileImage
                          url={data?.img!}
                          name={data?.first_name + " " + data?.last_name}
                          className="h-32 w-32 rounded-full ring-4 ring-white shadow-xl"
                        />
                      </motion.div>
                      <span className="absolute -bottom-2 -right-2 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 rounded-full bg-green-500 border-2 border-white"></span>
                        <span className="text-xs text-green-600 font-semibold">Online</span>
                      </span>
                    </div>
                    <h1 className="font-bold text-2xl mt-4 text-gray-800">
                      {data?.first_name + " " + data?.last_name}
                    </h1>
                    <span className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Mail className="w-4 h-4" />
                      {data?.email}
                    </span>
                    <div className="w-full mt-6 flex justify-center">
                      <div className="flex items-center gap-4 bg-emerald-50 rounded-xl px-4 py-2">
                        <div className="text-center">
                          <p className="text-xl font-bold text-emerald-600">{data?.totalAppointments}</p>
                          <span className="text-xs text-gray-600">Appointments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                {/* Upcoming Appointments */}
                <Card className="bg-white/95 rounded-xl p-4 border border-blue-100 shadow-sm">
                  <h2 className="text-base font-semibold text-blue-700 mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> Upcoming Appointments</h2>
                  <div className="space-y-2">
                    {upcomingAppointments.length === 0 ? (
                      <div className="text-emerald-400 text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-400" /> No upcoming scheduled appointments.</div>
                    ) : (
                      upcomingAppointments.map((appt, idx) => (
                        <div key={appt.id} className="flex flex-col gap-1 p-2 rounded-lg bg-blue-50 border border-blue-100">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-800 flex items-center gap-1"><User className="w-4 h-4" />{appt.doctor?.name || 'Doctor'}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold uppercase">{appt.status}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString() : ''}</span>
                            <span className="font-mono flex items-center gap-1"><Clock className="w-3 h-3" />{appt.time}</span>
                            <span className="capitalize flex items-center gap-1"><Shield className="w-3 h-3" />{appt.type}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
                {/* Insurance Summary */}
                <Card className="bg-white/95 rounded-xl p-4 border border-purple-100 shadow-sm">
                  <h2 className="text-base font-semibold text-purple-700 mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Insurance Summary</h2>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 bg-purple-50 rounded-lg p-2 border border-purple-100">
                      <Shield className="w-4 h-4 text-purple-500" />
                      <span className="text-xs text-gray-500">Provider:</span>
                      <span className="text-sm font-medium text-gray-900">{data?.insurance_provider || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-50 rounded-lg p-2 border border-purple-100">
                      <CreditCard className="w-4 h-4 text-purple-500" />
                      <span className="text-xs text-gray-500">Insurance Number:</span>
                      <span className="text-sm font-medium text-gray-900">{data?.insurance_number || '-'}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Main Info Card and rest of the right column */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 rounded-2xl p-8 border border-emerald-100 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <User className="w-7 h-7 text-emerald-500" />
                    <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                    <span className="ml-2 text-sm text-gray-400 font-medium">Basic Details</span>
                  </div>
                  <Link href={`/patient/registration?id=${id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Edit2 className="w-4 h-4" />
                      Edit Details
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <div className="flex items-center gap-3 bg-white/80 border border-emerald-100 rounded-xl p-4 min-h-[70px] shadow-sm">
                    <User className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs text-gray-400">Gender</div>
                      <div className="text-sm font-semibold text-gray-900">{data?.gender?.toLowerCase() || "-"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 border border-emerald-100 rounded-xl p-4 min-h-[70px] shadow-sm">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs text-gray-400">State</div>
                      <div className="text-sm font-semibold text-gray-900">{data?.state || "-"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 border border-emerald-100 rounded-xl p-4 min-h-[70px] shadow-sm">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs text-gray-400">Date of Birth</div>
                      <div className="text-sm font-semibold text-gray-900">{data?.date_of_birth ? format(new Date(data.date_of_birth), "yyyy-MM-dd") : "-"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 border border-emerald-100 rounded-xl p-4 min-h-[70px] shadow-sm">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs text-gray-400">Last Visit</div>
                      <div className="text-sm font-semibold text-gray-900">{data?.lastVisit ? format(new Date(data.lastVisit), "yyyy-MM-dd") : "-"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 border border-emerald-100 rounded-xl p-4 min-h-[70px] shadow-sm">
                    <Phone className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs text-gray-400">Phone Number</div>
                      <div className="text-sm font-semibold text-gray-900">{data?.phone || "-"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 border border-emerald-100 rounded-xl p-4 min-h-[70px] shadow-sm">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs text-gray-400">Address</div>
                      <div className="text-sm font-semibold text-gray-900">{data?.address || "-"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 border border-emerald-100 rounded-xl p-4 min-h-[70px] shadow-sm">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs text-gray-400">Blood Group</div>
                      <div className="text-sm font-semibold text-gray-900">{data?.blood_group || "-"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 border border-emerald-100 rounded-xl p-4 min-h-[70px] shadow-sm">
                    <Mail className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs text-gray-400">Email</div>
                      <div className="text-sm font-semibold text-gray-900">{data?.email || "-"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 border border-emerald-100 rounded-xl p-4 min-h-[70px] shadow-sm">
                    <User className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs text-gray-400">Contact Person</div>
                      <div className="text-sm font-semibold text-gray-900">{data?.emergency_contact_name || "-"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 border border-emerald-100 rounded-xl p-4 min-h-[70px] shadow-sm">
                    <Phone className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs text-gray-400">Emergency Contact</div>
                      <div className="text-sm font-semibold text-gray-900">{data?.emergency_contact_number || "-"}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Always show Medical History */}
              {medicalHistory && (
                <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  {medicalHistory}
                </Card>
              )}

              {/* Quick Links */}
              <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link
                      className="block p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 text-yellow-700 hover:shadow-md transition-all"
                      href={`/record/appointments?id=${id}`}
                    >
                      <Calendar className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">Appointments</span>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link
                      className="block p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 text-purple-700 hover:shadow-md transition-all"
                      href="?cat=medical-history"
                    >
                      <FileText className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">Medical Records</span>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link
                      className="block p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 text-blue-700 hover:shadow-md transition-all"
                      href={`?cat=payments`}
                    >
                      <CreditCard className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">Medical Bills</span>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link
                      className="block p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 text-green-700 hover:shadow-md transition-all"
                      href={`/`}
                    >
                      <Activity className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                  </motion.div>
                </div>
              </Card>
            </div>
          </div>

          {/* Patient Rating Section */}
          {patientRating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {patientRating}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}; 