import React from "react";
import { Target, Star, Heart } from "lucide-react";
import Image from "next/image";

type Props = {};

export default function AboutUs({}: Props) {
  const stats = [
    { number: "1M+", label: "Happy Customers" },
    { number: "500+", label: "Restaurant Partners" },
    { number: "1000+", label: "Delivery Drivers" },
    { number: "50+", label: "Cities Covered" },
  ];

  const values = [
    {
      icon: <Heart className="w-6 h-6 text-orange-500" />,
      title: "Customer First",
      description: "We prioritize customer satisfaction in everything we do",
    },
    {
      icon: <Star className="w-6 h-6 text-orange-500" />,
      title: "Quality Service",
      description:
        "Maintaining high standards in food delivery and customer service",
    },
    {
      icon: <Target className="w-6 h-6 text-orange-500" />,
      title: "Innovation",
      description: "Continuously improving our technology and services",
    },
  ];

  return (
    <div>
      {" "}
      {/* Hero Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 z-0">
          <Image
            width={300}
            height={300}
            src="https://images.unsplash.com/photo-1466637574441-749b8f19452f"
            alt="Food preparation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/90 to-orange-600/90"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-6">
              About YumyFly
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Connecting great food with hungry customers since 2023
            </p>
          </div>
        </div>
      </section>
      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 mb-6">
                YumyFly was founded with a simple mission: to make food delivery
                accessible, efficient, and enjoyable for everyone. What started
                as a small operation has grown into a thriving platform
                connecting thousands of restaurants with hungry customers.
              </p>
              <p className="text-gray-600">
                Today, we're proud to be a leading force in the food delivery
                industry, known for our reliability, innovation, and commitment
                to customer satisfaction. Our platform continues to evolve,
                incorporating the latest technology to provide the best possible
                experience for our users.
              </p>
            </div>
            <div className="relative h-96">
              <Image
                width={300}
                height={300}
                src="https://images.unsplash.com/photo-1498837167922-ddd27525d352"
                alt="Food delivery"
                className="w-full h-full object-cover rounded-xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
            <p className="mt-4 text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
              >
                <div className="flex justify-center mb-6">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-center">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
