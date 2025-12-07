import { BookOpen, Users, Award, Sparkles, Heart, Package, Leaf, Star, Globe } from 'lucide-react'
import { AnimatedText } from '../components/about/AnimatedText'
import { ScrollReveal } from '../components/about/ScrollReveal'
import { TiltCard } from '../components/about/TiltCard'
import { MagneticButton } from '../components/about/MagneticButton'
import { StatsMilestones } from '../components/StatsMilestones'
import { Marquee } from '../components/effects/Marquee'

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

      {/* SECTION 4: Atmosphere Marquee */}
      <section className="py-20 bg-gray-900 overflow-hidden">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
            The Atmosphere
          </h2>
          <p className="text-gray-400 text-lg">
            Where stories come to life
          </p>
        </div>

        <Marquee speed={30} className="mb-6">
          {atmosphereImages.map((img) => (
            <div 
              key={img.id}
              className="w-80 h-64 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10 hover:border-purple-500/50 transition-colors grayscale hover:grayscale-0"
            >
              <div className="flex flex-col items-center gap-4 opacity-50">
                <BookOpen className="w-16 h-16 text-gray-600" />
                <span className="text-gray-500 text-sm">{img.alt}</span>
              </div>
            </div>
          ))}
        </Marquee>
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
