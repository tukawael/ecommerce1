import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@shared/schema";

type CategoryCardProps = {
  category: Category;
};

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <Link href={`/products?category=${category.slug}`}>
      <Card className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="aspect-w-1 aspect-h-1 relative">
          <img 
            src={category.imageUrl} 
            alt={`${category.name} category`} 
            className="w-full h-48 object-cover object-center" 
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-center">{category.name}</h3>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
