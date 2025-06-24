'use client';
import { Star, Quote, Stethoscope } from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DataProps {
  id: number;
  staff_id: string;
  rating: number;
  comment?: string;
  created_at: Date | string;
  doctor: { name: string; specialization: string; img?: string };
}

export const RatingList = ({ data }: { data: any[] }) => {
  return (
    <div className="relative bg-card backdrop-blur-lg rounded-2xl shadow-lg border border-border overflow-hidden">
      {/* Accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary to-accent rounded-t-2xl" />
      
      <div className="p-6 space-y-8">
        <AnimatePresence>
          {data?.map((rate, id) => (
            <React.Fragment key={rate?.id}>
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: id * 0.1 }}
                className="group bg-card/50 hover:bg-card/80 rounded-xl p-6 transition-all duration-300 hover:shadow-lg border border-border/50 hover:border-border"
              >
                {/* Doctor Information and Rating */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-sm">
                      <Stethoscope className="w-6 h-6" />
                        </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Dr. {rate?.doctor?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {rate?.doctor?.specialization}
                      </p>
                    </div>
                  </div>
                  
                  {/* Rating display */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, index) => (
                            <motion.span
                              key={index}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: id * 0.1 + index * 0.05, type: 'spring', stiffness: 200 }}
                            >
                              <Star
                                className={`w-5 h-5 ${index < rate.rating ? "fill-yellow-400" : "fill-muted"}`}
                                fill={index < rate.rating ? "#facc15" : "var(--muted)"}
                              />
                            </motion.span>
                          ))}
                      </div>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {rate.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                {/* Review Date */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Reviewed on {new Date(rate?.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Comment section */}
                  {rate.comment && (
                      <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    className="mt-4 bg-muted/50 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Quote className="w-5 h-5 text-primary/60 mt-1 flex-shrink-0" />
                      <p className="text-foreground/80 leading-relaxed">
                        {rate.comment}
                      </p>
                    </div>
                  </motion.div>
                  )}
                </motion.div>
            </React.Fragment>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {data?.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-lg">No reviews yet</p>
          </div>
        )}
      </div>
    </div>
  );
};