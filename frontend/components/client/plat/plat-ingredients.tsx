import { Check } from "lucide-react";

interface PlatIngredientsProps {
  ingredients: string[];
}

export default function PlatIngredients({ ingredients }: PlatIngredientsProps) {
  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Ingrédients</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <span className="text-gray-700">{ingredient}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
