import { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-dark-secondary rounded-xl border border-white/5 p-5 transition-all duration-300 hover:border-white/10 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.05)]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-dark-bg border border-white/5 flex items-center justify-center text-lg shrink-0">
          {review.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-text-primary text-sm font-medium truncate">
            {review.username}
          </div>
          <div className="text-text-secondary text-xs">{review.timestamp}</div>
        </div>
        <div className="flex items-center gap-1 text-text-secondary text-xs shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <span>{review.upvotes}</span>
        </div>
      </div>
      <p className="text-text-secondary text-sm leading-relaxed">
        &ldquo;{review.text}&rdquo;
      </p>
    </div>
  );
}
