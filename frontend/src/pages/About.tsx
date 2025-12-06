import { BookOpen, Users, Award, Sparkles, Globe, Coffee } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Neo-Minimalist Hero */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/50 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-sm font-semibold text-gray-600 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Reimagining the Bookstore
          </div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 mb-8 leading-tight">
            More than just <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">pages & ink.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            We are building the future of reading, connecting stories with souls through technology and design.
          </p>
        </div>
      </section>

      {/* Bento Grid Values */}
      <section className="py-20 px-4 bg-gray-50/50">
        <div className="container mx-auto max-w-6xl">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Card */}
              <div className="md:col-span-2 bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Global Reach, Local Soul</h3>
                <p className="text-lg text-gray-500 leading-relaxed">
                   We source books from corners of the world you've never heard of, bringing diverse voices and stories directly to your doorstep. Our mission is to make the world smaller, one book at a time.
                </p>
              </div>

              {/* Stat Card 1 */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-3xl text-white shadow-lg flex flex-col justify-between">
                 <BookOpen className="w-10 h-10 opacity-80" />
                 <div>
                    <span className="text-5xl font-bold block mb-1">10k+</span>
                    <span className="text-blue-100">Curated Titles</span>
                 </div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
                 <div className="flex items-center justify-between mb-8">
                    <Users className="w-10 h-10 text-purple-500" />
                    <span className="text-3xl font-bold text-gray-900">50k+</span>
                 </div>
                 <p className="text-gray-500 font-medium">Happy readers joining our community every month.</p>
              </div>

              {/* Feature Card */}
              <div className="md:col-span-2 bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-center gap-10">
                 <div className="flex-1">
                    <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                      <Sparkles className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Quality & Craftsmanship</h3>
                    <p className="text-lg text-gray-500 leading-relaxed">
                       Every book in our collection is hand-picked for its literary merit and physical beauty. We believe in the power of a well-made book.
                    </p>
                 </div>
                 <div className="w-full md:w-1/3 aspect-square bg-gray-100 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 opacity-50" />
                    <Award className="w-24 h-24 text-gray-300 transform group-hover:scale-110 transition-transform duration-500" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Team/Culture */}
      <section className="py-32 px-4">
         <div className="container mx-auto max-w-4xl text-center">
            <Coffee className="w-12 h-12 text-gray-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Built by Book Lovers</h2>
            <p className="text-xl text-gray-500 leading-relaxed mb-12">
               We're a team of readers, writers, and dreamers. When we aren't shipping code or packing orders, you'll find us debating the ending of our latest book club pick.
            </p>
            <button className="px-8 py-4 rounded-full bg-gray-900 text-white font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
               Join Our Team
            </button>
         </div>
      </section>
    </div>
  )
}
