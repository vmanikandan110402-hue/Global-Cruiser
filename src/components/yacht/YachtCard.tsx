import { Link } from 'react-router-dom';
import { Users, Bed, Ruler, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface YachtCardProps {
  id: string;
  name: string;
  feet: number;
  maxCapacity: number;
  bedrooms: number;
  hourlyPrice: number;
  images: string[];
  amenities: string[];
  offer?: any;
}

const YachtCard = ({ id, name, feet, maxCapacity, bedrooms, hourlyPrice, images, amenities, offer }: YachtCardProps) => {
  return (
    <div className="card-luxury group">
      <div className="relative h-64 overflow-hidden">
        <img
          src={images[0] || '/placeholder.svg'}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        
        {/* Offer Badge */}
        {offer && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-destructive to-accent text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Tag className="w-3 h-3" />
            {offer.discount_percentage}% OFF
          </div>
        )}
        
        <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
          AED {hourlyPrice.toLocaleString()}/hr
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
          {name}
        </h3>

        <div className="flex items-center gap-6 mb-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-primary" />
            <span className="text-sm">{feet} ft</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm">{maxCapacity} guests</span>
          </div>
          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4 text-primary" />
            <span className="text-sm">{bedrooms} cabins</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {amenities.slice(0, 3).map((amenity) => (
            <span key={amenity} className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
              {amenity}
            </span>
          ))}
          {amenities.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
              +{amenities.length - 3} more
            </span>
          )}
        </div>

        <Button variant="outline" className="w-full group/btn" asChild>
          <Link to={`/yacht/${id}`}>
            View Details
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default YachtCard;
