import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import DifferentiationSection from "@/components/landing/DifferentiationSection";
import ProductVisualSection from "@/components/landing/ProductVisualSection";
import DiagnosticSection from "@/components/landing/DiagnosticSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => (
  <div className="min-h-screen" style={{ background: "#0C1222" }}>
    <Navbar />
    <main>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <DifferentiationSection />
      <ProductVisualSection />
      <DiagnosticSection />
      <CTASection />
    </main>
    <Footer />
  </div>
);

export default Index;
