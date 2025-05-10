"use client";
import React from "react";
import {
  ChevronRight,
  Utensils,
  Clock,
  Shield,
  LockKeyhole,
  Torus,
  PackageOpen,
} from "lucide-react";
import Link from "next/link";
import BiryaniImg from "@/public/biryani5.png";
import Image from "next/image";
import AppStore from "@/components/home/AppStore/AppStore";
import Testimonial from "@/components/home/Testimonial/Testimonial";
import hero from "@/public/hero.jpg";
import useAuthStore from "@/store/useAuthStore";

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  // Redirect if user is already authenticated
  if (isAuthenticated) {
    if (user?.role === "admin") {
      window.location.href = "/admin";
      return null;
    } else if (user?.role === "livreur") {
      window.location.href = "/livreur";
      return null;
    } else if (user?.role === "restaurant") {
      window.location.href = "/restaurant";
      return null;
    } else if (user?.role === "client") {
      window.location.href = "/client";
      return null;
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={hero}
            alt="Food delivery"
            layout="fill"
            objectFit="cover"
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-opacity-50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Delicious Food,
            <br />
            Delivered to Your Door
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8">
            Connect with the best restaurants in your area
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-8 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            Get Started
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-20 bg-white"
        data-aos="fade-up"
        data-aos-duration="300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose YumyFly?
            </h2>
            <p className="text-xl text-gray-600">
              We make food delivery simple and delightful
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Utensils className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quality Restaurants</h3>
            <p className="text-gray-600">
              Partner with the finest restaurants in your area for the best
              dining experience.
            </p>

            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              Quick and reliable delivery service to get your food while it's
              hot.
            </p>

            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
            <p className="text-gray-600">
              Safe and secure transactions with real-time order tracking.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 bg-orange-50"
        data-aos="zoom-in"
        data-aos-duration="300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of satisfied customers who trust YumyFly for their
              food delivery needs.
            </p>
            <Link
              href="/signin"
              className="inline-flex items-center px-8 py-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
            >
              Sign Up Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* banner section  */}

      <section className="py-20" data-aos="fade-up" data-aos-duration="300">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Image section */}
          <div>
            <Image
              src={BiryaniImg}
              alt="biryani img"
              className="max-w-[430px] w-full mx-auto drop-shadow-[-10px_10px_12px_rgba(0,0,0,1)]"
            />
          </div>
          {/* text content section */}
          <div className="flex flex-col justify-center gap-6 sm:pt-0">
            <h1 className="text-3xl sm:text-4xl font-bold">
              Lorem, ipsum dolor.
            </h1>
            <p className="text-sm text-gray-500 tracking-wide leading-5">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eaque
              reiciendis inventore iste ratione ex alias quis magni at optio
              <br />
              <br />
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae ab
              sed, exercitationem minima aliquid eligendi distinctio? Fugit
              repudiandae numquam hic quo recusandae. Excepturi totam ad nam
              velit quasi quidem aspernatur.
            </p>
            <div className="flex gap-6">
              <div>
                <LockKeyhole className="text-4xl h-20 w-20 shadow-sm p-5 rounded-full bg-violet-100 dark:bg-violet-400" />
              </div>
              <div>
                <Torus className="text-4xl h-20 w-20 shadow-sm p-5 rounded-full bg-orange-100 dark:bg-orange-400" />
              </div>
              <div>
                <PackageOpen className="text-4xl h-20 w-20 shadow-sm p-5 rounded-full bg-green-100 dark:bg-green-400" />
              </div>
            </div>
            <div>
              <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-full shadow-xl hover:shadow-md">
                Order Now
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* App Store Section */}
      <section className="py-20">
        <AppStore />
      </section>

      {/* testimonial section */}
      <section className="bg-white">
        <Testimonial />
      </section>
    </div>
  );
}
