import Link from 'next/link';
import Image from 'next/image';

export default function TourCard({ tour }) {
  return (
    <div className="card flex flex-col">
      <div className="relative h-52 w-full bg-gray-200">
        {tour.cover_image ? (
          <Image src={tour.cover_image} alt={tour.title} fill className="object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">No image</div>
        )}
        <span className="absolute top-3 left-3 bg-sunset text-forest-dark text-xs font-bold px-3 py-1 rounded-full">
          {tour.duration?.label || `${tour.duration?.days || ''} Days`}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading font-semibold text-lg text-forest-dark">{tour.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{tour.destination?.title}</p>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2 flex-1">{tour.short_description}</p>
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="font-bold text-forest text-lg">Rs. {Number(tour.price).toLocaleString()}</span>
          <span className={tour.available_seats > 0 ? 'text-green-600' : 'text-red-500'}>
            {tour.available_seats > 0 ? `${tour.available_seats} seats left` : 'Sold out'}
          </span>
        </div>
        <div className="flex gap-2 mt-4">
          <Link href={`/tours/${tour.id}`} className="flex-1 text-center border border-forest text-forest rounded-full py-2 text-sm font-semibold hover:bg-forest hover:text-white transition">
            View Details
          </Link>
          <Link href={`/tours/${tour.id}#book`} className="flex-1 text-center bg-forest text-white rounded-full py-2 text-sm font-semibold hover:bg-forest-dark transition">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
