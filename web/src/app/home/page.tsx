"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SidebarDemo() {
  const links = [
    {
      label: "Create",
      href: "#",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Unlock",
      href: "#",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Emergency Recovery",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-12 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "User Profile",
                href: "#",
                icon: (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                    U
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard />
    </div>
  );
}
export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold whitespace-pre text-black dark:text-white"
      >
        Future Protocol
      </motion.span>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};

// Dashboard component with actual content
const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-6 rounded-tl-2xl border border-neutral-200 bg-white p-6 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Welcome to Future Protocol</p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Time Capsules", value: "12", color: "from-blue-500 to-blue-600" },
            { title: "Active Locks", value: "8", color: "from-green-500 to-green-600" },
            { title: "Verified Proofs", value: "24", color: "from-purple-500 to-purple-600" },
            { title: "Total Users", value: "156", color: "from-orange-500 to-orange-600" }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border border-neutral-200 bg-gradient-to-r dark:border-neutral-700 text-white"
              style={{background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`}}
            >
              <div className={`bg-gradient-to-r ${stat.color} p-6 rounded-xl text-white`}>
                <h3 className="text-sm font-medium opacity-90">{stat.title}</h3>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Main Content Area */}
        <div className="flex flex-1 gap-6">
          <div className="flex-1">
            <div className="h-full rounded-xl border border-neutral-200 bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  "New time capsule created",
                  "Blockchain verification completed", 
                  "ZKTLS proof generated",
                  "Smart contract deployed"
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-3 rounded-lg bg-white dark:bg-neutral-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-gray-700 dark:text-gray-300">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="h-full rounded-xl border border-neutral-200 bg-gray-50 dark:border-neutral-700 dark:bg-neutral-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Status</h2>
              <div className="space-y-4">
                {[
                  { service: "Blockchain Network", status: "Online", color: "green" },
                  { service: "ZKTLS Service", status: "Online", color: "green" },
                  { service: "Storage Layer", status: "Online", color: "green" },
                  { service: "API Gateway", status: "Healthy", color: "green" }
                ].map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-neutral-700">
                    <span className="text-gray-700 dark:text-gray-300">{service.service}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      service.color === 'green' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen w-full">
      <SidebarDemo />
    </div>
  );
}
