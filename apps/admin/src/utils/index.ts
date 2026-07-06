import * as _ from 'lodash';
import { NextRouter } from 'next/router';

export const getUserStatusOptions = () => [
  { value: 'PENDING', label: 'PENDING' },
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'BLOCKED', label: 'BLOCKED' },
];

export const getGeneralStatusOptions = () => [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export const getSeverity = (key: string) => {
  switch (key) {
    case 'ACTIVE':
    case 'CONFIRMED':
    case 'COMPLETED':
    case 'REVENUE':
      return 'success';

    case 'INACTIVE':
    case 'EXPIRED':
    case 'CANCELED':
    case 'BLOCKED':
    case 'EXPENSE':
      return 'danger';

    case 'PENDING':
    case 'LOCKED':
    case 'REFUNDED':
      return 'warning';

    default:
      return null;
  }
};

export const getFormData = (payload: any) => {
  const formData = new FormData();

  for (const key in payload) {
    // console.debug(key, payload[key], payload[key].name);

    if (_.isUndefined(payload[key]) || _.isNull(payload[key])) continue;

    if (payload[key] instanceof File) {
      formData.append(key, payload[key], payload[key].name);
    } else {
      formData.append(key, payload[key]);
    }
  }

  return formData;
};

export const generateQueryPath = (
  pathname: string,
  pathParams?: any | null,
  queryParams?: any | null,
): string => {
  // console.debug({ pathname, pathParams, queryParams });

  let path: string = pathname;

  if (
    !_.isEmpty(pathname) &&
    _.includes(pathname, '[') &&
    _.includes(pathname, ']') &&
    !_.isUndefined(pathParams) &&
    !_.isNull(pathParams) &&
    !_.isEmpty(pathParams)
  ) {
    path = _.reduce(
      pathParams,
      (result, value, key) => {
        // console.debug({ result, value, key });

        return _.replace(result, `[${key}]`, value);
      },
      pathname,
    );
  }

  return _.reduce(
    queryParams,
    (result, value, key) => {
      // console.debug({ result, value, key });

      // If query param property is same as path param
      if (
        !_.isUndefined(pathParams) &&
        !_.isNull(pathParams) &&
        !_.isEmpty(pathParams) &&
        Boolean(pathParams[key])
      )
        return result;

      return `${result}${result === path ? '?' : '&'}${key}=${value}`;
    },
    path,
  );
};

export interface ITripType {
  dateType: string;
  accommodationType: string;
  transportationType: string;
  foodType: string;
}

export const getTripType = (router: NextRouter): ITripType => {
  const types = {} as ITripType;

  if (router.query.type === '0000') {
    types.dateType = 'FIXED';
    types.accommodationType = 'FIXED';
    types.transportationType = 'FIXED';
    types.foodType = 'FIXED';
  } else if (router.query.type === '1100') {
    types.dateType = 'ON_DEMAND_SINGLE';
    types.accommodationType = 'ON_DEMAND_ROOM_SEAT';
    types.transportationType = 'FIXED';
    types.foodType = 'FIXED';
  }

  return types;
};

export const isJSONString = (string: string) => {
  try {
    JSON.parse(string);
    return true;
  } catch (error) {
    return false;
  }
};

export const getTripGeneralTypeOptions = [
  { label: 'Aerial Sightseeing Tour', value: 'AERIAL_SIGHTSEEING_TOUR' },
  { label: 'Adventure Trip', value: 'ADVENTURE_TRIP' },
  { label: 'Art and Culture Exploration', value: 'ART_CULTURE_EXPLORATION' },
  { label: 'Artistic Residency', value: 'ARTISTIC_RESIDENCY' },
  { label: 'Astrophotography Tour', value: 'ASTROPHOTOGRAPHY_TOUR' },
  { label: 'Backpacking Trip', value: 'BACKPACKING_TRIP' },
  { label: 'Bicycle Touring', value: 'BICYCLE_TOURING' },
  { label: 'Business Trip', value: 'BUSINESS_TRIP' },
  { label: 'City Break', value: 'CITY_BREAK' },
  { label: 'Color or Flower Festival Tour', value: 'COLOR_FLOWER_FESTIVAL_TOUR' },
  { label: 'Comic-Con or Fandom Convention Trip', value: 'COMIC_CON_FANDOM_CONVENTION_TRIP' },
  { label: 'Cruise', value: 'CRUISE' },
  { label: 'Culinary Cruise', value: 'CULINARY_CRUISE' },
  { label: 'Culinary Tour', value: 'CULINARY_TOUR' },
  { label: 'Cultural Exchange Program', value: 'CULTURAL_EXCHANGE_PROGRAM' },
  { label: 'Cultural Trip', value: 'CULTURAL_TRIP' },
  { label: 'Digital Nomad Trip', value: 'DIGITAL_NOMAD_TRIP' },
  { label: 'Educational Trip', value: 'EDUCATIONAL_TRIP' },
  {
    label: 'Environmental Conservation Expedition',
    value: 'ENVIRONMENTAL_CONSERVATION_EXPEDITION',
  },
  { label: 'Family Trip', value: 'FAMILY_TRIP' },
  { label: 'Farming or Agritourism', value: 'FARMING_AGRITOURISM' },
  { label: 'Festival or Event Trip', value: 'FESTIVAL_EVENT_TRIP' },
  { label: 'Festival of Lights Tour', value: 'FESTIVAL_OF_LIGHTS_TOUR' },
  { label: 'Film and TV Location Tour', value: 'FILM_TV_LOCATION_TOUR' },
  { label: 'Fishing Expedition', value: 'FISHING_EXPEDITION' },
  { label: 'Fossil Hunting Expedition', value: 'FOSSIL_HUNTING_EXPEDITION' },
  { label: 'Gastronomic Tour', value: 'GASTRONOMIC_TOUR' },
  { label: 'Ghost Tour', value: 'GHOST_TOUR' },
  { label: 'Group Trip', value: 'GROUP_TRIP' },
  { label: 'Hajj', value: 'HAJJ' },
  { label: 'Historical Reenactment Trip', value: 'HISTORICAL_REENACTMENT_TRIP' },
  { label: 'Historical Tour', value: 'HISTORICAL_TOUR' },
  { label: 'Honeymoon Trip', value: 'HONEYMOON_TRIP' },
  { label: 'House Swap Vacation', value: 'HOUSE_SWAP_VACATION' },
  { label: 'Houseboat Vacation', value: 'HOUSEBOAT_VACATION' },
  { label: 'Language Immersion Trip', value: 'LANGUAGE_IMMERSION_TRIP' },
  { label: 'Leisure or Vacation Trip', value: 'LEISURE_VACATION_TRIP' },
  { label: 'Literary Tour', value: 'LITERARY_TOUR' },
  { label: 'Luxury Trip', value: 'LUXURY_TRIP' },
  { label: 'Maritime Exploration', value: 'MARITIME_EXPLORATION' },
  { label: 'Medical Trip', value: 'MEDICAL_TRIP' },
  { label: 'Micronation Exploration', value: 'MICRONATION_EXPLORATION' },
  { label: 'Mindfulness and Yoga Retreat', value: 'MINDFULNESS_YOGA_RETREAT' },
  { label: 'Motorhome or Camper Van Trip', value: 'MOTORHOME_CAMPER_VAN_TRIP' },
  { label: 'Motorcycle Tour', value: 'MOTORCYCLE_TOUR' },
  { label: 'Mystery or Adventure Tour', value: 'MYSTERY_ADVENTURE_TOUR' },
  { label: 'Nature Retreat', value: 'NATURE_RETREAT' },
  { label: 'Nomadic Living', value: 'NOMADIC_LIVING' },
  { label: 'Off-the-Grid Retreat', value: 'OFF_THE_GRID_RETREAT' },
  { label: 'Paddleboarding Expedition', value: 'PADDLEBOARDING_EXPEDITION' },
  { label: 'Parent-Child Bonding Trip', value: 'PARENT_CHILD_BONDING_TRIP' },
  { label: 'Paragliding Adventure', value: 'PARAGLIDING_ADVENTURE' },
  { label: 'Photography Expedition', value: 'PHOTOGRAPHY_EXPEDITION' },
  { label: 'Pilgrimage', value: 'PILGRIMAGE' },
  { label: 'Rafting Expedition', value: 'RAFTING_EXPEDITION' },
  { label: 'Rail Journey', value: 'RAIL_JOURNEY' },
  { label: 'Rail-to-Trail Biking Trip', value: 'RAIL_TO_TRAIL_BIKING_TRIP' },
  { label: 'Road Trip', value: 'ROAD_TRIP' },
  { label: 'Rock Climbing and Outdoor Adventure', value: 'ROCK_CLIMBING_OUTDOOR_ADVENTURE' },
  { label: 'Safari', value: 'SAFARI' },
  { label: 'Sailing Expedition', value: 'SAILING_EXPEDITION' },
  { label: 'Scuba Diving Expedition', value: 'SCUBA_DIVING_EXPEDITION' },
  { label: 'Solo Trip', value: 'SOLO_TRIP' },
  { label: 'Space Tourism', value: 'SPACE_TOURISM' },
  { label: 'Sustainable Travel Expedition', value: 'SUSTAINABLE_TRAVEL_EXPEDITION' },
  { label: 'Surfing Safari', value: 'SURFING_SAFARI' },
  { label: 'Tea Tour', value: 'TEA_TOUR' },
  { label: 'Trekking Expedition', value: 'TREKKING_EXPEDITION' },
  { label: 'Umrah', value: 'UMRAH' },
  { label: 'Underwater Adventure', value: 'UNDERWATER_ADVENTURE' },
  { label: 'Unplug and Digital Detox Retreat', value: 'UNPLUG_DIGITAL_DETOX_RETREAT' },
  { label: 'Volunteer Service Trip', value: 'VOLUNTEER_SERVICE_TRIP' },
  { label: 'Wine Tour', value: 'WINE_TOUR' },
  { label: 'Winter Sports Trip', value: 'WINTER_SPORTS_TRIP' },
  { label: 'Wellness Retreat', value: 'WELLNESS_RETREAT' },
];
