"use client";
import React from "react";
import { useAvisStore } from "@/store/useAvisStore";
import { useEffect } from "react";

export default function AvisList() {
  const { avis, loading, error, fetchAllAvis } = useAvisStore();

  useEffect(() => {
    fetchAllAvis();
  }, [fetchAllAvis]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {avis.map((review) => (
        <div key={review._id}>
          <h3>{review.client?.nom || "Anonymous"}</h3>
          <p>Note: {review.note}/5</p>
          <p>{review.commentaire}</p>
        </div>
      ))}
    </div>
  );
}
