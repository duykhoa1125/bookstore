import { BookOpen, Users, Award, Heart, Leaf, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function About() {
  // Values for bento grid
  const values = [
    {
      icon: Users,
      title: 'Curated by Humans',
      description: 'Every book is selected by passionate readers, not algorithms. Real people who love stories choose what makes it to our shelves.',
    },
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'Eco-friendly packaging and carbon-neutral shipping. We care about the planet as much as we care about books.',
    },
    {
      icon: Heart,
      title: 'Community First',
      description: 'Supporting local authors, hosting book clubs, and creating spaces where readers connect and share their love for literature.',
    },
    {
      icon: Award,
      title: 'Quality Over Quantity',
      description: 'A thoughtfully curated collection, not an overwhelming catalog. Each title earns its place through excellence.',
    },
    {
      icon: BookOpen,
      title: 'Knowledge Accessibility',
      description: 'Affordable prices and diverse genres for every reader. Education and entertainment should be accessible to all.',
    },
    {
      icon: Star,
      title: 'Customer Obsessed',
      description: 'White-glove service from browsing to delivery. Your reading experience is our highest priority.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SECTION 1: Hero */}
      <section className="relative py-32 px-4 overflow-hidden min-h-screen flex items-center">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-600 mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Reimagining the Bookstore Experience
          </div>
          
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-tight">
            More Than Just A Bookstore
            <span className="text-blue-600 block">
              A Sanctuary for Stories
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We believe books are bridges to other worlds. Discover a curated collection chosen by readers, for readers.
          </p>
        </div>
      </section>

      {/* SECTION 2: Mission Statement */}
      <section className="py-32 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <p className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-relaxed mb-6">
              "We believe books are bridges to other worlds. We don't just sell paper; we curate experiences."
            </p>
            <footer className="text-lg text-gray-500 font-medium">
              — The Bookstore Team
            </footer>
          </div>
        </div>
      </section>

      {/* SECTION 3: Values Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <div 
                key={value.title}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
              >
                <value.icon className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: CTA */}
      <section className="py-20 px-4 text-center">
        <Link 
          to="/books"
          className="px-10 py-5 bg-blue-600 text-white font-bold text-lg rounded-full hover:bg-blue-700 inline-flex items-center gap-3"
        >
          Explore Our Collection
          <span className="text-2xl">→</span>
        </Link>
      </section>
    </div>
  )
}
