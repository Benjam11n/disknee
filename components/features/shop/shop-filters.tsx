import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search } from 'lucide-react';

interface ShopFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  sortBy: 'name' | 'price-asc' | 'price-desc';
  setSortBy: (value: 'name' | 'price-asc' | 'price-desc') => void;
  categories: string[];
  resultsCount: number;
}

export function ShopFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categories,
  resultsCount,
}: ShopFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Browse Items
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 flex-1">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'name' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('name')}
            >
              Name
            </Button>
            <Button
              variant={sortBy === 'price-asc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('price-asc')}
            >
              Price ↑
            </Button>
            <Button
              variant={sortBy === 'price-desc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('price-desc')}
            >
              Price ↓
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {resultsCount} {resultsCount === 1 ? 'item' : 'items'} found
        </div>
      </CardContent>
    </Card>
  );
}
