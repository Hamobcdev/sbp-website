import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Platform from "@/components/sections/Platform";
import Gallery from "@/components/sections/Gallery";
import Research from "@/components/sections/Research";
import Blog from "@/components/sections/Blog";
import Education from "@/components/sections/Education";
import Milestones from "@/components/sections/Milestones";
import Media from "@/components/sections/Media";
import Contact from "@/components/sections/Contact";
import SectionDivider from "@/components/ui/SectionDivider";

export default function Home() {
  return (
    <>
      <Hero />
      <SectionDivider bg="white" />
      <About />
      <SectionDivider bg="navy" />
      <Services />
      <SectionDivider bg="navy" />
      <Platform />
      <SectionDivider bg="navy" />
      <Gallery />
      <SectionDivider bg="white" />
      <Research />
      <SectionDivider bg="white" />
      <Blog />
      <SectionDivider bg="navy-mid" />
      <Education />
      <SectionDivider bg="navy-mid" />
      <Milestones />
      <SectionDivider bg="white" />
      <Media />
      <SectionDivider bg="navy" />
      <Contact />
    </>
  );
}
