"use client";
import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";
import Logo from "@/public/logo.png";
import Image from "next/image";
import useAuthStore from "@/store/useAuthStore";
function Footer() {
  const { user, isAuthenticated } = useAuthStore();
  return (
    !user &&
    !isAuthenticated && (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="block justify-between lg:flex lg:items-center gap-4">
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Image src={Logo} alt="Logo" className="h-16 w-15" />

                <span className="text-2xl font-bold">YumyFly</span>
              </div>
              <p className="text-gray-400">
                Connecting great food with hungry customers, one delivery at a
                time.
              </p>
            </div>

            <div className="py-4">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/services"
                    className="text-gray-400 hover:text-white"
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-400 hover:text-white"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-white"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="py-4">
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} YumyFly. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    )
  );
}

export default Footer;
