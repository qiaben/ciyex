import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewProps {
  testId: string;
  testName: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  patientName: string;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('');
};

const TestReviews: React.FC<ReviewProps> = ({ testId, testName }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    if (open) {
      fetch(`/api/reviews?testId=${testId}`)
        .then(res => res.json())
        .then(data => setReviews(Array.isArray(data.data) ? data.data : []));
      fetch(`/api/reviews/eligibility?testId=${testId}`)
        .then(res => res.json())
        .then(data => setCanReview(data.eligible));
    }
  }, [open, testId]);

  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testId, rating, comment }),
    });
    setRating(0);
    setComment('');
    setSubmitting(false);
    // Refetch reviews
    fetch(`/api/reviews?testId=${testId}`)
      .then(res => res.json())
      .then(data => setReviews(Array.isArray(data.data) ? data.data : []));
    fetch(`/api/reviews/eligibility?testId=${testId}`)
      .then(res => res.json())
      .then(data => setCanReview(data.eligible));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <span className="flex items-center gap-1">
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            {averageRating.toFixed(1)}
            <span className="text-gray-500 ml-1">({reviews.length})</span>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-800 to-yellow-600 px-6 py-4 flex flex-col items-center border-b border-yellow-700">
          <DialogHeader className="w-full">
            <DialogTitle className="text-2xl font-bold text-yellow-100 text-center mb-2">{testName} Reviews</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={22}
                className={i < Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}
              />
            ))}
            <span className="font-bold text-xl text-yellow-100">{averageRating.toFixed(1)}</span>
          </div>
          <span className="text-gray-300 text-sm">{reviews.length} customer review{reviews.length === 1 ? '' : 's'}</span>
        </div>
        <div className="px-6 py-4 bg-gray-800">
          {/* Write a Review */}
          {canReview && (
            <div className="mb-8 rounded-lg border border-yellow-700 bg-gray-700 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={28}
                    className={i < rating ? "text-yellow-400 fill-yellow-400 cursor-pointer" : "text-gray-500 cursor-pointer"}
                    onClick={() => setRating(i + 1)}
                  />
                ))}
              </div>
              <textarea
                className="w-full border border-yellow-700 rounded p-2 mb-2 bg-gray-600 text-white focus:bg-gray-500 focus:border-yellow-400 transition"
                rows={3}
                placeholder="Write your review (optional)"
                value={comment}
                onChange={e => setComment(e.target.value)}
              />
              <Button onClick={handleSubmit} disabled={submitting || rating === 0} className="bg-yellow-600 hover:bg-yellow-500 text-yellow-100 font-bold w-full">
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          )}
          {/* List of Reviews */}
          <div className="space-y-4 max-h-72 overflow-y-auto">
            {reviews.length === 0 && (
              <div className="text-center text-gray-400 py-8">No reviews yet. Be the first to review this test!</div>
            )}
            {reviews.map((r, idx) => (
              <div key={r.id || idx} className="border-b border-gray-700 pb-3 flex gap-3 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-700 flex items-center justify-center font-bold text-yellow-100 text-lg">
                  {getInitials(r.patientName)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}
                      />
                    ))}
                    <span className="font-medium text-gray-200">{r.patientName}</span>
                    <span className="text-xs text-gray-400 ml-2">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-gray-300 text-sm">{r.comment}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestReviews;
