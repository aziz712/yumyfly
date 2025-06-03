import {
    Utensils,
    Clock,
    Shield,
    Brain,
} from 'lucide-react' 



const features = [
    {
        name: 'Quality Restaurants',
        description:
            'Partner with the finest restaurants in your area for the best dining experience.',
        icon: Utensils,
    },
    {
        name: 'Fast Delivery',
        description: "Quick and reliable delivery service to get your food while it's hot.",
        icon: Clock,
    },
    {
        name: 'Secure Platform',
        description: 'Safe and secure transactions with real-time order state tracking.',
        icon: Shield,
    },
     {
    name: 'Smart Recommendations',
    description:
      'Notre système intelligent analyse vos préférences et votre historique pour vous proposer les plats que vous allez adorer.',
    icon: Brain,
  },
]


export default function Example() {
  return (
    <div className="bg-white py-10 sm:py-10">
      <div className="mx-auto max-w-7xl px-1 lg:px-2">
       
        <div className="mx-auto mt-2 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base/7 font-semibold text-gray-900">
                  <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-indigo-600">
                    <feature.icon aria-hidden="true" className="size-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base/7 text-gray-600">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
