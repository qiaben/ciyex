"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus, StarIcon, CheckCircle2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { createRating } from "@/app/actions/general";
import Confetti from "react-confetti";
import { getCurrentUserFromToken } from "@/app/utils/auth";

export const ratingSchema = z.object({
  patient_id: z.string(),
  staff_id: z.string(),
  appointment_id: z.string(),
  rating: z.number().min(1).max(5),
  comment: z
      .string()
      .min(10, "Review must be at least 10 characters long")
      .max(500, "Review must not exceed 500 characters"),
});

export type RatingFormValues = z.infer<typeof ratingSchema>;

export const ReviewForm = ({ staffId, appointmentId }: { staffId: string, appointmentId: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");

  // Load JWT userId from token on mount
  useEffect(() => {
    async function fetchUser() {
      const user = await getCurrentUserFromToken();
      setUserId(user?.userId?.toString() || "");
    }
    fetchUser();
  }, []);

  const form = useForm<RatingFormValues>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      patient_id: userId,
      staff_id: staffId,
      appointment_id: appointmentId,
      rating: 1,
      comment: "",
    },
  });

  // Keep patient_id up to date if userId changes
  useEffect(() => {
    form.setValue("patient_id", userId);
  }, [userId]); // eslint-disable-line

  const handleSubmit = async (values: RatingFormValues) => {
    try {
      setLoading(true);
      const response = await createRating(values);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          setDialogOpen(false);
          setSuccess(false);
          router.refresh();
        }, 2000);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create rating");
    } finally {
      setLoading(false);
    }
  };

  return (
      <>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
                size={"sm"}
                className="px-4 py-2 rounded-lg bg-black/10 text-black hover:bg-transparent font-light"
            >
              <Plus /> Add New Review
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Review</DialogTitle>
              <DialogDescription>
                Please fill in the form below to add a new review.
              </DialogDescription>
            </DialogHeader>

            {success ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Confetti width={400} height={200} numberOfPieces={150} recycle={false} />
                  <CheckCircle2 className="text-green-500 mb-4" size={64} />
                  <div className="text-xl font-semibold text-green-600 mb-2">Thank you!</div>
                  <div className="text-base text-gray-600">Your rating has been submitted.</div>
                </div>
            ) : (
                <Form {...form}>
                  <form
                      onSubmit={form.handleSubmit(handleSubmit)}
                      className="space-y-6"
                  >
                    <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rating</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-3">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                          key={star}
                                          onClick={() => field.onChange(star)}
                                          type="button"
                                      >
                                        <StarIcon
                                            size={30}
                                            className={cn(
                                                star <= field.value
                                                    ? "text-yellow-500 fill-yellow-500"
                                                    : "text-gray-400"
                                            )}
                                        />
                                      </button>
                                  ))}
                                </div>
                              </FormControl>
                              <FormDescription>
                                Please rate the staff based on your experience.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                            <FormItem>
                              <FormLabel>Comment</FormLabel>
                              <FormControl>
                                <Textarea
                                    placeholder="Write your review here..."
                                    className="resize-none"
                                    {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Please write a detailed review of your experience.
                              </FormDescription>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={loading || !userId} className="w-full">
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                  </form>
                </Form>
            )}
          </DialogContent>
        </Dialog>
      </>
  );
};
