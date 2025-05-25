import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar'; // Re-using Navbar for consistent header
import { Footer } from '@/components/layout/Footer'; // Re-using Footer
import { CheckCircle, Zap, Users, BarChart, ShieldCheck, Layers } from 'lucide-react';

export const metadata = {
  title: 'ConstructCRM - Revolutionizing Construction Management',
  description: 'The all-in-one CRM designed for modern builders and contractors. Streamline projects, manage clients, and boost productivity with ConstructCRM.',
};

// Hero Section Component
const HeroSection = () => (
  <section className="relative py-20 md:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-white overflow-hidden">
    {/* Subtle background pattern or elements */}
    <div className="absolute inset-0 opacity-10">
      {/* Example: <img src="/path/to/abstract-pattern.svg" alt="" className="w-full h-full object-cover" /> */}
    </div>
    <div className="container mx-auto px-4 text-center relative z-10">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight animate-slide-in"
          style={{ animationDelay: "0.1s" }}>
        Build Smarter, Not Harder with <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-400">ConstructCRM</span>
      </h1>
      <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto animate-fade-in"
         style={{ animationDelay: "0.3s" }}>
        The ultimate CRM designed for builders and contractors. Manage projects, clients, and finances seamlessly, all in one powerful platform.
      </p>
      <div className="space-x-4 animate-fade-in" style={{ animationDelay: "0.5s" }}>
        <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
          <Link href="/sign-up">Get Started Free</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-300 hover:bg-white/10 hover:text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
          <Link href="/pricing">View Pricing</Link>
        </Button>
      </div>
    </div>
  </section>
);

// Feature Item Component
interface FeatureItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: string;
}
const FeatureItem = ({ icon: Icon, title, description, delay = "0s" }: FeatureItemProps) => (
  <div className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-sm shadow-glass rounded-xl text-center animate-fade-in"
       style={{ animationDelay: delay }}>
    <div className="p-3 mb-4 bg-brand-blue/20 rounded-full">
      <Icon className="w-8 h-8 text-brand-blue" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-slate-400 text-sm">{description}</p>
  </div>
);

// Features Section Component
const FeaturesSection = () => (
  <section className="py-16 md:py-24 bg-slate-800">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Why Choose ConstructCRM?</h2>
        <p className="text-slate-400 mt-2 max-w-xl mx-auto">
          Everything you need to manage your construction business efficiently and effectively.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureItem icon={Layers} title="Project Management" description="Track project progress, milestones, and deadlines with ease. Keep everything organized from start to finish." delay="0.1s" />
        <FeatureItem icon={Users} title="Client Relationship" description="Manage client communication, store important details, and build lasting relationships." delay="0.2s" />
        <FeatureItem icon={Zap} title="Task Automation" description="Automate repetitive tasks and streamline your workflows to save time and reduce errors." delay="0.3s" />
        <FeatureItem icon={BarChart} title="Insightful Reporting" description="Gain valuable insights into your business performance with comprehensive reports and analytics." delay="0.4s" />
        <FeatureItem icon={ShieldCheck} title="Secure & Reliable" description="Built with top-notch security to protect your data. Rely on a platform that's always available." delay="0.5s" />
        <FeatureItem icon={CheckCircle} title="Easy to Use" description="Intuitive interface designed for quick adoption, no steep learning curve." delay="0.6s" />
      </div>
    </div>
  </section>
);

// Call to Action Section Component
const CallToActionSection = () => (
  <section className="py-20 md:py-32 bg-gradient-to-br from-brand-blue to-teal-500 text-white">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Construction Business?</h2>
      <p className="text-lg md:text-xl text-slate-100 mb-10 max-w-2xl mx-auto">
        Join hundreds of builders and contractors who trust ConstructCRM to manage their operations.
      </p>
      <Button asChild size="lg" className="bg-white hover:bg-slate-100 text-brand-blue font-semibold px-10 py-4 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105">
        <Link href="/sign-up">Start Your Free Trial Today</Link>
      </Button>
    </div>
  </section>
);


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <CallToActionSection />
        {/* You can add more sections here: Testimonials, How it Works, etc. */}
      </main>
      <Footer />
    </div>
  );
}