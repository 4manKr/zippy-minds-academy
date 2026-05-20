import { Suspense } from "react";
import { SearchParamsReader } from "./SearchParamsReader";

export default function AvailabilityRespondedPage() {
  return (
    <div className="min-h-screen bg-[#f0f6ff] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading…</p>
          </div>
        }
      >
        <SearchParamsReader />
      </Suspense>
    </div>
  );
}
