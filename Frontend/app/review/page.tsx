"use client"; // Ensure this is marked for client-side rendering

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import Link from "next/link";
import Map from "@/components/Map";
import { submitAreaStory, submitReport } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

// Define checkboxes options (Good and Bad things about the city)
const goodThingsOptions = [
  "Cleanliness",
  "Safety",
  "Greenery",
  "Walkability",
  "Proximity",
  "Cultural Vibes",
  "Community Events",
  "Lighting",
  "Pet-Friendly Spaces",
  "Public Amenities",
  "Road Conditions",
  "Innovative Infrastructure",
  "Scenic Views",
  "Public Transportation",
  "Business Activity",
];

const badThingsOptions = [ 
  "Trash and Litter",
  "Noise Pollution",
  "Air Pollution",
  "Potholes",
  "Poor Lighting",
  "Lack of Amenities",
  "Unsafe Areas",
  "Stray Animals",
  "Overcrowding",
  "Accessibility Issues",
  "Unpleasant Odors",
  "Waterlogging",
  "Graffiti or Vandalism",
  "High Prices",
  "Unstable Internet",
];

// Create a schema for the form
const reviewSchema = z
  .object({
    goodThings: z.record(z.boolean()),
    badThings: z.record(z.boolean()),
    goodAndUnderrated: z.string().optional(),
    underratedThings: z.string().optional(),
    funFact: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasCheckedBoxes = Object.values(data.goodThings).some(Boolean) || Object.values(data.badThings).some(Boolean);
      const hasTextInput = !!data.goodAndUnderrated || !!data.underratedThings || !!data.funFact;

      return hasCheckedBoxes || hasTextInput;
    },
    {
      message: "Please provide at least one type of feedback (ratings or story)",
    }
  );

type ReviewFormData = z.infer<typeof reviewSchema>;

const Review = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lon: number;
    address: string;
  }>();

  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Ensure localStorage is accessed only in the browser
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("userEmail");
      setUserEmail(storedEmail || "");
    }
  }, []); // This will run once when the component mounts

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    watch,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  });

  const onSubmit = async (data: ReviewFormData) => {
    if (!selectedLocation || !userEmail) {
      toast({
        title: "Location Required",
        description: "Please select a location on the map first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Submit the area story if any story fields are filled
      if (data.goodAndUnderrated || data.underratedThings || data.funFact) {
        try {
          const goodThingsParams = Object.entries(data.goodThings)
            .filter(([_, selected]) => selected)
            .reduce(
              (acc, [key]) => ({
                ...acc,
                [key.toLowerCase().replace(/ /g, "_")]: 1,
              }),
              {}
            );

          const badThingsParams = Object.entries(data.badThings)
            .filter(([_, selected]) => selected)
            .reduce(
              (acc, [key]) => ({
                ...acc,
                [key.toLowerCase().replace(/ /g, "_")]: -1,
              }),
              {}
            );

          const storyData = {
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lon,
            email: userEmail,
            ...goodThingsParams,
            ...badThingsParams,
            good_things: data.goodAndUnderrated || "",
            underrated_things: data.underratedThings || "",
            fun_fact: data.funFact || "",
          };

          console.log("Sending story data:", JSON.stringify(storyData, null, 2));
          await submitAreaStory(storyData);
        } catch (storyError) {
          console.error("Story submission error:", storyError);
          toast({
            title: "Story Submission Error",
            description: storyError instanceof Error ? storyError.message : "Failed to submit story",
            variant: "destructive",
          });
          return;
        }
      }

      // Submit the ratings report if any checkboxes are selected
      const selectedGoodThings = Object.entries(data.goodThings)
        .filter(([_, selected]) => selected)
        .map(([option]) => option);

      const selectedBadThings = Object.entries(data.badThings)
        .filter(([_, selected]) => selected)
        .map(([option]) => option);

      if (selectedGoodThings.length > 0 || selectedBadThings.length > 0) {
        try {
          const ratings: { [key: string]: number } = {};
          selectedGoodThings.forEach((thing) => {
            ratings[thing.toLowerCase().replace(/ /g, "_")] = 5;
          });
          selectedBadThings.forEach((thing) => {
            ratings[thing.toLowerCase().replace(/ /g, "_")] = 1;
          });

          await submitReport({
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lon,
            reports: ratings,
          });
        } catch (reportError) {
          console.error("Report submission error:", reportError);
          toast({
            title: "Rating Submission Error",
            description: reportError instanceof Error ? reportError.message : "Failed to submit ratings",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Success",
        description: "Your review has been submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const watchData = watch(); // Capture the form values
  console.log("Current Form Data:", watchData); // Add this to watch form data changes

  return (
    <>
      <div className="flex flex-col min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/bg.jpg')" }}>
        <header className="bg-primary text-primary-foreground py-4">
          <div className="container mx-auto px-4">
            <nav className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold">
                GeoGrade
              </Link>
              <div className="space-x-4">
                <Link href="/" className="hover:underline">
                  Home
                </Link>
                <Link href="/compare" className="hover:underline">
                  Compare
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <div className="grid grid-cols-5 gap-8 lg:gap-8">
          <div className="pl-16 pr-16 col-span-5 border-r-8">
            <Map onLocationSelect={(lat, lon, address) => setSelectedLocation({ lat, lon, address })} userType="general" />
          </div>
        </div>

        <section className="w-full mt-10 mb-36 max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl border border-gray-200">
          <header className="flex flex-col gap-5 md:gap-8 p-3">
            <h1 className="text-2xl font-semibold text-center text-black">Tell Us About Your City</h1>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Good Things About Your City Card */}
            <div className="border p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Good Things About Your City</h2>
              <div className="grid grid-cols-2 gap-4">
                {goodThingsOptions.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input type="checkbox" {...register(`goodThings.${option}`, { value: false })} className="mr-2" />
                    <label>{option}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Bad Things About Your City Card */}
            <div className="border p-6 rounded-lg shadow-md mt-8">
              <h2 className="text-xl font-semibold mb-4">Bad Things About Your City</h2>
              <div className="grid grid-cols-2 gap-4">
                {badThingsOptions.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input type="checkbox" {...register(`badThings.${option}`, { value: false })} className="mr-2" />
                    <label>{option}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Input for Good and Underrated Things */}
            <div className="mt-8">
              <label className="block text-lg font-medium text-gray-700">Good and Underrated Things About Your Area/City</label>
              <textarea
                {...register("goodAndUnderrated")}
                className="w-full p-3 border border-gray-300 rounded-lg mt-2"
                placeholder="Write something good or underrated about your area/city"
                rows={4}
              />
            </div>

            {/* Input for Fun Fact */}
            <div className="mt-8">
              <label className="block text-lg font-medium text-gray-700">Fun Fact About Your Area/City</label>
              <textarea {...register("funFact")} className="w-full p-3 border border-gray-300 rounded-lg mt-2" placeholder="Share a fun fact about your area/city" rows={4} />
            </div>

            {/* Input for Underrated Things */}
            <div className="mt-8">
              <label className="block text-lg font-medium text-gray-700">Underrated Things About Your Area/City</label>
              <textarea {...register("underratedThings")} className="w-full p-3 border border-gray-300 rounded-lg mt-2" placeholder="Share something underrated about your area/city" rows={4} />
            </div>

            <div className="flex justify-center pb-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
};

export default Review;
