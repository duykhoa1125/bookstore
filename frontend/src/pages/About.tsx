import { BookOpen, Users, Award, Sparkles, Heart, Leaf, Star, Globe } from 'lucide-react'
import { AnimatedText } from '../components/about/AnimatedText'
import { ScrollReveal } from '../components/about/ScrollReveal'
import { TiltCard } from '../components/about/TiltCard'
import { MagneticButton } from '../components/about/MagneticButton'
import { StatsMilestones } from '../components/StatsMilestones'
import { Marquee } from '../components/effects/Marquee'
import { GeometricBackground } from '../components/about/GeometricBackground'

export default function About() {
  // Values for bento grid
  const values = [
    {
      icon: Users,
      title: 'Curated by Humans',
      description: 'Every book is selected by passionate readers, not algorithms. Real people who love stories choose what makes it to our shelves.',
      gradient: 'from-blue-500 to-cyan-400',
      bgGradient: 'from-blue-500/10 to-cyan-400/10',
    },
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'Eco-friendly packaging and carbon-neutral shipping. We care about the planet as much as we care about books.',
      gradient: 'from-green-500 to-emerald-400',
      bgGradient: 'from-green-500/10 to-emerald-400/10',
    },
    {
      icon: Heart,
      title: 'Community First',
      description: 'Supporting local authors, hosting book clubs, and creating spaces where readers connect and share their love for literature.',
      gradient: 'from-rose-500 to-pink-400',
      bgGradient: 'from-rose-500/10 to-pink-400/10',
    },
    {
      icon: Award,
      title: 'Quality Over Quantity',
      description: 'A thoughtfully curated collection, not an overwhelming catalog. Each title earns its place through excellence.',
      gradient: 'from-amber-500 to-orange-400',
      bgGradient: 'from-amber-500/10 to-orange-400/10',
    },
    {
      icon: BookOpen,
      title: 'Knowledge Accessibility',
      description: 'Affordable prices and diverse genres for every reader. Education and entertainment should be accessible to all.',
      gradient: 'from-purple-500 to-violet-400',
      bgGradient: 'from-purple-500/10 to-violet-400/10',
    },
    {
      icon: Star,
      title: 'Customer Obsessed',
      description: 'White-glove service from browsing to delivery. Your reading experience is our highest priority.',
      gradient: 'from-indigo-500 to-blue-400',
      bgGradient: 'from-indigo-500/10 to-blue-400/10',
    },
  ]

  // Atmosphere images for marquee (placeholder book imagery)
  const atmosphereImages = [
    { id: 1, alt: 'Cozy reading corner' },
    { id: 2, alt: 'Bookshelf collection' },
    { id: 3, alt: 'Open book on table' },
    { id: 4, alt: 'Library atmosphere' },
    { id: 5, alt: 'Reading nook' },
    { id: 6, alt: 'Book stack' },
    { id: 7, alt: 'Vintage books' },
    { id: 8, alt: 'Coffee and book' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* SECTION 1: Hero with Animated Text */}
      <section className="relative py-32 px-4 overflow-hidden min-h-screen flex items-center">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none animate-blob" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/50 rounded-full blur-[120px] -ml-20 -mb-20 pointer-events-none animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-teal-100/30 rounded-full blur-[100px] animate-blob animation-delay-4000" />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-sm font-semibold text-gray-600 mb-8 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Reimagining the Bookstore Experience
          </div>
          
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-tight">
            <AnimatedText 
              text="More Than Just A Bookstore"
              className="block mb-4"
            />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-xy block">
              A Sanctuary for Stories
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fadeIn animation-delay-500">
            We believe books are bridges to other worlds. Discover a curated collection chosen by readers, for readers.
          </p>
        </div>
      </section>

      {/* SECTION 2: Mission Statement with Scroll Reveal */}
      <section className="py-32 px-4 bg-white/40 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal>
            <blockquote className="text-center">
              <p className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-relaxed mb-6">
                "We believe books are bridges to other worlds. We don't just sell paper; we curate experiences."
              </p>
              <footer className="text-lg text-gray-500 font-medium">
                — The Bookstore Team
              </footer>
            </blockquote>
          </ScrollReveal>
        </div>
      </section>

      {/* SECTION 3: Values Bento Grid with 3D Tilt */}
      <section className="py-20 px-4 bg-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <TiltCard
                key={value.title}
                className="h-full"
                maxTilt={8}
              >
                <div 
                  className="glass-card h-full p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                  
                  {/* Decorative corner dot */}
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r ${value.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Atmosphere - Enhanced with Geometric Background */}
      <section className="py-32 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden relative">
        {/* Geometric Background */}
        <div className="absolute inset-0 opacity-40">
          <GeometricBackground />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-glow animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="mb-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-semibold text-white mb-6 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Immersive Experience
            </div>
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              The Atmosphere
            </h2>
            <p className="text-gray-300 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
              Where stories come to life through design and imagination
            </p>
          </div>

          {/* Interactive Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {atmosphereImages.slice(0, 8).map((img, index) => (
              <div
                key={img.id}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card */}
                <div className="relative h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2">
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center p-6 z-10">
                    {/* Decorative circles */}
                    <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-xl group-hover:scale-150 transition-transform duration-500" />
                    
                    <BookOpen className="w-20 h-20 text-purple-400 mb-6 group-hover:text-purple-300 group-hover:scale-110 transition-all duration-300" />
                    <span className="text-gray-400 text-base font-medium text-center group-hover:text-white transition-colors duration-300">
                      {img.alt}
                    </span>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>

                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-transparent group-hover:to-purple-500/10 transition-all duration-500" />
                </div>

                {/* Floating particles on hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/50 to-pink-600/50 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </div>
            ))}
          </div>

          {/* Marquee Section */}
          <div className="mt-16">
            <Marquee speed={50} className="mb-6">
              {atmosphereImages.map((img) => (
                <div 
                  key={`marquee-${img.id}`}
                  className="w-72 h-48 rounded-2xl bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 mx-3 group"
                >
                  <div className="flex flex-col items-center gap-3 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <BookOpen className="w-6 h-6 text-purple-300" />
                    </div>
                    <span className="text-gray-400 text-sm font-medium group-hover:text-white transition-colors">{img.alt}</span>
                  </div>
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300" />
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </section>

      {/* SECTION 5: Statistics (Reuse existing component) */}
      <StatsMilestones />

      {/* SECTION 6: CTA with Magnetic Button */}
      <section className="py-32 px-4 bg-gray-900 relative overflow-hidden">
        {/* Spotlight effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-glow" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <Globe className="w-16 h-16 text-blue-400 mx-auto mb-8 animate-float" />
          
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
            Begin Your Literary Journey
          </h2>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Explore our curated collection of over 10,000 titles, from timeless classics to contemporary bestsellers.
          </p>
          
          <MagneticButton 
            href="/books"
            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-purple-500/50 inline-flex items-center gap-3"
            maxDistance={20}
          >
            <Sparkles className="w-6 h-6" />
            Explore Our Collection
            <span className="text-2xl">→</span>
          </MagneticButton>
        </div>
      </section>
    </div>
  )
}
