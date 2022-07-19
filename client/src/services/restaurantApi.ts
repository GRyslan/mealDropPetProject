import {coreApi} from './coreApi';

const RESTAURANT_URL=process.env.REACT_APP_MealDrop_Restaurant + "restaurants";
export const restaurantApi = coreApi.injectEndpoints({
  endpoints: (build) => ({
    getAllRestaurants: build.query({
      query: () => ({
        url:  RESTAURANT_URL+`/showAll`,
      }),
    }),
})
  })
