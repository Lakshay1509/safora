export default function BentoBox() {
  const features = [
    {
      id: 1,
      title: "Community-Driven Insights",
      description: "Leverages real experiences shared by a growing community of travelers to provide authentic safety assessments of locations worldwide. ",
      size: "sm:col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
    },
    {
      id: 2,
      title: " Geo-Tag your post",
      description: " Have a question about your area? Add a Geo-tag so your post reaches the right local community — people who actually live there. Get faster, more accurate answers and insights that truly matter to your location.",
      size: "sm:col-span-1 md:col-span-2 lg:col-span-2 row-span-1",
    },
    {
      id: 3,
      title: "Real-Time Updates",
      description: "Offers current safety information that reflects changing conditions, helping users avoid potentially risky situations based on the most recent community reports.",
      size: "sm:col-span-1 md:col-span-1 lg:col-span-1 lg:row-span-2 row-span-1",
    },
    {
      id: 4,
      title: "Simple Interface",
      description: "Provides quick, easy-to-understand safety assessments through a clean, intuitive interface designed for fast decision-making on the go.",
      size: "sm:col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
    },
    {
      id: 5,
      title: "AI-Generated Safety Tips",
      description: "Augments human reports with AI analysis to identify patterns and provide additional safety recommendations.",
      size: "sm:col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
    },
    {
      id: 6,
      title: "Seperate reviews",
      description: "Toggle between day and night for a location to get the safety insights.",
      size: "sm:col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
    },
    {
      id: 7,
      title: "Achievements",
      description: "Get unique themes and unique gift from us for contributing to the society",
      size: "sm:col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
    },
  ]

  return (
    <section className="max-w-7xl mx-auto py-12 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 sm:mb-14 md:mb-16 lg:mb-20 max-w-2xl">
        <h1 className="mb-3 sm:mb-4 text-2xl md:text-3xl  font-bold tracking-tight text-black">
         What Can Safe or Not Do?
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-black/70 leading-relaxed">
          Everything you need to travel safely.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`${feature.size} group relative overflow-hidden rounded-xl sm:rounded-2xl border border-black/10 bg-white p-5 sm:p-6 md:p-8 lg:p-10 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-red-500/30`}
          >
            {/* Subtle accent line */}
            <div className="absolute top-0 left-0 h-1 w-12 bg-red-500 transition-all duration-300 group-hover:w-16" />

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <h2 className="mb-2 sm:mb-3 text-lg md:text-2xl font-bold tracking-wider ">
                  {feature.title}
                </h2>
                <p className="text-sm md:text-base  leading-relaxed text-black/60">
                  {feature.description}
                </p>
              </div>

              
              
            </div>
          </div>
        ))}
      </div>

      
    
    </section>
  )
}
