import React from "react";
import Image from 'next/image'
// --- Icon Component Definitions (Using Inline SVG for Lucide-like icons) ---

const Icon = ({
  children,
  className = "w-6 h-6",
  color = "currentColor",
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

type IconProps = {
  className?: string;
  color?: string;
};

const BrainIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 16c-3.3 0-6.1-2.2-7.5-5.5.4-2.8 1.4-5 3.3-6.5 2.1-1.7 4.8-2.5 7.7-1.4 3.4 1.3 5.4 4 5.2 7.4-.1 2.3-1 4.5-2.5 6.2-1.9 2.1-4.7 3.3-7.7 3.3z" />
    <path d="M12 2v20" />
   <path d="M16.5 10.5c.3 1.5.1 3-1 4.5-.4.6-.9 1.1-1.5 1.4" />
    <path d="M7.5 13.5c-.3-1.5-.1-3 1-4.5.4-.6.9-1.1 1.5-1.4" />
    <path d="M7 16c1.5.4 3.1.2 4.5-1 1.2-1.1 2-2.7 2-4.5" />
    <path d="M17 16c-1.5.4-3.1.2-4.5-1-1.2-1.1-2-2.7-2-4.5" />
  </Icon>
);

const CheckCircleIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M22 4L12 14.01l-3-3" />
  </Icon>
);

const BarChartIcon = (props: IconProps) => (
  <Icon {...props}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </Icon>
);

const ServerIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </Icon>
);

const GraduationCapIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M21.4 15.6l-5.8-5.7L12 13.8l-3.6-3.9-5.8 5.7c-.4.4-.6 1-.6 1.6s.2 1.2.6 1.6l10 10c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6l10-10c.4-.4.6-1 .6-1.6s-.2-1.2-.6-1.6z" />
    <path d="M12 2l10 10-10 10L2 12z" />
  </Icon>
);

const UsersIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);

const ShieldIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Icon>
);

const QuoteIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M10 11H7a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3v3l5-4.5-5-4.5zM19 11h-3a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3v3l5-4.5-5-4.5z" />
  </Icon>
);

// --- Tailwind Theme Customization (Blue/Orange) ---
// Using custom utility classes for colors
const primaryColor = "text-blue-600";
const primaryBg = "bg-blue-600";
const accentBg = "bg-orange-500";
const accentHoverBg = "hover:bg-orange-600";

// --- Navigation Component ---
const Nav = () => (
  <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
      {/* Logo */}
      <a
        href="#"
        className="flex items-center space-x-2 text-3xl font-bold tracking-tight text-gray-900"
      >
        <GraduationCapIcon className="w-8 h-8" color="#3b82f6" />
        <span className={primaryColor}>Edutron</span>
      </a>

      {/* Nav Links (Desktop) */}
      <nav className="hidden md:flex space-x-8 text-lg font-medium">
        {["Features", "Solutions", "Pricing", "About Us"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(" ", "-")}`}
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            {item}
          </a>
        ))}
      </nav>

      {/* CTA Button */}
      <a
        href="/sign-up"
        className={`px-5 py-2 hidden md:block text-white font-semibold rounded-full ${accentBg} ${accentHoverBg} transition-all shadow-lg hover:shadow-xl`}
      >
        Start Free Trial
      </a>

      {/* Mobile Menu Icon (Placeholder for functionality) */}
      <button className="md:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>
    </div>
  </header>
);

// --- Hero Section Component ---
const Hero = () => (
  <section className="pt-20 pb-32 bg-gray-50 overflow-hidden">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
        {/* Text Content */}
        <div className="col-span-12 lg:col-span-6 text-center lg:text-left mb-12 lg:mb-0">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
            <span className={primaryColor}>AI-Powered Learning,</span>{" "}
            Human-Centered Results.
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-xl mx-auto lg:mx-0">
            Edutron delivers personalized learning paths and automated
            assessment tools that help students thrive and educators reclaim
            their time.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="/sign-up"
              className={`px-8 py-3 text-lg font-bold text-white rounded-full ${accentBg} ${accentHoverBg} transition-all shadow-xl shadow-orange-200`}
            >
              Start Your Free Trial
            </a>
            <a
              href="/sign-up"
              className="px-8 py-3 text-lg font-bold text-blue-600 bg-white border-2 border-blue-200 rounded-full hover:bg-blue-50 transition-colors shadow-md"
            >
              Watch a Demo
            </a>
          </div>

          {/* Social Proof */}
          <p className="mt-8 text-sm text-gray-500 font-medium">
            Trusted by 5,000+ Schools and Universities Worldwide.
          </p>
        </div>

        {/* Visual Placeholder */}
        <div className="col-span-12 lg:col-span-6 flex justify-center lg:justify-end">
          <div className="w-full max-w-md lg:max-w-none bg-blue-100/50 aspect-[4/3] rounded-3xl p-6 shadow-2xl shadow-blue-200/50 border-4 border-white/50 flex items-center justify-center">
                        <img src="https://8331whtezt.ufs.sh/f/KXoBapOHo7mgrPMwohqyC9FtHK0PJcEVlLeIwTAaSQr5NOmW" 
                        alt ="Main dashboard ui "
                        />
          </div>
        </div>
      </div>
    </div>
  </section>
);

// --- Features Section Component ---
const features = [
  {
    icon: BrainIcon,
    title: "Adaptive Learning Paths",
    description:
      "Our AI dynamically adjusts curriculum content and pace for every student, ensuring mastery, not just memorization.",
  },
  {
    icon: CheckCircleIcon,
    title: "Automated Assessment",
    description:
      "Instantly grade quizzes, essays, and coding assignments, providing immediate feedback and detailed analytics to teachers.",
  },
  {
    icon: BarChartIcon,
    title: "Data-Driven Insights",
    description:
      "Intuitive dashboards offer a 360-degree view of student and class performance, highlighting areas of focus for personalized intervention.",
  },
  {
    icon: ServerIcon,
    title: "Seamless LMS Integration",
    description:
      "Works effortlessly with Canvas, Moodle, Blackboard, and more, making deployment simple and fast for administrators.",
  },
];

const Features = () => (
  <section id="features" className="py-24 bg-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-4">
        The Future of <span className={primaryColor}>Education</span> is Here.
      </h2>
      <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16">
        Unlock unprecedented efficiency and student outcomes with Edutron's core
        capabilities.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-gray-50 p-6 rounded-2xl shadow-lg border-t-4 border-blue-500 transform hover:scale-[1.02] transition-transform duration-300"
          >
            <feature.icon className="w-10 h-10 mb-4" color="#3b82f6" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- Solutions Section Component ---
const solutions = [
  {
    icon: UsersIcon,
    title: "For Educators",
    description:
      "Save up to 10 hours a week on grading and administrative tasks. Focus on teaching, powered by insightful data.",
    color: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    icon: GraduationCapIcon,
    title: "For Students",
    description:
      "Experience engaging, personalized content that makes learning relevant and effective. Get instant feedback to stay on track.",
    color: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    icon: ShieldIcon,
    title: "For Administrators",
    description:
      "Improve student retention and success metrics with proven, scalable technology. Deploy easily and see ROI fast.",
    color: "bg-pink-100",
    iconColor: "text-pink-600",
  },
];

const Solutions = () => (
  <section id="solutions" className="py-24 bg-blue-50">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-4">
        Edutron for Every <span className={primaryColor}>Stakeholder</span>.
      </h2>
      <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16">
        Personalized tools to ensure success across the entire institution.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {solutions.map((solution, index) => (
          <div
            key={index}
            className={`p-8 rounded-3xl shadow-xl ${solution.color} transition-all duration-300 hover:shadow-2xl`}
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${solution.iconColor} bg-white/70 shadow-md`}
            >
              <solution.icon
                className="w-7 h-7"
                // Just use a color that works for now
                color="#10b981"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {solution.title}
            </h3>
            <p className="text-lg text-gray-700">{solution.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- Testimonial Section Component ---
const Testimonials = () => (
  <section className="py-24 bg-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <QuoteIcon className="w-12 h-12 mx-auto mb-6 text-orange-500" />
        <p className="text-2xl md:text-3xl font-serif italic text-gray-800 leading-relaxed">
          "Edutron didn't just save us time; it fundamentally changed how our
          teachers engage with data. Our student success rates are up 15% in
          just one academic year."
        </p>
        <div className="mt-8">
          <p className="text-xl font-bold text-gray-900">– Dr. Anya Sharma</p>
          <p className="text-lg text-gray-600">
            Superintendent, Metropolis School District
          </p>
        </div>
      </div>
    </div>
  </section>
);

// --- Final CTA Section Component ---
const FinalCTA = () => (
  <section id="trial" className="py-24 bg-gray-900">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
        Ready to Build the Classroom of Tomorrow?
      </h2>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
        Join the thousands of educational institutions making learning more
        powerful and personalized. No credit card required.
      </p>

      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <a
          href="/sign-up"
          className={`px-10 py-4 text-xl font-bold text-white rounded-full ${accentBg} ${accentHoverBg} transition-all shadow-xl shadow-orange-500/50 transform hover:scale-[1.05]`}
        >
          Get Started Today
        </a>
        <a
          href="#"
          className="px-10 py-4 text-xl font-bold text-white bg-transparent border-2 border-white rounded-full hover:bg-white hover:text-gray-900 transition-colors"
        >
          Book a Consultation
        </a>
      </div>
    </div>
  </section>
);

// --- Footer Component ---
const Footer = () => (
  <footer className="bg-gray-800 text-white py-12">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h4 className="text-xl font-bold mb-4">Edutron</h4>
          <p className="text-gray-400 text-sm">
            Empowering educators, transforming futures.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <a href="#features" className="hover:text-blue-400">
                Features
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Pricing
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Integrations
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Security
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <a href="#about-us" className="hover:text-blue-400">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Press
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <a href="#" className="hover:text-blue-400">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Partners
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Edutron, Inc. All rights reserved.
      </div>
    </div>
  </footer>
);

// --- Main App Component ---
export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Features />
      <Solutions />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </>
  );
}
