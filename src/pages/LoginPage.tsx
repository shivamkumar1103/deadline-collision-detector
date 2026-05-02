import React from "react";
import { motion } from "motion/react";
import { Bell } from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/react";
import { ThemeToggle } from "../components/ThemeToggle";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4 transition-colors relative">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-black border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] p-8 md:p-12"
      >
        <div className="text-center mb-10">
          <div className="inline-flex border-4 border-black dark:border-white p-4 mb-6 bg-yellow-400 text-black">
            <Bell className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold uppercase tracking-tighter text-black dark:text-white leading-none">
            Collision
            <span className="block mt-2">Detector</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-bold tracking-widest uppercase text-xs mt-6">
            Sign in to manage your workload
          </p>
        </div>

        <div className="space-y-4">
          <SignInButton mode="modal">
            <button className="w-full bg-black dark:bg-white text-white dark:text-black font-extrabold tracking-widest uppercase py-4 border-2 border-black dark:border-white hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="w-full bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white font-extrabold tracking-widest uppercase py-4 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
              Create an Account
            </button>
          </SignUpButton>
        </div>
      </motion.div>
    </div>
  );
}
