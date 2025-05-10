"use client";
import React, { useEffect, useState } from "react";
import { useAvisStore } from "@/store/useAvisStore";
import Image from "next/image";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Testimonial = () => {
  const { avis, loading, error, fetchAllAvis } = useAvisStore();
  const [randomAvis, setRandomAvis] = useState<any[]>([]);

  useEffect(() => {
    fetchAllAvis();
  }, [fetchAllAvis]);

  useEffect(() => {
    if (avis && avis.length > 0) {
      // Shuffle the avis array and pick 4 random items
      const shuffledAvis = [...avis].sort(() => 0.5 - Math.random());
      setRandomAvis(shuffledAvis.slice(0, 4));
    }
  }, [avis]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  console.log(avis);
  return (
    <div data-aos="fade-up" data-aos-duration="300">
      <div>
        <section
          id="testimonials"
          aria-label="What our customers are saying"
          className="py-20 sm:py-32"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl md:text-center">
              <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
                What Our Customers Are Saying
              </h2>
            </div>

            <ul
              role="list"
              className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-3"
            >
              {randomAvis.map((review) => (
                <li key={review._id}>
                  <ul role="list" className="flex flex-col  gap-y-6 sm:gap-y-8">
                    <li>
                      <figure className="relative rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10">
                        <blockquote className="relative">
                          <p className="text-lg tracking-tight text-slate-900">
                            {review.commentaire}
                          </p>
                        </blockquote>
                        <figcaption className="relative mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                          <div className="flex items-center gap-3">
                            <div className="font-display flex gap-2 items-center text-base text-slate-900">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={
                                    review?.client?.photoProfil
                                      ? process.env.NEXT_PUBLIC_APP_URL +
                                        review?.client?.photoProfil
                                      : ""
                                  }
                                  alt={`${review.client?.nom}  `}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {review.client?.nom.charAt(0)}
                                </AvatarFallback>
                              </Avatar>{" "}
                              {review.client?.nom || "Anonymous"}
                            </div>
                            <div className="text-sm flex text-slate-500">
                              {Array.from(
                                { length: review.note },
                                (_, index) => (
                                  <Star
                                    className="h-4 w-4 text-yellow-500 fill-yellow-500"
                                    key={index}
                                  />
                                )
                              )}
                            </div>
                          </div>
                          <div className="overflow-hidden rounded-full bg-slate-50">
                            {/* Placeholder image for now */}
                          </div>
                        </figcaption>
                      </figure>
                    </li>
                  </ul>
                </li>
              ))}
            </ul>
            {randomAvis.length === 0 && (
              <div className="w-full flex items-center justify-center">
                <span className="text-center">
                  {" "}
                  pas encore d'avis sur la plateforme
                </span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Testimonial;
