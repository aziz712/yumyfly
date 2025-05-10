import React from "react";
import {
  Utensils,
  Truck,
  Store,
  Clock,
  Shield,
  HeartHandshake,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function page() {
  const features = [
    {
      icon: <Utensils className="w-8 h-8 text-orange-500" />,
      title: "Restaurant Partners",
      description:
        "Partner with top-rated restaurants to deliver quality food to customers.",
    },
    {
      icon: <Truck className="w-8 h-8 text-orange-500" />,
      title: "Delivery Network",
      description:
        "Efficient delivery system with real-time tracking and notifications.",
    },
    {
      icon: <Store className="w-8 h-8 text-orange-500" />,
      title: "Business Solutions",
      description: "Comprehensive tools for restaurant management and growth.",
    },
  ];

  const benefits = [
    {
      icon: <Clock className="w-6 h-6 text-orange-500" />,
      title: "Fast Delivery",
      description: "Average delivery time under 30 minutes",
    },
    {
      icon: <Shield className="w-6 h-6 text-orange-500" />,
      title: "Secure Payments",
      description: "100% secure payment processing",
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-orange-500" />,
      title: "Quality Assurance",
      description: "Strict quality control standards",
    },
  ];

  return (
    <div>
      {" "}
      {/* Hero Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 z-0">
          <Image
            width={100}
            height={100}
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591"
            alt="Food background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/90 to-orange-600/90"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-6">
              Revolutionizing Food Delivery
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of satisfied partners and customers in our growing
              food delivery ecosystem
            </p>
          </div>
        </div>
      </section>
      {/* Main Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Our Core Services
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Comprehensive solutions for every stakeholder
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
              >
                <div className="flex justify-center mb-6">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose YumyFly
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Experience the difference with our service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    {benefit.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="bg-orange-500 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Ready to Get Started?
          </h2>
          <Link href={"login"} className="">
            <button className="bg-white text-orange-500 px-8 py-3 rounded-full font-semibold cursor-pointer  transition-colors hover:bg-orange-500 hover:text-white hover:border-2 hover:border-white">
              Join YumyFly Today
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
