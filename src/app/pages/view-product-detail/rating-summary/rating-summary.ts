import { Component, computed, input } from '@angular/core';
import { Product } from '../../../models/product';
import { StarRating } from "../../../components/star-rating/star-rating";

@Component({
  selector: 'app-rating-summary',
  imports: [StarRating],
  template: `
    <div class="flex items-center gap-8 mb-6 p-4 bg- gray-50 rounded-lg">
      <!--Overall Rating Display-->

      <div class="flex flex-col items-center w-1/2">
<div class="text-4xl font-bold text-gray-900 mb-1">{{ product().rating || 0 }}</div>
<div class="flex items-center mb-2">
  <app-star-rating [rating]="product().rating || 0" />
  </div>
<div class="text-sm text-gray-500">Based on {{ totalReviews() }} reviews</div>
      </div>
      <div class="flex-1">

@for (breakdown of ratingBreakdown(); track breakdown.stars) {

<div class="flex items-center gap-2 mb-2">

<span class="text-sm w-4">{{ breakdown.stars }}*</span>

<div class="flex-1 bg-gray-200 rounded-full h-2 mx-2">

<div

class="bg-yellow-400 h-2 rounded-full transition-all duration-300"

[style.width.%]="breakdown.percentage"

></div>

</div>

<span class="text-sm text-gray-500 w-8 text-right">{{ breakdown.count }}</span>

      </div>

}

  `,
  styles: ``,
})
export class RatingSummary {
product=input.required<Product>();

totalReviews = computed(() => this.product().reviews?.length || 0);

ratingBreakdown = computed(() => {
  const reviews = this.product().reviews || [];
  const total = reviews.length;

  if (total === 0) return [5,4,3,2,1].map(stars => ({
    stars,
    count: 0,
    percentage: 0,
  }));
  const counts = [5,4,3,2,1].map(stars => {
    const count = reviews.filter((review) => review.rating === stars).length;
    return {
      stars,
      count,
      percentage: (count / total) * 100,
    };
  });

  return  counts ;
});
}
